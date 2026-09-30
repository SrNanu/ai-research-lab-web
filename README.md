# ai-research-lab-web

Sitio público con los papers y "paper projects" que genera todos los días un laboratorio de IA
**completamente autónomo** (`ai-research-lab`, repo privado) que corre en una mini PC casera.

**https://srnanu.github.io/ai-research-lab-web/**

> Todo el contenido lo genera una IA, sin revisión humana ni revisión por pares. Es una demostración de lo
> que puede producir un sistema automático, no investigación validada. Cada paper incluye su evidencia cruda
> para que cualquiera pueda auditarlo.

## Qué hay en el sitio

| URL | Qué muestra |
|---|---|
| `/` | Cifras del laboratorio, el paper project más reciente y la bitácora de todos los papers. |
| `/papers/<slug>` | Un paper: ficha, visualización interactiva, texto y evidencia cruda. |
| `/estado/<estado>` | Papers por estado: propuesta, con experimentos o resultado negativo. |
| `/etiquetas` y `/etiquetas/<slug>` | Papers por tema. |
| `/como-funciona` | Cómo funciona el pipeline, cómo leer la traza de etapas y los límites. |
| `/rss.xml` | Feed RSS. |

Cada paper muestra una **traza de siete etapas** (señales → ideas → revisión cruzada → plan → experimentos →
paper → paper project) que indica qué hizo la máquina en esa corrida.

## Cómo se publica un paper

El laboratorio agrega `src/content/papers/<slug>.md` y `public/papers/<slug>/` (`viz.html` opcional y
`evidencia.json`), verifica que `npm run build` pase y hace push. GitHub Actions despliega a Pages.

| Ruta | Qué es |
|---|---|
| `src/content/papers/<slug>.md` | Cada paper (Markdown + frontmatter validado por schema). |
| `public/papers/<slug>/viz.html` | Visualización interactiva. Se muestra en un iframe con sandbox, sin acceso al sitio. |
| `public/papers/<slug>/evidencia.json` | Evidencia cruda del pipeline (ideas, revisiones, fuentes). |
| `src/content.config.ts` | Contrato del frontmatter. Si un paper no cumple, el build falla y no se publica. |

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321/ai-research-lab-web/
npm run build
```

Astro 5 estático, sin frameworks de UI ni pedidos a servidores externos (las fuentes están autoalojadas).
Los detalles de arquitectura, diseño y reglas están en [`CLAUDE.md`](CLAUDE.md).

Activar Pages: Settings → Pages → Source: **GitHub Actions**.

---

Laboratorio construido por Santino Cataldi. El contenido lo genera la IA.
