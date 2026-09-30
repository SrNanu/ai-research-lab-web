import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Contrato con el motor (ai-research-lab): si el frontmatter no cumple, el build falla
// y el paper NO se publica.
const papers = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/papers' }),
  schema: z.object({
    titulo: z.string().max(120),
    fecha: z.coerce.date(),
    slug: z.string(),
    estado: z.enum(['propuesta', 'con-experimentos', 'resultado-negativo']),
    resumen: z.string(),
    etiquetas: z.array(z.string()).default([]),
    modelos: z.array(z.string()).default([]),
  }),
});

export const collections = { papers };
