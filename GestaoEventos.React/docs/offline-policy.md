# Politica Offline Read-Only

O app React aceita leitura de dados ja presentes no cache do `QueryClient` enquanto a conectividade esta indisponivel. O banner global informa que os dados podem estar desatualizados.

Toda mutacao passa por `assertOnlineForMutation`. O `QueryClient` executa a funcao da mutacao mesmo offline para que o guard rejeite imediatamente; isso evita que a biblioteca pause e retome a operacao automaticamente quando a rede voltar. Nao existe fila local de escrita.

O estado inicial e qualquer snapshot com `isInternetReachable: null` sao tratados como rede nao confirmada. Nesse estado, consultas podem usar cache, mas login, cadastro, presenca, eventos, grupos, jornada e administracao permanecem bloqueados ate a conectividade ser confirmada.

Quando a rede volta, o provider atualiza o store e o `onlineManager`; nenhuma mutacao rejeitada e reprocessada automaticamente. O usuario precisa repetir conscientemente a acao.
