import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Celular: grava a planilha no cache do app e abre a folha do sistema (Excel, WhatsApp, e-mail, Arquivos).
// Na web, salvarPlanilha.web.ts baixa o arquivo direto.

const MIME_XLSM = 'application/vnd.ms-excel.sheet.macroEnabled.12';
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const salvaDireto = false;

// O tsconfig resolve ".web" primeiro, então o tipo de File vem da versão web (vazia). Este é o recorte
// da API nativa (expo-file-system v57) que usamos aqui.
type ArquivoNativo = {
  readonly uri: string;
  readonly exists: boolean;
  delete(): void;
  create(): void;
  write(conteudo: string, opcoes: { encoding: 'base64' }): void;
};

export async function salvarPlanilha(nomeArquivo: string, conteudoBase64: string): Promise<void> {
  const arquivo = new File(Paths.cache, nomeArquivo) as unknown as ArquivoNativo;
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(conteudoBase64, { encoding: 'base64' });

  if (!(await Sharing.isAvailableAsync())) throw new Error('Compartilhamento indisponível neste aparelho.');
  const xlsm = nomeArquivo.toLowerCase().endsWith('.xlsm');
  await Sharing.shareAsync(arquivo.uri, {
    mimeType: xlsm ? MIME_XLSM : MIME_XLSX,
    UTI: xlsm ? 'org.openxmlformats.spreadsheetml.sheet.macroenabled' : 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: nomeArquivo,
  });
}
