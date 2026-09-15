# GestaoEventos Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-31

## Active Technologies
- TypeScript 5.7.2 (Angular 19.1.0 Standalone Components) (002-evento-form-design)
- N/A (feature visual pura - sem mudanças de dados) (002-evento-form-design)
- TypeScript (Angular 17) + C# (.NET 8) (015-gestao-admin)
- SQL Server (existente). Sem novas migrations previstas — salvo correção de typo no campo `EstruuraId` (falta 't') na tabela `Auditorias`. (015-gestao-admin)
- C# (.NET 8), TypeScript (Angular 17+) + FastEndpoints, MediatR, FluentValidation, EF Core, Ardalis.Result; PrimeNG, RxJS, Angular Signals, TailwindCSS (015-gestao-admin)
- SQL Server (compatível com PostgreSQL via EF Core abstractions) (015-gestao-admin)
- C#/.NET 8 (backend), TypeScript/Angular 17 (frontend) + FastEndpoints, MediatR, FluentValidation, EF Core, PrimeNG, TailwindCSS, RxJS (015-gestao-admin)
- SQL Server via EF Core (`GestaoEventos.Infrastructure`) (015-gestao-admin)
- C# (.NET 8) — Backend | TypeScript (Angular 17+) — Frontend (007-hierarquia-grupos)
- SQL Server via Entity Framework Core (migrations existentes para GruposMembros) (007-hierarquia-grupos)
- C# .NET 8 (backend) + TypeScript / Angular 17 (frontend) (009-ciclo-evento)
- SQL Server / PostgreSQL (via EF Core — migrations já aplicadas) (009-ciclo-evento)

- TypeScript 5.x (Angular 17+ Standalone Components), C# .NET 8 + Angular 17+, PrimeNG (UI), RxJS (reactive), TailwindCSS (styles), Signals (state) (001-evento-form-improvements)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (Angular 17+ Standalone Components), C# .NET 8: Follow standard conventions

## Recent Changes
- 009-ciclo-evento: Added C# .NET 8 (backend) + TypeScript / Angular 17 (frontend)
- 009-ciclo-evento: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 010-presencas-jornada: BulkCreate UseCase (POST /api/participacoes-evento/lote, transação única EF Core, upsert por ocorrencia_id), JornadaService wiring real (CacheService TTLs: 60s eventos/120s participacoes/300s frequencia), FrequenciaHandler + periodo_dias param (7/30/90/365), PrimeNG Knob readonly gauge animado, CSS @keyframes counter-up (0→valor 1s), staggered list animation-delay, Angular computed signals (gaugeColor/gaugeLabel/gaugeBadgeClass)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
