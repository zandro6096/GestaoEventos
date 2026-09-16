import type { GrupoDto } from '../../services/api/grupos-api';

export type GrupoNode = GrupoDto & { children: GrupoNode[] };

export function buildGroupTree(groups: GrupoDto[]) {
  const nodes = new Map(groups.map((group) => [group.id, { ...group, children: [] as GrupoNode[] }]));
  const roots: GrupoNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.grupoSuperiorId ? nodes.get(node.grupoSuperiorId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (items: GrupoNode[]) => items.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).forEach((item) => sort(item.children));
  sort(roots);
  return roots;
}

export function filterGroups(groups: GrupoDto[], term: string, level: number | null) {
  const normalized = term.trim().toLocaleLowerCase('pt-BR');
  return groups.filter((group) => (!normalized || group.nome.toLocaleLowerCase('pt-BR').includes(normalized)) && (level === null || group.nivelHierarquico === level));
}

export function groupPath(groups: GrupoDto[], group: GrupoDto) {
  const byId = new Map(groups.map((item) => [item.id, item]));
  const path: GrupoDto[] = [];
  let current: GrupoDto | undefined = group;
  while (current) {
    path.unshift(current);
    current = current.grupoSuperiorId ? byId.get(current.grupoSuperiorId) : undefined;
  }
  return path;
}
