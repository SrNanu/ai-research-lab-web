# CONTEXTO — ai-research-lab-web (el sitio)

> Este archivo es para que cualquier IA (o persona) que abra el repo entienda qué es, por qué existe
> y cómo tiene que trabajar. Leelo completo antes de tocar código.

## Qué es

El **sitio público** donde se publican los papers y los "paper projects" que genera todos los días el
laboratorio autónomo **`ai-research-lab`** (repo privado, corre en la mini PC casera de Santino Cataldi).

- **Paper:** documento en Markdown (propuesta de investigación, o paper con experimentos o con resultado negativo).
- **Paper project:** página HTML interactiva (animaciones, simulaciones, diagramas) que explica el paper
  a una persona curiosa sin formación técnica.

Stack: **Astro 5** estático, desplegado en **GitHub Pages** con GitHub Actions en cada push a `main`.
URL por defecto: `https://srnanu.github.io/ai-research-lab-web/`.

## Por qué existe (y el tono)

Mostrar **qué puede producir un sistema de IA completamente autónomo**. El sitio **no** presenta los papers
como investigación de Santino. La autoría del contenido es de la IA, y Santino es quien construyó el laboratorio.
Por eso:
- En la home, en las páginas por estado y por etiqueta y en cada paper aparece el componente `AvisoIA` (generado por IA, sin revisión humana ni por pares).
- El feed RSS repite el aviso en la descripción del canal y en cada item.
- La página `/como-funciona` explica el pipeline, cómo leer la traza y los límites.
- Cada paper enlaza su evidencia cruda (`evidencia.json`).
- Los resultados negativos se muestran con la misma dignidad que los positivos.

No quitar ni suavizar estos avisos.

## Quién escribe en este repo

| Quién | Qué toca |
|---|---|
| **El bot** (mini PC, deploy key `gh-labweb` con escritura) | Solo agrega `src/content/papers/<slug>.md` y `public/papers/<slug>/`. Un commit por paper: `paper: <slug>`. |
| **Santino / IA de desarrollo** | Diseño, layouts, componentes, páginas, schema y workflow. |

Hay que evitar conflictos: no reorganizar `src/content/papers/` ni `public/papers/` sin actualizar
`pipeline/publicar.sh` en `ai-research-lab`.

Todo lo que el bot agrega aparece solo en todas las vistas (home, filtros, etiquetas, RSS, cifras, traza):
**el bot no necesita saber nada del diseño**.

## Cómo llega un paper (flujo)

```
ai-research-lab (mini PC)
  └─ publicar.sh: git pull → copia .md + viz.html + evidencia.json
                → npm ci && npm run build en un contenedor node:22 (si falla, NO publica)
                → git commit + push
GitHub Actions (.github/workflows/deploy.yml) → withastro/action → deploy-pages
```

## Contrato del contenido (NO romper)

`src/content.config.ts` define la colección `papers` con este frontmatter:

```yaml
titulo: "..."            # string, ≤ 120 caracteres
fecha: AAAA-MM-DD        # se convierte a Date
slug: AAAA-MM-DD-kebab   # igual al nombre del archivo
estado: propuesta | con-experimentos | resultado-negativo
resumen: "..."           # 2-3 oraciones
etiquetas: ["..."]       # opcional; cada una genera /etiquetas/<slug>
modelos: ["..."]         # opcional; si está vacío, la ficha no muestra "Modelos"
```
El schema funciona como **control de calidad**: si el LLM escribe mal el frontmatter, el build falla y el
paper no se publica. Si cambiás el schema, actualizá a la vez `templates/paper_prompt.md` en `ai-research-lab`.

Archivos por paper:
- `src/content/papers/<slug>.md`
- `public/papers/<slug>/viz.html`: paper project, **opcional**. Es HTML autocontenido generado por IA.
- `public/papers/<slug>/evidencia.json`: bundle con la idea, las revisiones cruzadas, las fuentes y la procedencia.

Qué se deriva en el build (no está en el frontmatter):
- **Número de corrida** (`#001`, `#002`…): posición del paper ordenado por fecha (y por slug si hay empate).
  Si se borra un paper, los números siguientes se corren. Si algún día tienen que ser fijos, agregar un campo
  `corrida` al schema (y al prompt del motor).
- **Traza de etapas:** sale de `estado` y de si existe `viz.html` (ver abajo).
- **Cifras de la home, fecha de la "última corrida publicada", páginas por estado y por etiqueta, RSS.**

**Si se agrega un estado nuevo** al schema, también hay que actualizar: `etiquetaEstado` en `src/lib/papers.ts`,
el color en `Estado.astro` (y su token en `Base.astro`), la regla de experimentos en `Traza.astro`, el texto en
`src/pages/estado/[estado].astro` y la leyenda de `/como-funciona`. TypeScript avisa en los `Record<Estado, …>`.

## Seguridad

El `viz.html` es código generado por IA. Se muestra **siempre** dentro de
`<iframe sandbox="allow-scripts">` **sin** `allow-same-origin`, así no puede acceder al sitio, a cookies
ni a storage. Nunca incrustarlo directamente en la página ni relajar el sandbox. El motor ya lo valida
antes (sin red, sin scripts externos, ≤ 400 KB), pero el iframe es la segunda barrera.

Hay **dos** lugares con ese iframe: la página del paper y el paper project destacado de la home. Los dos
deben mantener el mismo `sandbox`.

## Identidad visual: "Bitácora"

El sitio se ve como el cuaderno de un laboratorio que trabaja solo. El diseño muestra el **proceso**, no solo
el resultado. Propuesta original con mockups: https://claude.ai/artifact/AXXaSDTi9khdhmDZHywHtC (privada).

**Materiales**
- Papel milimetrado muy sutil de fondo (`--grilla`, en `body`).
- Tinta azul cobalto como **único** acento (`--acento`).
- Letra monoespaciada para la "voz de la máquina": metadatos, fechas, corridas, estados, navegación.
- Serif para leer los papers con calma.

**Tokens** (en `:root` de `src/layouts/Base.astro`; el modo oscuro los redefine con `prefers-color-scheme`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--fondo` | `#EEF1EC` | `#0F1512` | Fondo de página |
| `--tarjeta` | `#F8FAF6` | `#151D19` | Superficies: ficha, banco del iframe, barras |
| `--texto` | `#16201C` | `#E4EAE5` | Texto principal |
| `--suave` | `#56635C` | `#95A39B` | Texto secundario |
| `--borde` | `#CBD3CC` | `#2A3630` | Bordes |
| `--acento` | `#2346D8` | `#8FA6FF` | Links, énfasis, botón |
| `--ok` | `#1F7A55` | `#5CC99A` | Estado "con experimentos" |
| `--prop` | `#8A6200` | `#E0B447` | Estado "propuesta" (borde punteado) |
| `--neg` | `#7A3E9D` | `#C495E0` | Estado "resultado negativo" |
| `--aviso` / `--aviso-borde` | `#FFF6D6` / `#D9B64A` | `#2B2512` / `#6B5620` | Sello de `AvisoIA` |

**Tipografía** (autoalojada con `@fontsource-variable`, sin pedidos a Google ni a otros servidores)

| Variable | Fuente | Uso |
|---|---|---|
| `--display` | Bricolage Grotesque | Títulos y cifras. Con moderación. |
| `--serif` | Literata | Texto de lectura (cuerpo por defecto). |
| `--mono` | Martian Mono | Metadatos, fechas, estados, chips, navegación. |

Clase global útil: `.eti` (rótulo en mono, mayúsculas, espaciado).

**Traza de etapas** (`Traza.astro`): siete puntos, uno por etapa del pipeline:
señales → ideas → revisión cruzada → plan → experimentos → paper → paper project.
- Punto lleno: la etapa se hizo.
- Punteado: no aplicó (experimentos en una `propuesta`; paper project si no hay `viz.html`).
- Tachado: el experimento se hizo y refutó la hipótesis (`resultado-negativo`).

Tiene `aria-label` con el resumen en texto (ej. "6 de 7 etapas; sin experimentos").

**Decisiones de diseño que hay que respetar**
- El resultado negativo va en **violeta, no en rojo**: en rojo parecería un error del sitio, y es un hallazgo.
  Tiene la misma forma de insignia que los otros estados.
- `AvisoIA` es un **sello** ("Sin revisión humana"), bien visible. Tiene dos textos: `variante="sitio"` (por
  defecto) y `variante="paper"`.
- Sin emojis como íconos. Sin gradientes. Un solo acento.
- Los filtros son **links a páginas estáticas**, no JavaScript.

## Páginas públicas

| URL | Archivo | Contenido |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero con cifras, aviso, paper project destacado (el más reciente con `viz.html`), filtros y bitácora. |
| `/papers/<slug>` | `src/pages/papers/[slug].astro` | Ficha (corrida, fecha, estado, traza, modelos), etiquetas, aviso, iframe, contenido, evidencia. |
| `/estado/<estado>` | `src/pages/estado/[estado].astro` | Papers de un estado. Solo se generan los estados que tienen papers. |
| `/etiquetas` | `src/pages/etiquetas/index.astro` | Todas las etiquetas con su cantidad, de la más usada a la menos. |
| `/etiquetas/<slug>` | `src/pages/etiquetas/[tag].astro` | Papers de una etiqueta. |
| `/como-funciona` | `src/pages/como-funciona.astro` | Pipeline, cómo leer la traza y los estados, límites. |
| `/rss.xml` | `src/pages/rss.xml.ts` | Feed RSS 2.0 (`@astrojs/rss`), con el aviso de IA en cada item. |

Slug de etiquetas: `slugEtiqueta` quita tildes y pasa a kebab-case (`Visión por computadora` →
`vision-por-computadora`). Etiquetas que dan el mismo slug se juntan en una sola página.

## Estructura del código

| Ruta | Qué es |
|---|---|
| `astro.config.mjs` | `site` y `base` (`/ai-research-lab-web`). Con un dominio propio, cambiar `site` y borrar `base`. |
| `src/content.config.ts` | Schema de la colección `papers`. |
| `src/lib/papers.ts` | Helpers compartidos: `papersConCorrida` (orden + número de corrida), `tieneViz`, `tieneEvidencia`, `etiquetaEstado`, `estados`, `slugEtiqueta`, `agruparEtiquetas`, `fechaISO`, `formatoCorrida`. |
| `src/layouts/Base.astro` | Layout: fuentes, tokens claro/oscuro, línea de estado del laboratorio, header con menú, footer, `<link>` al RSS. |
| `src/components/AvisoIA.astro` | Sello de contenido generado por IA (variantes `sitio` y `paper`). |
| `src/components/Estado.astro` | Insignia de estado. |
| `src/components/Traza.astro` | Traza de 7 etapas (prop `grande` para la versión más grande). |
| `src/components/ListaPapers.astro` | Bitácora (línea de tiempo) reutilizada en home, estados y etiquetas. |
| `src/components/Filtros.astro` | Chips de filtro: todos, estados con papers y las 8 etiquetas más usadas. Prop `actual` para resaltar. |
| `src/pages/…` | Ver "Páginas públicas". |
| `src/content/papers/2026-09-27-ejemplo.md` + `public/papers/2026-09-27-ejemplo/` | **Ejemplo:** borrarlo cuando se publique el primer paper real. |
| `.github/workflows/deploy.yml` | Deploy a Pages. |
| `package-lock.json` | Necesario: el motor usa `npm ci`. Commitearlo siempre. |

Dependencias: `astro`, `@astrojs/rss` y las tres fuentes `@fontsource-variable/*`. Nada más.

`tieneViz` y `tieneEvidencia` usan rutas relativas a la raíz del repo: el build tiene que correr desde ahí
(así lo hacen `npm run build` y el motor).

## Reglas para quien desarrolle acá

1. Todo en español. Siempre con URLs relativas a `import.meta.env.BASE_URL` (por el `base` de GitHub Pages).
2. Tiene que verse bien en el celular y en modo oscuro (usar las variables CSS de `Base.astro`, nunca colores sueltos).
3. Mantenerlo estático y liviano: sin backend, sin trackers invasivos, sin frameworks de UI salvo que haga falta de verdad.
   Nada de pedidos a servidores externos (por eso las fuentes están autoalojadas).
4. `npm run build` tiene que pasar siempre. Es la verificación que usa el motor antes de publicar.
5. Para listar papers usar `papersConCorrida()` y `ListaPapers`, no `getCollection` directo, así el número de
   corrida y el orden son los mismos en todo el sitio.

## Cómo probar

```bash
npm install
npm run dev      # http://localhost:4321/ai-research-lab-web/
npm run build    # lo mismo que corre el motor antes de publicar
npm run preview  # sirve dist/ para revisarlo como en producción
```

Revisar siempre: home, un paper, `/estado/…`, `/etiquetas`, `/rss.xml`, en claro y en oscuro, y a ancho de celular.

## Estado y pendientes

- [x] Sitio base funcionando; build verificado con el paper de ejemplo.
- [x] Workflow movido a `.github/workflows/deploy.yml`.
- [x] Identidad "Bitácora" (paso 1): tokens, fuentes autoalojadas, sello de aviso, insignia de estado, traza.
- [x] Home (paso 2): hero con cifras reales y el paper project más reciente destacado (iframe con sandbox).
- [x] Filtros por estado y etiqueta, páginas por etiqueta, feed RSS (paso 3).
- [ ] Revisión visual en el navegador (claro, oscuro, celular): los pasos 1–3 se verificaron solo con el build.
- [ ] Inicializar el repo git, primer commit y push a `main`.
- [ ] Activar Pages: Settings → Pages → Source: **GitHub Actions**.
- [ ] Imagen Open Graph por paper para compartir en LinkedIn (idea: título + traza + estado).
- [ ] Borrar el paper de ejemplo cuando se publique el primero real.
- [ ] Opcional: dominio propio.
- [ ] `npm audit` reporta vulnerabilidades en dependencias; revisar sin `--force` (podría cambiar de versión mayor a Astro).
