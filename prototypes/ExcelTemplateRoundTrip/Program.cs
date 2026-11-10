// Protótipo da Story 1.1 (exportação Excel sob encomenda).
// Preenche um modelo .xlsx/.xlsm a partir de uma Configuração de mapeamento declarativa (JSON)
// e de um conjunto de dados (JSON), sem executar VBA e sem tocar em células de fórmula.
//
// Uso: dotnet run -- <modelo.xlsm> <mapeamento.json> <dados.json> <saida.xlsm>

using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

if (args.Length != 4)
{
    Console.Error.WriteLine("Uso: <modelo> <mapeamento.json> <dados.json> <saida>");
    return 2;
}

var (templatePath, mappingPath, dataPath, outputPath) = (args[0], args[1], args[2], args[3]);
var jsonOpts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true, ReadCommentHandling = JsonCommentHandling.Skip };
var mapping = JsonSerializer.Deserialize<Mapping>(File.ReadAllText(mappingPath), jsonOpts)!;
using var dataDoc = JsonDocument.Parse(File.ReadAllText(dataPath), new JsonDocumentOptions { CommentHandling = JsonCommentHandling.Skip });

File.Copy(templatePath, outputPath, overwrite: true);
var report = new Report();

using (var doc = SpreadsheetDocument.Open(outputPath, isEditable: true))
{
    var filler = new Filler(doc, report);

    // 1) Células avulsas no nível do arquivo.
    foreach (var c in mapping.Cells)
        filler.Write(c.Sheet, c.Cell, Data.Resolve(dataDoc.RootElement, c.Field) ?? c.Fallback, c.Type);

    // 2) Slots de Grupo: cada Grupo ocupa uma aba-slot fixa do modelo.
    var gs = mapping.GroupSlots;
    var grupos = Data.Resolve(dataDoc.RootElement, gs.Source) is JsonElement arr && arr.ValueKind == JsonValueKind.Array
        ? arr.EnumerateArray().ToList() : new List<JsonElement>();
    if (grupos.Count > gs.Sheets.Count)
        report.Warn($"{grupos.Count} Grupos para {gs.Sheets.Count} abas-slot; {grupos.Count - gs.Sheets.Count} Grupo(s) não couberam.");

    var renames = new Dictionary<string, string>();
    for (var i = 0; i < gs.Sheets.Count; i++)
    {
        var sheet = gs.Sheets[i];
        JsonElement? grupo = i < grupos.Count ? grupos[i] : null;

        // Limpa entradas do slot (nunca fórmulas) antes de preencher.
        foreach (var c in gs.Cells) filler.Clear(sheet, c.Cell);
        foreach (var b in gs.RowBlocks)
            for (var r = b.FirstRow; r < b.FirstRow + b.Capacity; r++)
                foreach (var col in b.ClearColumns.Expand())
                    filler.Clear(sheet, $"{col}{r}");

        if (grupo is null)
        {
            // Slot vazio: fórmulas do resumo tratam como célula inexistente; a aba fica oculta
            // para não exibir o nome de aba herdado do modelo.
            if (gs.EmptySlotName is not null)
            {
                // Como no modelo original ("Celula 7"): a aba fica visível, vazia, com nome genérico.
                var generico = gs.EmptySlotName.Replace("{n}", (i + 1).ToString(CultureInfo.InvariantCulture));
                if (generico != sheet) renames[sheet] = generico;
            }
            else if (gs.HideUnusedSlots) filler.Hide(sheet);
            continue;
        }

        foreach (var c in gs.Cells)
            filler.Write(sheet, c.Cell, Data.Resolve(grupo.Value, c.Field), c.Type);

        foreach (var b in gs.RowBlocks)
        {
            var pessoas = (Data.Resolve(grupo.Value, b.Source) is JsonElement pa && pa.ValueKind == JsonValueKind.Array
                    ? pa.EnumerateArray() : Enumerable.Empty<JsonElement>())
                .Where(p => b.Filter is null || b.Filter.All(f => Data.Resolve(p, f.Key)?.ToString() == f.Value))
                .ToList();
            if (pessoas.Count > b.Capacity)
                report.Warn($"Aba '{sheet}', bloco '{b.Name}': {pessoas.Count} pessoas para {b.Capacity} linhas; {pessoas.Count - b.Capacity} não couberam.");
            for (var k = 0; k < Math.Min(pessoas.Count, b.Capacity); k++)
                foreach (var (col, colMap) in b.Columns)
                    filler.Write(sheet, $"{col}{b.FirstRow + k}", Data.Resolve(pessoas[k], colMap.Field), colMap.Type);
        }

        if (gs.RenameSheetFrom is not null && Data.Resolve(grupo.Value, gs.RenameSheetFrom)?.ToString() is { Length: > 0 } nome)
            renames[sheet] = SheetNames.Sanitize(nome);
    }

    // 3) Renomear abas reescrevendo referências em fórmulas, validações, formatação condicional e nomes definidos.
    filler.RenameSheets(renames);

    // 3a) Abas-slot na mesma ordem das linhas do resumo (só trocam de lugar entre si; as demais abas não se movem).
    if (gs.OrderSlotTabs)
        filler.OrderSlotTabs(gs.Sheets.Select(n => renames.GetValueOrDefault(n, n)).ToList());

    // 3b) Aba que abre primeiro. O Excel reexibe uma aba oculta se ela for a ativa.
    filler.SetActiveSheet(mapping.OpenOnSheet);

    // 4) Remover textos compartilhados sem uso: os valores apagados do modelo (nomes, telefones)
    //    continuariam legíveis dentro do pacote mesmo sem nenhuma célula apontando para eles.
    filler.CompactSharedStrings();

    // 4b) Remover resultados em cache das fórmulas: foram calculados com os dados antigos do modelo
    //     (vazariam nomes e mostrariam números errados em visualizadores que não recalculam).
    filler.StripFormulaCache();

    // 5) Pedir recálculo completo ao abrir (o produto não calcula fórmulas).
    var wb = doc.WorkbookPart!.Workbook;
    var calc = wb.CalculationProperties ??= new CalculationProperties();
    calc.FullCalculationOnLoad = true;
    wb.Save();
}

report.Print();
return report.Errors.Count == 0 ? 0 : 1;

// ---------------------------------------------------------------------------------------------

sealed class Filler(SpreadsheetDocument doc, Report report)
{
    readonly Dictionary<string, WorksheetPart> _parts = doc.WorkbookPart!.Workbook.Sheets!.Elements<Sheet>()
        .ToDictionary(s => s.Name!.Value!, s => (WorksheetPart)doc.WorkbookPart.GetPartById(s.Id!.Value!));

    public void Write(string sheet, string cellRef, object? value, string? type)
    {
        if (value is null) return;
        var cell = GetCell(sheet, cellRef, create: true)!;
        if (cell.CellFormula is not null)
        {
            report.Error($"Destino {sheet}!{cellRef} contém fórmula; valor não gravado.");
            return;
        }
        var raw = value is JsonElement je ? je.ToString() : value.ToString()!;
        if (string.IsNullOrEmpty(raw)) return;
        cell.InlineString = null; cell.CellValue = null;
        // Valor que não é do tipo esperado (ex.: "-" como padrão numa célula de data) é gravado como texto.
        if (type == "date" && !DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.None, out _)) type = null;
        if (type == "time" && !TimeSpan.TryParse(raw, CultureInfo.InvariantCulture, out _)) type = null;
        if (type == "number" && !double.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out _)) type = null;
        switch (type)
        {
            case "date":
                cell.DataType = null;
                cell.CellValue = new CellValue(DateTime.Parse(raw, CultureInfo.InvariantCulture).ToOADate().ToString(CultureInfo.InvariantCulture));
                break;
            case "time":
                cell.DataType = null;
                cell.CellValue = new CellValue(TimeSpan.Parse(raw, CultureInfo.InvariantCulture).TotalDays.ToString(CultureInfo.InvariantCulture));
                break;
            case "number":
                cell.DataType = null;
                cell.CellValue = new CellValue(double.Parse(raw, CultureInfo.InvariantCulture).ToString(CultureInfo.InvariantCulture));
                break;
            default:
                cell.DataType = CellValues.InlineString;
                cell.InlineString = new InlineString(new Text(raw) { Space = SpaceProcessingModeValues.Preserve });
                break;
        }
        report.Written++;
    }

    public void Clear(string sheet, string cellRef)
    {
        var cell = GetCell(sheet, cellRef, create: false);
        if (cell is null || cell.CellFormula is not null) return; // fórmula nunca é limpa
        if (cell.CellValue is null && cell.InlineString is null) return;
        cell.CellValue = null; cell.InlineString = null; cell.DataType = null; // mantém o estilo (s)
        report.Cleared++;
    }

    Cell? GetCell(string sheet, string cellRef, bool create)
    {
        if (!_parts.TryGetValue(sheet, out var part)) { report.Error($"Aba '{sheet}' não existe no modelo."); return null; }
        var data = part.Worksheet.GetFirstChild<SheetData>()!;
        var rowIdx = uint.Parse(Regex.Match(cellRef, @"\d+").Value);
        var row = data.Elements<Row>().FirstOrDefault(r => r.RowIndex!.Value == rowIdx);
        if (row is null)
        {
            if (!create) return null;
            row = new Row { RowIndex = rowIdx };
            var after = data.Elements<Row>().LastOrDefault(r => r.RowIndex!.Value < rowIdx);
            if (after is null) data.PrependChild(row); else after.InsertAfterSelf(row);
        }
        var cell = row.Elements<Cell>().FirstOrDefault(c => c.CellReference!.Value == cellRef);
        if (cell is not null || !create) return cell;
        cell = new Cell { CellReference = cellRef };
        var colNum = Col.ToNumber(cellRef);
        var prev = row.Elements<Cell>().LastOrDefault(c => Col.ToNumber(c.CellReference!.Value!) < colNum);
        if (prev is null) row.PrependChild(cell); else prev.InsertAfterSelf(cell);
        return cell;
    }

    public void Hide(string sheet)
    {
        var s = doc.WorkbookPart!.Workbook.Sheets!.Elements<Sheet>().First(x => x.Name!.Value == sheet);
        s.State = SheetStateValues.Hidden;
        report.Info($"Aba-slot '{sheet}' sem Grupo: oculta.");
    }

    public void OrderSlotTabs(List<string> ordem)
    {
        var sheetsEl = doc.WorkbookPart!.Workbook.Sheets!;
        var todas = sheetsEl.Elements<Sheet>().ToList();
        var posicoes = todas.Select((s, i) => (s, i)).Where(x => ordem.Contains(x.s.Name!.Value!)).Select(x => x.i).ToList();
        var definidos = doc.WorkbookPart.Workbook.DefinedNames?.Elements<DefinedName>().Where(d => d.LocalSheetId is not null).ToList() ?? [];
        if (definidos.Any(d => posicoes.Contains((int)d.LocalSheetId!.Value)))
        {
            report.Warn("Nome definido local em aba-slot: ordem das abas mantida.");
            return;
        }
        var ordenadas = ordem.Select(n => todas.First(s => s.Name!.Value == n)).ToList();
        var novaLista = todas.ToList();
        for (var k = 0; k < posicoes.Count; k++) novaLista[posicoes[k]] = ordenadas[k];
        foreach (var s in todas) s.Remove();
        foreach (var s in novaLista) sheetsEl.AppendChild(s);
        report.Info("Abas de grupo ordenadas como o resumo.");
    }

    public void SetActiveSheet(string? preferred)
    {
        var sheets = doc.WorkbookPart!.Workbook.Sheets!.Elements<Sheet>().ToList();
        bool Visible(Sheet s) => s.State is null || s.State.Value == SheetStateValues.Visible;
        var idx = sheets.FindIndex(s => s.Name!.Value == preferred && Visible(s));
        if (idx < 0) idx = sheets.FindIndex(Visible);
        foreach (var view in doc.WorkbookPart.Workbook.BookViews?.Elements<WorkbookView>() ?? [])
        {
            view.ActiveTab = (uint)idx;
            view.FirstSheet = 0;
        }
        for (var i = 0; i < sheets.Count; i++)
        {
            var part = (WorksheetPart)doc.WorkbookPart.GetPartById(sheets[i].Id!.Value!);
            foreach (var sv in part.Worksheet.Descendants<SheetView>())
                sv.TabSelected = i == idx ? true : null;
        }
    }

    public void StripFormulaCache()
    {
        var n = 0;
        foreach (var c in doc.WorkbookPart!.WorksheetParts.SelectMany(p => p.Worksheet.Descendants<Cell>()))
        {
            if (c.CellFormula is null || c.CellValue is null) continue;
            c.CellValue = null;
            c.DataType = null; // t="str" | "e" | "b" descrevia o valor em cache
            n++;
        }
        report.Info($"Resultados em cache removidos de {n} fórmula(s).");
    }

    public void CompactSharedStrings()
    {
        var sstPart = doc.WorkbookPart!.SharedStringTablePart;
        if (sstPart is null) return;
        var items = sstPart.SharedStringTable.Elements<SharedStringItem>().ToList();
        var sharedCells = doc.WorkbookPart.WorksheetParts
            .SelectMany(p => p.Worksheet.Descendants<Cell>())
            .Where(c => c.DataType?.Value == CellValues.SharedString && c.CellValue is not null)
            .ToList();
        var used = sharedCells.Select(c => int.Parse(c.CellValue!.Text)).Distinct().OrderBy(i => i).ToList();
        var remap = used.Select((oldIdx, newIdx) => (oldIdx, newIdx)).ToDictionary(x => x.oldIdx, x => x.newIdx);

        var table = new SharedStringTable();
        foreach (var oldIdx in used) table.AppendChild((SharedStringItem)items[oldIdx].CloneNode(true));
        table.Count = (uint)sharedCells.Count;
        table.UniqueCount = (uint)used.Count;
        sstPart.SharedStringTable = table;
        foreach (var c in sharedCells) c.CellValue = new CellValue(remap[int.Parse(c.CellValue!.Text)].ToString(CultureInfo.InvariantCulture));
        report.Info($"Textos compartilhados: {items.Count} → {used.Count} (removidos {items.Count - used.Count} sem uso).");
    }

    public void RenameSheets(Dictionary<string, string> renames)
    {
        if (renames.Count == 0) return;
        var sheets = doc.WorkbookPart!.Workbook.Sheets!.Elements<Sheet>().ToList();
        var finalNames = sheets.Select(s => renames.GetValueOrDefault(s.Name!.Value!, s.Name!.Value!)).ToList();
        foreach (var dup in finalNames.GroupBy(n => n, StringComparer.OrdinalIgnoreCase).Where(g => g.Count() > 1))
        {
            report.Error($"Nome de aba duplicado após renomear: '{dup.Key}'.");
            return;
        }

        var rules = renames.Select(kv => (Regex: SheetNames.RefPattern(kv.Key), Replacement: SheetNames.Quote(kv.Value) + "!")).ToList();
        string Rewrite(string text) => rules.Aggregate(text, (t, r) => r.Regex.Replace(t, r.Replacement));

        // Fórmulas de células, CF, DV (inclusive extensões x14) e nomes definidos: todos são folhas de texto.
        var formulaElements = new HashSet<string> { "f", "formula", "formula1", "formula2", "definedName" };
        IEnumerable<OpenXmlElement> roots = doc.WorkbookPart.WorksheetParts.Select(p => (OpenXmlElement)p.Worksheet)
            .Append(doc.WorkbookPart.Workbook);
        var changed = 0;
        foreach (var root in roots)
            foreach (var el in root.Descendants().Where(e => formulaElements.Contains(e.LocalName)))
            {
                var before = el.InnerText;
                if (string.IsNullOrEmpty(before)) continue;
                var after = Rewrite(before);
                if (after == before) continue;
                if (el is OpenXmlLeafTextElement leaf) leaf.Text = after;
                else if (el is DefinedName dn) dn.Text = after;
                else if (el.FirstChild is OpenXmlLeafTextElement inner) inner.Text = after; // x14:formula1 > xm:f
                changed++;
            }
        foreach (var s in sheets)
            if (renames.TryGetValue(s.Name!.Value!, out var n)) s.Name = n;
        report.Info($"{renames.Count} aba(s) renomeada(s); {changed} fórmula(s)/regra(s) reescrita(s).");
    }
}

static class SheetNames
{
    public static string Sanitize(string name)
    {
        var clean = Regex.Replace(Regex.Replace(name.Trim(), @"[\[\]:\*\?/\\]", " "), @"\s{2,}", " ");
        return clean.Length > 31 ? clean[..31].TrimEnd() : clean;
    }

    public static string Quote(string name) => "'" + name.Replace("'", "''") + "'";

    // Casa OLD! ou 'OLD'! sem casar sufixos de outros nomes (Gabriel! não casa Gabrielly!, XGabriel!).
    public static Regex RefPattern(string oldName) =>
        new($@"(?<![\p{{L}}\p{{N}}_.'])(?:{Regex.Escape(Quote(oldName))}|{Regex.Escape(oldName)})!", RegexOptions.CultureInvariant);
}

static class Col
{
    public static int ToNumber(string cellRef) =>
        Regex.Match(cellRef, "^[A-Z]+").Value.Aggregate(0, (n, ch) => n * 26 + (ch - 'A' + 1));
    public static string ToLetters(int n) { var s = ""; while (n > 0) { n--; s = (char)('A' + n % 26) + s; n /= 26; } return s; }
}

static class Data
{
    // Caminho com pontos: "grupo.lider", "presencas.s1_celula".
    public static object? Resolve(JsonElement root, string path)
    {
        var cur = root;
        foreach (var seg in path.Split('.'))
        {
            if (cur.ValueKind == JsonValueKind.Array && int.TryParse(seg, out var idx))
            {
                if (idx < 0 || idx >= cur.GetArrayLength()) return null;
                cur = cur[idx];
                continue;
            }
            if (cur.ValueKind != JsonValueKind.Object || !cur.TryGetProperty(seg, out cur)) return null;
        }
        return cur.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined ? null : cur;
    }
}

sealed class Report
{
    public int Written, Cleared;
    public List<string> Errors { get; } = [];
    readonly List<string> _warnings = [], _info = [];
    public void Error(string m) => Errors.Add(m);
    public void Warn(string m) => _warnings.Add(m);
    public void Info(string m) => _info.Add(m);
    public void Print()
    {
        Console.WriteLine($"Células gravadas: {Written}; células de entrada limpas: {Cleared}");
        foreach (var m in _info) Console.WriteLine("INFO  " + m);
        foreach (var m in _warnings) Console.WriteLine("AVISO " + m);
        foreach (var m in Errors) Console.WriteLine("ERRO  " + m);
    }
}

// --- Configuração de mapeamento (rascunho do formato da Story 1.2) ---------------------------

sealed record Mapping(string Template, List<CellMap> Cells, GroupSlots GroupSlots, string? OpenOnSheet = null);
sealed record CellMap(string Sheet, string Cell, string Field, string? Type = null, string? Fallback = null);
sealed record SlotCellMap(string Cell, string Field, string? Type = null);
sealed record ColumnMap(string Field, string? Type = null);
sealed record GroupSlots(string Source, List<string> Sheets, string? RenameSheetFrom, List<SlotCellMap> Cells, List<RowBlock> RowBlocks,
    bool HideUnusedSlots = true, string? EmptySlotName = null, bool OrderSlotTabs = false);
sealed record RowBlock(string Name, string Source, int FirstRow, int Capacity, ColumnRange ClearColumns,
    Dictionary<string, string>? Filter, Dictionary<string, ColumnMap> Columns);
sealed record ColumnRange(string From, string To)
{
    public IEnumerable<string> Expand() =>
        Enumerable.Range(Col.ToNumber(From), Col.ToNumber(To) - Col.ToNumber(From) + 1).Select(Col.ToLetters);
}
