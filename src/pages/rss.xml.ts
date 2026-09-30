import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { papersConCorrida, etiquetaEstado, formatoCorrida } from '../lib/papers';

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const papers = await papersConCorrida();
  return rss({
    title: 'AI Research Lab · bitácora',
    description: 'Papers generados cada día por un laboratorio de IA autónomo. Contenido 100% generado por IA, '
      + 'sin revisión humana ni revisión por pares: es una demostración, no investigación validada.',
    site: new URL(`${base}/`, context.site),
    customData: '<language>es</language>',
    items: papers.map(({ p, corrida }) => ({
      title: p.data.titulo,
      pubDate: p.data.fecha,
      link: `${base}/papers/${p.id}/`,
      description: `[${etiquetaEstado[p.data.estado]} · corrida ${formatoCorrida(corrida)} · generado por IA, sin revisión humana] ${p.data.resumen}`,
      categories: [etiquetaEstado[p.data.estado], ...p.data.etiquetas],
    })),
  });
}
