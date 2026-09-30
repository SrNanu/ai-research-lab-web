import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';

export type Paper = CollectionEntry<'papers'>;
export type Estado = Paper['data']['estado'];

export const etiquetaEstado: Record<Estado, string> = {
  'propuesta': 'Propuesta',
  'con-experimentos': 'Con experimentos',
  'resultado-negativo': 'Resultado negativo',
};

// Rutas relativas a la raíz del repo: el build (local y del motor) corre desde ahí.
export const tieneViz = (id: string) => fs.existsSync(`public/papers/${id}/viz.html`);
export const tieneEvidencia = (id: string) => fs.existsSync(`public/papers/${id}/evidencia.json`);

export const fechaISO = (d: Date) => d.toISOString().slice(0, 10);

// Papers ordenados del más reciente al más viejo, con su número de corrida
// (1 = el primero publicado). Se calcula en el build; no depende del frontmatter.
export async function papersConCorrida() {
  const papers = await getCollection('papers');
  const asc = [...papers].sort((a, b) => +a.data.fecha - +b.data.fecha || a.id.localeCompare(b.id));
  return asc.map((p, i) => ({ p, corrida: i + 1 })).reverse();
}

export const formatoCorrida = (n: number) => `#${String(n).padStart(3, '0')}`;

export const estados = Object.keys(etiquetaEstado) as Estado[];

// "Visión por computadora" → "vision-por-computadora". Etiquetas que dan el mismo slug se agrupan.
export const slugEtiqueta = (e: string) =>
  e.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sin-nombre';

type ConCorrida = Awaited<ReturnType<typeof papersConCorrida>>;

// Etiquetas con sus papers, de la más usada a la menos usada.
export function agruparEtiquetas(papers: ConCorrida) {
  const grupos = new Map<string, { slug: string; nombre: string; papers: ConCorrida }>();
  for (const item of papers) {
    for (const e of new Set(item.p.data.etiquetas)) {
      const slug = slugEtiqueta(e);
      if (!grupos.has(slug)) grupos.set(slug, { slug, nombre: e, papers: [] });
      const g = grupos.get(slug)!;
      if (!g.papers.includes(item)) g.papers.push(item);
    }
  }
  return [...grupos.values()].sort((a, b) => b.papers.length - a.papers.length || a.nombre.localeCompare(b.nombre, 'es'));
}
