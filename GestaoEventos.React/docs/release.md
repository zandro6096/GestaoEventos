# Release e Go-Live

## Gate binario

`npm run release:gate` executa o `quality-gate` e depois exige que todas as linhas produtivas do `docs/parity-manifest.md` estejam `verified`. `npm run check:go-live` executa somente a segunda parte. Qualquer falha bloqueia a liberacao e imprime a area pendente.

O gate permanece bloqueado automaticamente enquanto existirem gaps de paridade ou linhas `in-progress`. A detecção de conflitos e a reativação de vínculos agora usam contratos reais; o app paralelo só substitui o Angular quando todas as funcionalidades do escopo estiverem operacionais.

## Promocao

1. Validar `npm run check:environment` com a lane e API corretas.
2. Executar `npm run release:gate` usando mocks locais para os smokes e ambiente de preview configurado no EAS/hosting.
3. Publicar preview pelo perfil `preview`, confirmar API/CORS e repetir o gate com evidencias anexadas ao manifesto.
4. Publicar prod pelo perfil `production` somente depois de todas as linhas produtivas estarem `verified`.

## Rollback

- Web: redeploy do artefato estático anterior no hosting, mantendo o Angular como origem pública até a investigação terminar.
- EAS Update: republish do update anterior no canal afetado; se a mudança tocar código nativo, API, auth, contexto ou permissões, distribuir um build anterior/novo build, nunca uma OTA incompatível.
- Mobile: manter o build anterior identificável pelo número de versão e canal. Feature flags ou roteamento de corte devem ser controlados pelo host de publicação; não há flag fictícia no cliente enquanto essa chave operacional não existir.

Toda decisão de rollback deve registrar lane, build/update, motivo, horário e resultado dos smokes de recuperação.
