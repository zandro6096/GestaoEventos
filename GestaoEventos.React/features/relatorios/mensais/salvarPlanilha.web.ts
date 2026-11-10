// Web: baixa a planilha direto (o navegador salva em Downloads).

export const salvaDireto = true;

export async function salvarPlanilha(nomeArquivo: string, conteudoBase64: string): Promise<void> {
  const binario = atob(conteudoBase64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  const tipo = nomeArquivo.toLowerCase().endsWith('.xlsm')
    ? 'application/vnd.ms-excel.sheet.macroEnabled.12'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const url = URL.createObjectURL(new Blob([bytes], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
