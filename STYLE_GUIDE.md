# Historia de Jesús — Guía de Dirección de Arte (regla permanente)

**Regla del proyecto:** todo recurso visual nuevo debe mantener el
mismo estilo, iluminación, proporciones, paleta, grosor de línea y
nivel de detalle que los existentes. El objetivo es que el juego
completo parezca ilustrado por una sola persona, sin importar cuándo o
cómo se generó cada pieza. Antes de integrar cualquier imagen nueva, se
revisa contra esta guía.

Esta guía deriva de lo que ya existe en el código (`THEME` en el
artefacto) — no es una dirección nueva, es la que el juego ya tiene,
puesta por escrito para que se pueda replicar consistentemente.

---

## 1. Paleta de color (obligatoria, valores exactos)

| Nombre | Hex | Uso |
|---|---|---|
| Ink (tinta noche) | `#1A1F3C` | Fondos oscuros, cielos nocturnos, sombras profundas |
| Parchment (pergamino) | `#F5E8C9` | Tonos cálidos claros, piel, arquitectura de piedra clara |
| Halo (oro) | `#E8B94A` | Luz, resplandor, acentos dorados, momentos de revelación |
| Clay (arcilla) | `#C0603D` | Tonos térreos, vestimenta, arquitectura, acentos cálidos secundarios |
| Olive (oliva) | `#6E7F4B` | Vegetación, tonos naturales, tela |
| Comic black (tinta) | `#14141C` | Contornos, líneas de tinta, texto |

No introducir colores fuera de esta familia salvo variaciones de
tono/saturación de los mismos seis. Nada de colores neón, pasteles
fríos, o paletas desaturadas tipo "escala de grises" — la calidez es
parte de la identidad.

## 2. Iluminación

- **Una sola fuente de luz dominante**, cálida (dorado/ámbar, tono
  `#E8B94A`), evocando luz de "hora dorada" o luz de vela/lámpara de
  aceite — nunca luz fría o neón.
- Sombras en tonos de la paleta (`#1A1F3C` o `#14141C`), nunca grises
  neutros o negros puros sin matiz.
- Los momentos de milagro/revelación pueden intensificar el resplandor
  dorado (halo/glow), consistente con cómo ya se usa en la animación
  de nivel completado.

## 3. Línea y contorno

- Contorno de tinta grueso y consistente (equivalente visual al
  `border-4` / `.panel-comic` que ya usa la interfaz) — estilo cómic
  moderno, no línea fina de manga ni boceto suelto.
- Grosor de línea uniforme en todas las piezas — un fondo no puede
  tener línea fina mientras un personaje tiene línea gruesa.
- Esquinas y formas redondeadas, sin ángulos filosos innecesarios —
  coherente con los `rounded-xl`/`rounded-2xl` de la interfaz.

## 4. Sombreado y nivel de detalle

- **Cel-shading plano**, 2-3 tonos por superficie (base + sombra +
  opcionalmente un brillo). Nada de gradientes fotorrealistas ni
  render 3D.
- Detalle moderado: formas limpias y legibles a tamaño pequeño (las
  ilustraciones de preguntas se ven en un recuadro chico dentro de la
  tarjeta). Evitar textura excesiva o líneas decorativas finas que se
  pierdan al reducir el tamaño.
- Composición con un punto focal claro, sin fondos sobrecargados.

## 5. Proporciones y personajes

- Proporciones semi-realistas pero simplificadas (cómic moderno, no
  caricatura exagerada ni anime).
- Consistencia de proporción cabeza-cuerpo entre todos los personajes
  del juego — un mismo personaje (ej. Jesús) debe verse como la misma
  persona en cada ilustración donde aparece.
- Vestimenta y arquitectura de contexto histórico: Judea/Galilea del
  siglo I — túnicas, mantos, sandalias, arquitectura de piedra con
  techos planos, olivos, no anacronismos.

## 6. Tipografía (ya en uso, referencia)

- Títulos/HUD: **Baloo 2** (redondeada, amistosa)
- Cuerpo de texto: **Nunito Sans**
- Datos numéricos (tiempo, puntaje): **JetBrains Mono**

## 7. Checklist de consistencia (se aplica a cada imagen nueva)

- [ ] ¿Usa solo colores de la paleta de la sección 1?
- [ ] ¿La luz viene de una sola fuente cálida, consistente con el resto?
- [ ] ¿El grosor de línea coincide con las demás piezas ya integradas?
- [ ] ¿El nivel de sombreado es plano (cel-shading), no gradientes realistas?
- [ ] ¿Las proporciones de personajes coinciden con apariciones anteriores del mismo personaje?
- [ ] ¿El contexto histórico/cultural es coherente (vestimenta, arquitectura, época)?
- [ ] ¿Se lee bien reducida a tamaño pequeño (para ilustraciones de preguntas)?

Si una imagen no pasa este checklist, no se integra hasta ajustarla —
se lo voy a señalar explícitamente en vez de integrarla igual.

---

## 8. Prompts listos — Fondos principales (categoría 1, primero)

Redactados para usar en cualquier generador de imágenes. Cada uno
codifica la guía de arriba.

**bg-menu** (Menú principal):
> Warm illustrated comic-style background, night sky over ancient
> Judean hills, single warm golden light source (a rising star/halo
> glow) low on the horizon, deep indigo night sky (#1A1F3C), warm gold
> highlights (#E8B94A), clay-colored (#C0603D) distant stone
> architecture silhouettes, olive trees, flat cel-shaded, thick
> consistent ink outlines, moderate detail, vertical/portrait
> composition, no characters, no text.

**bg-player-setup** (Selección de jugador):
> Warm illustrated comic-style background, cozy interior scene evoking
> an ancient scroll room or a quiet stone courtyard at golden hour,
> warm parchment tones (#F5E8C9), gold light accents (#E8B94A), olive
> plants, flat cel-shaded, thick consistent ink outlines, moderate
> detail, vertical/portrait composition, no characters, no text.

**bg-game** (Pantalla de juego):
> Warm illustrated comic-style background, open Galilean landscape
> with the Sea of Galilee visible, warm golden-hour lighting
> (#E8B94A), deep indigo sky accents (#1A1F3C), clay-toned hills
> (#C0603D), olive trees, flat cel-shaded, thick consistent ink
> outlines, moderate detail, subdued/soft focus so foreground UI stays
> readable, vertical/portrait composition, no characters, no text.

**bg-score** (Puntuación):
> Warm illustrated comic-style background, ancient stone courtyard
> with warm golden banners or laurel-like motifs suggesting
> achievement, gold light (#E8B94A), clay stone architecture
> (#C0603D), flat cel-shaded, thick consistent ink outlines, moderate
> detail, vertical/portrait composition, no characters, no text.

**bg-configuration** (Configuración):
> Warm illustrated comic-style background, quiet study/scroll
> archive scene with soft warm lamp light (#E8B94A), parchment tones
> (#F5E8C9), deep indigo shadow accents (#1A1F3C), flat cel-shaded,
> thick consistent ink outlines, moderate detail, vertical/portrait
> composition, no characters, no text.

---

## Próximos pasos (en el orden que definiste)

1. **Fondos (5)** — prompts arriba, listos para usar
2. **Personajes** (`char-celebrate`, `char-encourage`) — preparo los
   prompts cuando confirmemos los fondos, para poder referenciar su
   estilo ya aprobado como anclaje visual
3. **Íconos** — hoy son de lucide-react (código); si querés arte
   propio, lo definimos en ese momento
4. **Ilustraciones de preguntas** — arranco con 10 de prueba una vez
   que fondos y personajes estén aprobados, para heredar el estilo ya
   validado
5. **Música** — sigue pendiente tu confirmación de cantidad/títulos

No avanzo a la Fase 5 hasta que este proceso de identidad visual esté
resuelto, como pediste.
