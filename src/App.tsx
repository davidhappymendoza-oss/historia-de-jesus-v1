// @ts-nocheck
// -----------------------------------------------------------------
// Este archivo es el juego COMPLETO, portado tal cual desde el
// artefacto interactivo (mismas pantallas, mismo motor de juego,
// misma lógica) — no es un scaffold ni una demo. Las únicas
// diferencias son de INTEGRACIÓN con este proyecto real (ver
// CHANGELOG): assets reales en vez de base64, audioService real en
// vez de síntesis, localStorage real en vez de window.storage.
//
// @ts-nocheck: este archivo se escribió como JS/JSX sin anotaciones
// de tipos (igual que el artefacto de origen). Se desactiva el chequeo
// estricto de TypeScript SOLO en este archivo para que `tsc -b` no
// bloquee el build por falta de tipos explícitos — no cambia el
// comportamiento en tiempo de ejecución (Vite/esbuild igual lo
// transpila y empaqueta normalmente). Tipar este archivo por completo
// es un cambio de mantenimiento separado, no de funcionalidad.
// -----------------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import { Play, Settings, Trophy, Heart, ArrowLeft, Clock, RotateCcw, Trash2, Check, X, Sparkles, Lock, Unlock, HeartHandshake, Pause, Volume2, VolumeX } from "lucide-react";
import { ASSET_MANIFEST } from "@/config/assetManifest";
import { audioService, getMusicState, subscribeMusicState, initMusicPreferences } from "@/services/audio";

/**
 * HISTORIA DE JESÚS — Fase 2 (Artefacto interactivo)
 *
 * Todo lo listado como objetivo de esta fase queda FUNCIONAL, no
 * placeholder: cronómetro, preguntas aleatorias con anti-repetición,
 * vidas, puntuación, explicación bíblica (VerseRevealCard), persistencia
 * y un banco de preguntas real (40 preguntas, arquitectura lista para
 * escalar a ~1000 en la Fase 5 sin tocar lógica).
 *
 * Secciones:
 *   1. Banco de preguntas (dato puro, aislado de la lógica)
 *   2. i18n (ES/EN)
 *   3. Tema visual
 *   4. Audio (servicio real de archivos — ver src/services/audio)
 *   5. Persistencia (localStorage real, vía shim storage)
 *   6. Dominio: perfil de jugador, selector anti-repetición, estadísticas
 *   7. Componentes UI reutilizables
 *   8. Pantallas (Menú, Jugador, Configuración, Puntuación, Juego real)
 *   9. App raíz
 */

// ============================================================
// 0. Recursos incrustados (base64) — subidos por el usuario
// ============================================================
// El artefacto no puede leer archivos locales ni cargar URLs externas
// propias del usuario, así que las imágenes entregadas se incrustan
// directamente aquí como datos base64. El proyecto de respaldo (ZIP)
// usa en cambio los archivos reales en sus rutas normales — ver
// ASSET_MANIFEST más abajo, que es el único lugar que referencia esto.

// Assets reales: se eliminaron las constantes embebidas en base64
// (imagenes y video) porque este proyecto es una app Vite real con
// carpeta public/ — las rutas reales ya estan centralizadas en
// src/config/assetManifest.ts (import ASSET_MANIFEST mas abajo).

// ============================================================
// 1. BANCO DE PREGUNTAS — dato puro. Agregar/editar preguntas es
//    solo tocar este arreglo; ninguna otra sección de este archivo
//    necesita cambiar cuando el banco crezca hacia las ~1000 (Fase 5).
// ============================================================

const QUESTION_BANK = [
  {
    id: "jn-02-milagros-01",
    reference: { gospel: "Juan", chapter: 2, verses: "1-11" },
    characters: ["Jesús", "María", "los discípulos"],
    location: "Caná de Galilea",
    category: "milagros",
    subcategory: "primer_milagro",
    level: 1,
    difficulty: "all",
    illustration: "milagros/bodas-cana.png",
    keywords: ["agua", "vino", "boda", "Caná"],
    content: {
      es: {
        prompt: "En las bodas de Caná, ¿en qué convirtió Jesús el agua?",
        options: ["En vino", "En aceite", "En pan"],
        correctIndex: 0,
        explanation: "Jesús convirtió el agua en vino de excelente calidad, sorprendiendo al maestresala de la fiesta.",
        historicalContext: "Las bodas judías duraban varios días; quedarse sin vino era una vergüenza social grave para la familia anfitriona.",
        culturalContext: "María intercede ante una necesidad práctica, mostrando su papel de mediadora en el relato de Juan.",
        mainTeaching: "Es el primer milagro ('señal') de Jesús en Juan: manifiesta su gloria y fortalece la fe de sus discípulos.",
        verseText: "Este fue el primero de sus milagros, con el que reveló su gloria, y sus discípulos creyeron en él.",
      },
      en: {
        prompt: "At the wedding in Cana, what did Jesus turn the water into?",
        options: ["Wine", "Oil", "Bread"],
        correctIndex: 0,
        explanation: "Jesus turned the water into excellent wine, surprising the master of the feast.",
        historicalContext: "Jewish weddings lasted several days; running out of wine was a serious embarrassment for the host family.",
        culturalContext: "Mary intercedes over a practical need, showing her role as a mediator in John's account.",
        mainTeaching: "This is Jesus's first miraculous sign in John: it reveals his glory and strengthens his disciples' faith.",
        verseText: "This was the first of his miraculous signs, and it revealed his glory, so his disciples believed in him.",
      },
    },
  },
  {
    id: "mc-04-milagros-02",
    reference: { gospel: "Marcos", chapter: 4, verses: "35-41" },
    characters: ["Jesús", "los discípulos"],
    location: "Mar de Galilea",
    category: "milagros",
    subcategory: "poder_sobre_naturaleza",
    level: 2,
    difficulty: "all",
    illustration: "milagros/tempestad-calmada.png",
    keywords: ["tempestad", "barca", "fe", "miedo"],
    content: {
      es: {
        prompt: "Cuando Jesús calmó la tempestad, ¿qué les preguntó después a sus discípulos?",
        options: ["¿Por qué tenéis tanto miedo? ¿No tenéis fe?", "¿Quién sabe navegar mejor?", "¿Por qué me despertaron?"],
        correctIndex: 0,
        explanation: "Jesús reprendió el viento y el mar, y luego cuestionó la falta de fe de sus discípulos ante el miedo.",
        historicalContext: "El Mar de Galilea es propenso a tormentas repentinas por la geografía de colinas que lo rodean.",
        culturalContext: "Varios discípulos eran pescadores experimentados; que ellos temieran subraya la gravedad de la tormenta.",
        mainTeaching: "El episodio muestra la autoridad de Jesús sobre la naturaleza y llama a confiar en él en medio del temor.",
        verseText: "Jesús les dijo: ¿Por qué tienen tanto miedo? ¿Todavía no tienen fe?",
      },
      en: {
        prompt: "After calming the storm, what did Jesus ask his disciples?",
        options: ["Why are you so afraid? Do you still have no faith?", "Who here can sail better?", "Why did you wake me?"],
        correctIndex: 0,
        explanation: "Jesus rebuked the wind and sea, then questioned his disciples' lack of faith in their fear.",
        historicalContext: "The Sea of Galilee is prone to sudden storms due to the surrounding hills' geography.",
        culturalContext: "Several disciples were experienced fishermen; their fear underscores how severe the storm was.",
        mainTeaching: "The episode shows Jesus's authority over nature and calls his followers to trust him amid fear.",
        verseText: "He said to them: Why are you so afraid? Do you still have no faith?",
      },
    },
  },
  {
    id: "jn-06-milagros-03",
    reference: { gospel: "Juan", chapter: 6, verses: "1-14" },
    characters: ["Jesús", "un niño", "los discípulos", "la multitud"],
    location: "orillas del Mar de Galilea",
    category: "milagros",
    subcategory: "provision",
    level: 3,
    difficulty: "all",
    illustration: "milagros/multiplicacion-panes.png",
    keywords: ["panes", "peces", "multitud", "provisión"],
    content: {
      es: {
        prompt: "¿Con cuántos panes y peces alimentó Jesús a la multitud?",
        options: ["5 panes y 2 peces", "7 panes y 3 peces", "2 panes y 5 peces"],
        correctIndex: 0,
        explanation: "Un niño ofreció 5 panes de cebada y 2 peces; Jesús los multiplicó para alimentar a miles de personas.",
        historicalContext: "El pan de cebada era comida humilde, típica de los pobres, lo que resalta lo modesto de la ofrenda inicial.",
        culturalContext: "Compartir comida en multitud remitía a la hospitalidad y provisión de Dios en el desierto con el maná.",
        mainTeaching: "El milagro enseña que Jesús provee abundantemente incluso a partir de lo poco que se le ofrece.",
        verseText: "Todos comieron hasta quedar satisfechos, y aun recogieron doce canastas con los pedazos que sobraron.",
      },
      en: {
        prompt: "How many loaves and fish did Jesus use to feed the crowd?",
        options: ["5 loaves and 2 fish", "7 loaves and 3 fish", "2 loaves and 5 fish"],
        correctIndex: 0,
        explanation: "A boy offered 5 barley loaves and 2 fish; Jesus multiplied them to feed thousands of people.",
        historicalContext: "Barley bread was humble food, typical of the poor, highlighting how modest the initial offering was.",
        culturalContext: "Sharing food among a crowd recalled hospitality and God's provision of manna in the desert.",
        mainTeaching: "The miracle teaches that Jesus provides abundantly even from the little that is offered to him.",
        verseText: "Everyone ate until they were satisfied, and twelve baskets of leftover pieces were gathered up.",
      },
    },
  },
  {
    id: "mc-02-milagros-04",
    reference: { gospel: "Marcos", chapter: 2, verses: "1-12" },
    characters: ["Jesús", "un paralítico", "cuatro amigos", "escribas"],
    location: "Capernaúm",
    category: "milagros",
    subcategory: "sanidad_y_perdon",
    level: 4,
    difficulty: "all",
    illustration: "milagros/paralitico-techo.png",
    keywords: ["paralítico", "techo", "perdón", "fe"],
    content: {
      es: {
        prompt: "¿Cómo bajaron los amigos del paralítico hasta donde estaba Jesús?",
        options: ["Abriendo un hueco en el techo", "Por la puerta principal", "Por una ventana"],
        correctIndex: 0,
        explanation: "Ante la multitud que bloqueaba la entrada, sus amigos abrieron el techo y lo bajaron en su camilla.",
        historicalContext: "Los techos de las casas de la época eran planos, hechos de barro y ramas, y accesibles por una escalera exterior.",
        culturalContext: "La persistencia de los cuatro amigos era una forma culturalmente admirada de solidaridad e intercesión.",
        mainTeaching: "Jesús primero perdona sus pecados y luego lo sana, mostrando que su autoridad abarca cuerpo y espíritu.",
        verseText: "Al ver Jesús la fe de ellos, dijo al paralítico: Hijo, tus pecados te son perdonados.",
      },
      en: {
        prompt: "How did the paralyzed man's friends get him to Jesus?",
        options: ["By digging through the roof", "Through the front door", "Through a window"],
        correctIndex: 0,
        explanation: "With the crowd blocking the entrance, his friends opened the roof and lowered him on his mat.",
        historicalContext: "Roofs of that era were flat, made of mud and branches, and reachable by an outside stairway.",
        culturalContext: "The four friends' persistence was a culturally admired form of solidarity and intercession.",
        mainTeaching: "Jesus first forgives his sins and then heals him, showing his authority covers both body and spirit.",
        verseText: "When Jesus saw their faith, he said to the paralyzed man: Son, your sins are forgiven.",
      },
    },
  },
  {
    id: "mc-10-milagros-05",
    reference: { gospel: "Marcos", chapter: 10, verses: "46-52" },
    characters: ["Jesús", "Bartimeo"],
    location: "Jericó",
    category: "milagros",
    subcategory: "sanidad",
    level: 5,
    difficulty: "all",
    illustration: "milagros/bartimeo.png",
    keywords: ["ciego", "Jericó", "fe", "sanidad"],
    content: {
      es: {
        prompt: "¿Qué le pidió Jesús a Bartimeo antes de sanarlo?",
        options: ["¿Qué quieres que haga por ti?", "¿Cuánto tiempo llevas ciego?", "¿Por qué gritas tanto?"],
        correctIndex: 0,
        explanation: "Aunque era evidente que Bartimeo era ciego, Jesús le pidió que expresara su petición en voz propia.",
        historicalContext: "Los mendigos ciegos solían ubicarse en los caminos de entrada a las ciudades, como Jericó, para pedir limosna.",
        culturalContext: "Que Jesús se detuviera para alguien de tan baja posición social rompía las costumbres esperadas.",
        mainTeaching: "El milagro enseña que la fe declarada abiertamente y con insistencia es honrada por Jesús.",
        verseText: "Jesús le dijo: Vete, tu fe te ha sanado. Al instante recobró la vista y lo siguió por el camino.",
      },
      en: {
        prompt: "What did Jesus ask Bartimeus before healing him?",
        options: ["What do you want me to do for you?", "How long have you been blind?", "Why are you shouting so much?"],
        correctIndex: 0,
        explanation: "Though it was obvious Bartimeus was blind, Jesus asked him to voice his own request.",
        historicalContext: "Blind beggars often positioned themselves along roads leading into cities, like Jericho, to ask for alms.",
        culturalContext: "Jesus stopping for someone of such low social standing broke the expected customs of the day.",
        mainTeaching: "The miracle teaches that faith openly and persistently declared is honored by Jesus.",
        verseText: "Jesus said to him: Go, your faith has healed you. At once he received his sight and followed him.",
      },
    },
  },
  {
    id: "jn-11-milagros-06",
    reference: { gospel: "Juan", chapter: 11, verses: "1-44" },
    characters: ["Jesús", "Lázaro", "Marta", "María"],
    location: "Betania",
    category: "milagros",
    subcategory: "resurreccion",
    level: 6,
    difficulty: "all",
    illustration: "milagros/lazaro.png",
    keywords: ["Lázaro", "resurrección", "Betania", "Marta"],
    content: {
      es: {
        prompt: "¿Qué declaración hizo Jesús a Marta antes de resucitar a Lázaro?",
        options: ["Yo soy la resurrección y la vida", "Yo soy el buen pastor", "Yo soy la puerta"],
        correctIndex: 0,
        explanation: "Jesús le declaró a Marta 'Yo soy la resurrección y la vida' antes de llamar a Lázaro fuera de la tumba.",
        historicalContext: "Para entonces Lázaro llevaba cuatro días muerto, tiempo en el que se creía que el alma ya había partido.",
        culturalContext: "El luto judío incluía llanto público y visitas de consuelo, presentes cuando Jesús llegó a Betania.",
        mainTeaching: "El milagro señala a Jesús como fuente de vida eterna, no solo sanador de enfermedades físicas.",
        verseText: "Jesús le dijo: Yo soy la resurrección y la vida. El que cree en mí, aunque muera, vivirá.",
      },
      en: {
        prompt: "What declaration did Jesus make to Martha before raising Lazarus?",
        options: ["I am the resurrection and the life", "I am the good shepherd", "I am the door"],
        correctIndex: 0,
        explanation: "Jesus declared to Martha 'I am the resurrection and the life' before calling Lazarus out of the tomb.",
        historicalContext: "By then Lazarus had been dead four days, a time when it was believed the soul had already departed.",
        culturalContext: "Jewish mourning included public weeping and comforting visits, present when Jesus arrived in Bethany.",
        mainTeaching: "The miracle points to Jesus as the source of eternal life, not merely a healer of physical illness.",
        verseText: "Jesus said to her: I am the resurrection and the life. Whoever believes in me will live, even though they die.",
      },
    },
  },
  {
    id: "lc-10-parabolas-01",
    reference: { gospel: "Lucas", chapter: 10, verses: "25-37" },
    characters: ["un samaritano", "un sacerdote", "un levita", "un hombre herido"],
    location: "camino de Jerusalén a Jericó",
    category: "parabolas",
    subcategory: "amor_al_projimo",
    level: 1,
    difficulty: "all",
    illustration: "parabolas/buen-samaritano.png",
    keywords: ["samaritano", "prójimo", "compasión"],
    content: {
      es: {
        prompt: "En la parábola del buen samaritano, ¿quiénes pasaron de largo antes de que el samaritano ayudara?",
        options: ["Un sacerdote y un levita", "Un rey y un soldado", "Dos mercaderes"],
        correctIndex: 0,
        explanation: "Un sacerdote y un levita vieron al herido y siguieron de largo; fue un samaritano quien se detuvo a ayudarlo.",
        historicalContext: "Judíos y samaritanos tenían una fuerte enemistad religiosa y étnica en el siglo I.",
        culturalContext: "Que el héroe de la historia fuera samaritano, y no un líder religioso judío, era sorprendente para la audiencia.",
        mainTeaching: "Jesús redefine 'prójimo' como cualquiera que muestra misericordia, sin importar su origen.",
        verseText: "Ve y haz tú lo mismo, le dijo Jesús al maestro de la ley que había preguntado quién era su prójimo.",
      },
      en: {
        prompt: "In the parable of the good Samaritan, who passed by before the Samaritan helped?",
        options: ["A priest and a Levite", "A king and a soldier", "Two merchants"],
        correctIndex: 0,
        explanation: "A priest and a Levite saw the injured man and passed by; it was a Samaritan who stopped to help him.",
        historicalContext: "Jews and Samaritans held strong religious and ethnic hostility toward one another in the first century.",
        culturalContext: "That the hero of the story was a Samaritan, not a Jewish religious leader, was shocking to the audience.",
        mainTeaching: "Jesus redefines 'neighbor' as anyone who shows mercy, regardless of their background.",
        verseText: "Go and do likewise, Jesus told the expert in the law who had asked who his neighbor was.",
      },
    },
  },
  {
    id: "lc-15-parabolas-02",
    reference: { gospel: "Lucas", chapter: 15, verses: "11-32" },
    characters: ["un padre", "el hijo menor", "el hijo mayor"],
    location: "no especificado",
    category: "parabolas",
    subcategory: "arrepentimiento_y_gracia",
    level: 2,
    difficulty: "all",
    illustration: "parabolas/hijo-prodigo.png",
    keywords: ["hijo pródigo", "perdón", "herencia"],
    content: {
      es: {
        prompt: "¿Qué hizo el padre al ver regresar a su hijo menor?",
        options: ["Corrió a abrazarlo antes de que hablara", "Lo dejó esperando en la puerta", "Le exigió trabajar primero"],
        correctIndex: 0,
        explanation: "El padre lo vio de lejos, corrió a su encuentro y lo abrazó antes de escuchar su confesión.",
        historicalContext: "Pedir la herencia en vida era una ofensa grave; equivalía a desear la muerte del padre.",
        culturalContext: "Que un hombre mayor corriera en público rompía el decoro esperado, mostrando la urgencia de su amor.",
        mainTeaching: "La parábola retrata el perdón de Dios: acoge al arrepentido con gracia, sin condiciones previas.",
        verseText: "Cuando todavía estaba lejos, su padre lo vio y, lleno de compasión, corrió, se echó a su cuello y lo besó.",
      },
      en: {
        prompt: "What did the father do when he saw his younger son returning?",
        options: ["He ran to embrace him before he spoke", "He left him waiting at the door", "He demanded he work first"],
        correctIndex: 0,
        explanation: "The father saw him from far off, ran to meet him, and embraced him before hearing his confession.",
        historicalContext: "Asking for one's inheritance early was a serious offense, effectively wishing the father dead.",
        culturalContext: "An older man running in public broke expected decorum, showing the urgency of his love.",
        mainTeaching: "The parable portrays God's forgiveness: welcoming the repentant with grace, with no prior conditions.",
        verseText: "While he was still a long way off, his father saw him and was filled with compassion; he ran to him.",
      },
    },
  },
  {
    id: "mt-13-parabolas-03",
    reference: { gospel: "Mateo", chapter: 13, verses: "1-23" },
    characters: ["un sembrador"],
    location: "orillas del Mar de Galilea",
    category: "parabolas",
    subcategory: "recepcion_del_mensaje",
    level: 3,
    difficulty: "all",
    illustration: "parabolas/sembrador.png",
    keywords: ["semilla", "tierra", "fruto"],
    content: {
      es: {
        prompt: "En la parábola del sembrador, ¿qué representa la semilla que cae en buena tierra?",
        options: ["Al que oye la palabra y la entiende, dando fruto", "Al que nunca escucha nada", "Al que siembra sin cuidado"],
        correctIndex: 0,
        explanation: "La semilla en buena tierra representa a quien recibe la palabra, la comprende, y produce fruto abundante.",
        historicalContext: "La agricultura de secano en Galilea convivía con caminos, pedregales y espinos entremezclados en los campos.",
        culturalContext: "Las parábolas agrícolas eran fácilmente comprendidas por una audiencia mayormente campesina.",
        mainTeaching: "La parábola enseña que la disposición del corazón determina cuánto fruto produce el mensaje de Jesús.",
        verseText: "Pero el que fue sembrado en buena tierra es el que oye la palabra y la entiende, y da fruto.",
      },
      en: {
        prompt: "In the parable of the sower, what does the seed on good soil represent?",
        options: ["One who hears the word, understands it, and bears fruit", "One who never listens at all", "One who sows carelessly"],
        correctIndex: 0,
        explanation: "The seed on good soil represents someone who receives the word, understands it, and produces abundant fruit.",
        historicalContext: "Dry farming in Galilee coexisted with paths, rocky patches, and thorns mixed throughout the fields.",
        culturalContext: "Agricultural parables were easily understood by an audience that was largely made up of farmers.",
        mainTeaching: "The parable teaches that the condition of the heart determines how much fruit Jesus's message produces.",
        verseText: "The one who received the seed that fell on good soil is the one who hears the word and understands it.",
      },
    },
  },
  {
    id: "lc-15-parabolas-04",
    reference: { gospel: "Lucas", chapter: 15, verses: "3-7" },
    characters: ["un pastor", "noventa y nueve ovejas", "una oveja perdida"],
    location: "no especificado",
    category: "parabolas",
    subcategory: "busqueda_de_lo_perdido",
    level: 4,
    difficulty: "all",
    illustration: "parabolas/oveja-perdida.png",
    keywords: ["oveja", "pastor", "buscar"],
    content: {
      es: {
        prompt: "¿Qué hace el pastor de la parábola al perder una de sus cien ovejas?",
        options: ["Deja las 99 y va a buscar la perdida", "Compra otra oveja para reemplazarla", "Espera a que regrese sola"],
        correctIndex: 0,
        explanation: "El pastor deja las noventa y nueve en el desierto y va tras la oveja perdida hasta encontrarla.",
        historicalContext: "El pastoreo era una ocupación común y humilde; perder una oveja representaba una pérdida económica real.",
        culturalContext: "Encontrar la oveja provoca una celebración comunitaria, reflejando el valor del regocijo compartido.",
        mainTeaching: "La parábola muestra la alegría de Dios por cada persona que se aparta y regresa a él.",
        verseText: "Os digo que de igual manera habrá más alegría en el cielo por un pecador que se arrepiente.",
      },
      en: {
        prompt: "What does the shepherd in the parable do when he loses one of his hundred sheep?",
        options: ["He leaves the 99 and searches for the lost one", "He buys another sheep to replace it", "He waits for it to return on its own"],
        correctIndex: 0,
        explanation: "The shepherd leaves the ninety-nine in the wilderness and goes after the lost sheep until he finds it.",
        historicalContext: "Shepherding was a common, humble occupation; losing a sheep represented a real economic loss.",
        culturalContext: "Finding the sheep prompts a community celebration, reflecting the value placed on shared joy.",
        mainTeaching: "The parable shows God's joy over every person who strays and returns to him.",
        verseText: "I tell you, in the same way there will be more rejoicing in heaven over one sinner who repents.",
      },
    },
  },
  {
    id: "mt-25-parabolas-05",
    reference: { gospel: "Mateo", chapter: 25, verses: "14-30" },
    characters: ["un señor", "tres siervos"],
    location: "no especificado",
    category: "parabolas",
    subcategory: "mayordomia",
    level: 5,
    difficulty: "all",
    illustration: "parabolas/talentos.png",
    keywords: ["talentos", "siervos", "fidelidad"],
    content: {
      es: {
        prompt: "¿Qué hizo el siervo que recibió un solo talento?",
        options: ["Lo enterró por miedo a perderlo", "Lo invirtió y ganó el doble", "Se lo dio a otro siervo"],
        correctIndex: 0,
        explanation: "Por temor, el tercer siervo enterró su talento en vez de ponerlo a producir como hicieron los otros dos.",
        historicalContext: "Un talento era una gran suma de dinero, equivalente a años de salario de un trabajador común.",
        culturalContext: "Enterrar dinero era una forma conocida de resguardarlo, aunque implicaba no generar ningún beneficio.",
        mainTeaching: "La parábola enseña que Dios espera que usemos con valentía lo que nos ha confiado, sin actuar por miedo.",
        verseText: "Bien, buen siervo y fiel; sobre poco has sido fiel, sobre mucho te pondré. Entra en el gozo de tu señor.",
      },
      en: {
        prompt: "What did the servant who received a single talent do?",
        options: ["He buried it out of fear of losing it", "He invested it and doubled it", "He gave it to another servant"],
        correctIndex: 0,
        explanation: "Out of fear, the third servant buried his talent instead of putting it to work like the other two did.",
        historicalContext: "A talent was a very large sum of money, equivalent to years of an ordinary worker's wages.",
        culturalContext: "Burying money was a known way to safeguard it, though it meant generating no benefit at all.",
        mainTeaching: "The parable teaches that God expects us to boldly use what he has entrusted to us, not act out of fear.",
        verseText: "Well done, good and faithful servant! You have been faithful with a few things; enter your master's joy.",
      },
    },
  },
  {
    id: "lc-18-parabolas-06",
    reference: { gospel: "Lucas", chapter: 18, verses: "9-14" },
    characters: ["un fariseo", "un publicano"],
    location: "el templo",
    category: "parabolas",
    subcategory: "humildad",
    level: 6,
    difficulty: "all",
    illustration: "parabolas/fariseo-publicano.png",
    keywords: ["fariseo", "publicano", "humildad", "oración"],
    content: {
      es: {
        prompt: "¿Quién de los dos, el fariseo o el publicano, volvió a casa justificado según Jesús?",
        options: ["El publicano", "El fariseo", "Ninguno de los dos"],
        correctIndex: 0,
        explanation: "El publicano, humillado y reconociendo su pecado, fue quien volvió a casa justificado ante Dios.",
        historicalContext: "Los publicanos (cobradores de impuestos) eran despreciados por colaborar con Roma; los fariseos eran muy respetados.",
        culturalContext: "Invertir los roles esperados de 'justo' y 'pecador' era una estrategia retórica característica de Jesús.",
        mainTeaching: "La parábola enseña que Dios exalta al humilde y se opone al que confía en su propia justicia.",
        verseText: "Porque todo el que se enaltece será humillado, y el que se humilla será enaltecido.",
      },
      en: {
        prompt: "According to Jesus, who went home justified — the Pharisee or the tax collector?",
        options: ["The tax collector", "The Pharisee", "Neither of them"],
        correctIndex: 0,
        explanation: "The tax collector, humbled and acknowledging his sin, was the one who went home justified before God.",
        historicalContext: "Tax collectors were despised for collaborating with Rome; Pharisees were highly respected.",
        culturalContext: "Reversing the expected roles of 'righteous' and 'sinner' was a rhetorical strategy typical of Jesus.",
        mainTeaching: "The parable teaches that God exalts the humble and opposes those who trust in their own righteousness.",
        verseText: "For all those who exalt themselves will be humbled, and those who humble themselves will be exalted.",
      },
    },
  },
  {
    id: "mt-13-parabolas-07",
    reference: { gospel: "Mateo", chapter: 13, verses: "31-32" },
    characters: [],
    location: "no especificado",
    category: "parabolas",
    subcategory: "reino_de_dios",
    level: 7,
    difficulty: "all",
    illustration: "parabolas/grano-mostaza.png",
    keywords: ["mostaza", "reino de los cielos", "crecimiento"],
    content: {
      es: {
        prompt: "¿Con qué compara Jesús el Reino de los Cielos en esta parábola?",
        options: ["Con un grano de mostaza que crece hasta ser un gran árbol", "Con una montaña inamovible", "Con un río caudaloso"],
        correctIndex: 0,
        explanation: "Jesús compara el Reino con la semilla de mostaza: diminuta al sembrarse, pero que crece hasta ser un gran arbusto.",
        historicalContext: "La semilla de mostaza era proverbialmente pequeña en la cultura agrícola de la región.",
        culturalContext: "Las aves anidando en sus ramas evocaban imágenes proféticas de un reino que da cobijo a las naciones.",
        mainTeaching: "La parábola enseña que el Reino de Dios comienza pequeño pero crece hasta un alcance sorprendente.",
        verseText: "Es la más pequeña de todas las semillas, pero se convierte en la más grande de las hortalizas.",
      },
      en: {
        prompt: "What does Jesus compare the Kingdom of Heaven to in this parable?",
        options: ["A mustard seed that grows into a large tree", "An immovable mountain", "A mighty river"],
        correctIndex: 0,
        explanation: "Jesus compares the Kingdom to a mustard seed: tiny when planted, but growing into a large shrub.",
        historicalContext: "The mustard seed was proverbially tiny within the agricultural culture of the region.",
        culturalContext: "Birds nesting in its branches evoked prophetic imagery of a kingdom sheltering the nations.",
        mainTeaching: "The parable teaches that the Kingdom of God starts small but grows to a surprising reach.",
        verseText: "It is the smallest of all seeds, but it becomes the largest of garden plants.",
      },
    },
  },
  {
    id: "lc-12-parabolas-08",
    reference: { gospel: "Lucas", chapter: 12, verses: "16-21" },
    characters: ["un hombre rico"],
    location: "no especificado",
    category: "parabolas",
    subcategory: "materialismo",
    level: 8,
    difficulty: "all",
    illustration: "parabolas/rico-insensato.png",
    keywords: ["riqueza", "graneros", "insensatez"],
    content: {
      es: {
        prompt: "¿Qué planeaba hacer el rico insensato con su abundante cosecha?",
        options: ["Construir graneros más grandes para acumularla", "Repartirla entre los pobres", "Venderla de inmediato"],
        correctIndex: 0,
        explanation: "El hombre decidió derribar sus graneros y construir otros más grandes para guardar toda su riqueza.",
        historicalContext: "Una buena cosecha podía asegurar años de estabilidad, por lo que acumular grano era una práctica común.",
        culturalContext: "Hablar solo consigo mismo sobre su fortuna resalta su aislamiento respecto a Dios y a los demás.",
        mainTeaching: "La parábola advierte contra fiar la seguridad en las riquezas en vez de ser rico para con Dios.",
        verseText: "Esa misma noche te pedirán la vida. ¿Y para quién será todo lo que has acumulado?",
      },
      en: {
        prompt: "What did the foolish rich man plan to do with his abundant harvest?",
        options: ["Build bigger barns to store it all", "Give it away to the poor", "Sell it immediately"],
        correctIndex: 0,
        explanation: "The man decided to tear down his barns and build bigger ones to store all of his wealth.",
        historicalContext: "A good harvest could secure years of stability, so accumulating grain was a common practice.",
        culturalContext: "Talking only to himself about his fortune highlights his isolation from both God and others.",
        mainTeaching: "The parable warns against placing security in wealth rather than being rich toward God.",
        verseText: "This very night your life will be demanded from you. Then who will get what you have prepared?",
      },
    },
  },
  {
    id: "mt-05-bienav-01",
    reference: { gospel: "Mateo", chapter: 5, verses: "3" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "primera_bienaventuranza",
    level: 1,
    difficulty: "all",
    illustration: "bienaventuranzas/pobres-espiritu.png",
    keywords: ["bienaventuranzas", "sermón del monte", "humildad"],
    content: {
      es: {
        prompt: "Según la primera bienaventuranza, ¿de quiénes es el reino de los cielos?",
        options: ["De los pobres en espíritu", "De los ricos generosos", "De los sabios instruidos"],
        correctIndex: 0,
        explanation: "Jesús declara bienaventurados a los pobres en espíritu, pues de ellos es el reino de los cielos.",
        historicalContext: "El Sermón del Monte se dirigía a una audiencia mayormente pobre bajo dominio romano.",
        culturalContext: "'Pobre en espíritu' remite a quien reconoce su necesidad total de Dios, no a la pobreza material en sí.",
        mainTeaching: "Enseña que la humildad ante Dios, no el mérito propio, es la puerta de entrada a su reino.",
        verseText: "Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos.",
      },
      en: {
        prompt: "According to the first beatitude, whose is the kingdom of heaven?",
        options: ["The poor in spirit", "Generous rich people", "Educated scholars"],
        correctIndex: 0,
        explanation: "Jesus declares the poor in spirit blessed, for theirs is the kingdom of heaven.",
        historicalContext: "The Sermon on the Mount addressed a largely poor audience living under Roman rule.",
        culturalContext: "'Poor in spirit' points to one who recognizes total need for God, not material poverty itself.",
        mainTeaching: "It teaches that humility before God, not personal merit, is the gateway into his kingdom.",
        verseText: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
      },
    },
  },
  {
    id: "mt-05-bienav-02",
    reference: { gospel: "Mateo", chapter: 5, verses: "4" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "segunda_bienaventuranza",
    level: 2,
    difficulty: "all",
    illustration: "bienaventuranzas/los-que-lloran.png",
    keywords: ["bienaventuranzas", "consuelo", "duelo"],
    content: {
      es: {
        prompt: "Según Jesús, ¿qué recibirán los que lloran?",
        options: ["Serán consolados", "Recibirán riquezas", "Serán famosos"],
        correctIndex: 0,
        explanation: "Jesús promete que quienes lloran serán consolados por Dios mismo.",
        historicalContext: "El duelo público era una práctica común y visible en la cultura judía del primer siglo.",
        culturalContext: "La promesa de consuelo divino contrastaba con la ausencia de garantías de bienestar en la vida cotidiana.",
        mainTeaching: "Enseña que el sufrimiento honesto ante Dios no queda sin respuesta ni sin esperanza.",
        verseText: "Bienaventurados los que lloran, porque ellos recibirán consolación.",
      },
      en: {
        prompt: "According to Jesus, what will those who mourn receive?",
        options: ["They will be comforted", "They will receive riches", "They will become famous"],
        correctIndex: 0,
        explanation: "Jesus promises that those who mourn will be comforted by God himself.",
        historicalContext: "Public mourning was a common, visible practice in first-century Jewish culture.",
        culturalContext: "The promise of divine comfort stood in contrast to the lack of guaranteed wellbeing in daily life.",
        mainTeaching: "It teaches that honest suffering brought before God does not go unanswered or without hope.",
        verseText: "Blessed are those who mourn, for they will be comforted.",
      },
    },
  },
  {
    id: "mt-05-bienav-03",
    reference: { gospel: "Mateo", chapter: 5, verses: "5" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "tercera_bienaventuranza",
    level: 3,
    difficulty: "all",
    illustration: "bienaventuranzas/los-mansos.png",
    keywords: ["bienaventuranzas", "mansedumbre", "tierra"],
    content: {
      es: {
        prompt: "Según Jesús, ¿qué heredarán los mansos?",
        options: ["La tierra", "Grandes ejércitos", "El poder político"],
        correctIndex: 0,
        explanation: "Jesús declara que los mansos heredarán la tierra, invirtiendo la lógica del poder por la fuerza.",
        historicalContext: "En un contexto de ocupación romana, 'heredar la tierra' evocaba esperanzas mesiánicas del pueblo judío.",
        culturalContext: "La mansedumbre no era debilidad, sino fuerza controlada y sometida a Dios.",
        mainTeaching: "Enseña que la humildad paciente, no la conquista violenta, es el camino del Reino de Dios.",
        verseText: "Bienaventurados los mansos, porque ellos heredarán la tierra.",
      },
      en: {
        prompt: "According to Jesus, what will the meek inherit?",
        options: ["The earth", "Great armies", "Political power"],
        correctIndex: 0,
        explanation: "Jesus declares that the meek will inherit the earth, reversing the logic of power through force.",
        historicalContext: "Under Roman occupation, 'inheriting the land' evoked messianic hopes among the Jewish people.",
        culturalContext: "Meekness was not weakness, but controlled strength submitted to God.",
        mainTeaching: "It teaches that patient humility, not violent conquest, is the way of the Kingdom of God.",
        verseText: "Blessed are the meek, for they will inherit the earth.",
      },
    },
  },
  {
    id: "mt-05-bienav-04",
    reference: { gospel: "Mateo", chapter: 5, verses: "6" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "cuarta_bienaventuranza",
    level: 4,
    difficulty: "all",
    illustration: "bienaventuranzas/hambre-de-justicia.png",
    keywords: ["bienaventuranzas", "justicia", "hambre"],
    content: {
      es: {
        prompt: "¿Qué promete Jesús a los que tienen hambre y sed de justicia?",
        options: ["Serán saciados", "Recibirán tierras", "Vivirán muchos años"],
        correctIndex: 0,
        explanation: "Jesús promete que quienes anhelan la justicia con la intensidad del hambre y la sed serán saciados.",
        historicalContext: "El hambre y la sed eran experiencias cotidianas reales para gran parte de la audiencia de Jesús.",
        culturalContext: "'Justicia' aquí incluye tanto la rectitud personal como la justicia social esperada por los profetas.",
        mainTeaching: "Enseña que Dios satisface plenamente a quien busca vivir y ver establecida su justicia.",
        verseText: "Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados.",
      },
      en: {
        prompt: "What does Jesus promise to those who hunger and thirst for righteousness?",
        options: ["They will be filled", "They will receive land", "They will live many years"],
        correctIndex: 0,
        explanation: "Jesus promises that those who long for righteousness as intensely as hunger and thirst will be filled.",
        historicalContext: "Hunger and thirst were real everyday experiences for much of Jesus's audience.",
        culturalContext: "'Righteousness' here includes both personal integrity and the social justice expected by the prophets.",
        mainTeaching: "It teaches that God fully satisfies those who seek to live out and see his justice established.",
        verseText: "Blessed are those who hunger and thirst for righteousness, for they will be filled.",
      },
    },
  },
  {
    id: "mt-05-bienav-05",
    reference: { gospel: "Mateo", chapter: 5, verses: "7" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "quinta_bienaventuranza",
    level: 5,
    difficulty: "all",
    illustration: "bienaventuranzas/misericordiosos.png",
    keywords: ["bienaventuranzas", "misericordia"],
    content: {
      es: {
        prompt: "¿Qué recibirán los misericordiosos, según Jesús?",
        options: ["Alcanzarán misericordia", "Recibirán autoridad", "Serán ricos"],
        correctIndex: 0,
        explanation: "Jesús enseña que quienes muestran misericordia también la recibirán de parte de Dios.",
        historicalContext: "La misericordia (rahamim/hesed) era un valor central de la ética del Antiguo Testamento.",
        culturalContext: "Mostrar compasión activa hacia el necesitado era considerado una virtud religiosa esencial.",
        mainTeaching: "Enseña una relación recíproca entre cómo tratamos a otros y cómo Dios nos trata a nosotros.",
        verseText: "Bienaventurados los misericordiosos, porque ellos alcanzarán misericordia.",
      },
      en: {
        prompt: "According to Jesus, what will the merciful receive?",
        options: ["They will be shown mercy", "They will receive authority", "They will become wealthy"],
        correctIndex: 0,
        explanation: "Jesus teaches that those who show mercy will also receive mercy from God.",
        historicalContext: "Mercy (hesed) was a central value of Old Testament ethics.",
        culturalContext: "Showing active compassion toward the needy was considered an essential religious virtue.",
        mainTeaching: "It teaches a reciprocal relationship between how we treat others and how God treats us.",
        verseText: "Blessed are the merciful, for they will be shown mercy.",
      },
    },
  },
  {
    id: "mt-05-bienav-06",
    reference: { gospel: "Mateo", chapter: 5, verses: "8" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "sexta_bienaventuranza",
    level: 6,
    difficulty: "all",
    illustration: "bienaventuranzas/limpio-corazon.png",
    keywords: ["bienaventuranzas", "pureza", "corazón"],
    content: {
      es: {
        prompt: "¿Qué verán los de limpio corazón, según Jesús?",
        options: ["A Dios", "Su propio futuro", "A los ángeles"],
        correctIndex: 0,
        explanation: "Jesús promete que los de limpio corazón verán a Dios.",
        historicalContext: "El corazón, en el pensamiento hebreo, representaba el centro de la voluntad e intención, no solo la emoción.",
        culturalContext: "La pureza ritual era importante en la práctica judía, pero Jesús aquí apunta a la pureza interior.",
        mainTeaching: "Enseña que la integridad interior, y no solo la conducta externa, abre el camino a la comunión con Dios.",
        verseText: "Bienaventurados los de limpio corazón, porque ellos verán a Dios.",
      },
      en: {
        prompt: "According to Jesus, what will the pure in heart see?",
        options: ["God", "Their own future", "Angels"],
        correctIndex: 0,
        explanation: "Jesus promises that the pure in heart will see God.",
        historicalContext: "In Hebrew thought, the heart represented the center of will and intention, not just emotion.",
        culturalContext: "Ritual purity mattered in Jewish practice, but Jesus here points to inner purity instead.",
        mainTeaching: "It teaches that inner integrity, not just external behavior, opens the way to communion with God.",
        verseText: "Blessed are the pure in heart, for they will see God.",
      },
    },
  },
  {
    id: "mt-05-bienav-07",
    reference: { gospel: "Mateo", chapter: 5, verses: "9" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "septima_bienaventuranza",
    level: 7,
    difficulty: "all",
    illustration: "bienaventuranzas/pacificadores.png",
    keywords: ["bienaventuranzas", "paz"],
    content: {
      es: {
        prompt: "¿Cómo serán llamados los pacificadores, según Jesús?",
        options: ["Hijos de Dios", "Siervos del rey", "Maestros de la ley"],
        correctIndex: 0,
        explanation: "Jesús dice que los pacificadores serán llamados hijos de Dios.",
        historicalContext: "En un contexto de ocupación romana y tensiones violentas, promover la paz era contracultural.",
        culturalContext: "Ser llamado 'hijo de' alguien en la cultura semita significaba compartir su carácter o naturaleza.",
        mainTeaching: "Enseña que buscar activamente la reconciliación refleja el carácter mismo de Dios.",
        verseText: "Bienaventurados los pacificadores, porque ellos serán llamados hijos de Dios.",
      },
      en: {
        prompt: "According to Jesus, what will peacemakers be called?",
        options: ["Children of God", "Servants of the king", "Teachers of the law"],
        correctIndex: 0,
        explanation: "Jesus says that peacemakers will be called children of God.",
        historicalContext: "Amid Roman occupation and violent tensions, actively promoting peace was countercultural.",
        culturalContext: "Being called 'a child of' someone in Semitic culture meant sharing their character or nature.",
        mainTeaching: "It teaches that actively seeking reconciliation reflects the very character of God.",
        verseText: "Blessed are the peacemakers, for they will be called children of God.",
      },
    },
  },
  {
    id: "mt-05-bienav-08",
    reference: { gospel: "Mateo", chapter: 5, verses: "10" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "bienaventuranzas",
    subcategory: "octava_bienaventuranza",
    level: 8,
    difficulty: "all",
    illustration: "bienaventuranzas/perseguidos.png",
    keywords: ["bienaventuranzas", "persecución", "justicia"],
    content: {
      es: {
        prompt: "¿Qué promete Jesús a los perseguidos por causa de la justicia?",
        options: ["De ellos es el reino de los cielos", "Recibirán venganza divina", "Vivirán sin problemas"],
        correctIndex: 0,
        explanation: "Jesús cierra las bienaventuranzas prometiendo el reino de los cielos a los perseguidos por causa de la justicia.",
        historicalContext: "Los primeros seguidores de Jesús enfrentarían oposición real de autoridades religiosas y políticas.",
        culturalContext: "Esta bienaventuranza conecta directamente con la primera, formando un marco (inclusio) en todo el pasaje.",
        mainTeaching: "Enseña que la fidelidad a la justicia de Dios tiene un costo, pero también una recompensa segura.",
        verseText: "Bienaventurados los perseguidos por causa de la justicia, porque de ellos es el reino de los cielos.",
      },
      en: {
        prompt: "What does Jesus promise to those persecuted for righteousness' sake?",
        options: ["Theirs is the kingdom of heaven", "They will receive divine revenge", "They will live without problems"],
        correctIndex: 0,
        explanation: "Jesus closes the beatitudes by promising the kingdom of heaven to those persecuted for righteousness.",
        historicalContext: "Jesus's earliest followers would face real opposition from religious and political authorities.",
        culturalContext: "This beatitude directly echoes the first one, forming a frame (inclusio) around the whole passage.",
        mainTeaching: "It teaches that faithfulness to God's righteousness has a cost, but also a certain reward.",
        verseText: "Blessed are those who are persecuted for righteousness' sake, for theirs is the kingdom of heaven.",
      },
    },
  },
  {
    id: "mt-03-personajes-01",
    reference: { gospel: "Mateo", chapter: 3, verses: "13-17" },
    characters: ["Jesús", "Juan el Bautista"],
    location: "río Jordán",
    category: "personajes",
    subcategory: "juan_el_bautista",
    level: 1,
    difficulty: "all",
    illustration: "personajes/bautismo-jesus.png",
    keywords: ["Juan el Bautista", "bautismo", "río Jordán"],
    content: {
      es: {
        prompt: "¿Qué ocurrió al salir Jesús del agua después de ser bautizado por Juan?",
        options: ["Se abrieron los cielos y descendió el Espíritu como paloma", "Empezó a llover intensamente", "La multitud lo aclamó como rey"],
        correctIndex: 0,
        explanation: "Al salir del agua, los cielos se abrieron, el Espíritu descendió como paloma, y una voz declaró: 'Este es mi Hijo amado'.",
        historicalContext: "Juan el Bautista predicaba un bautismo de arrepentimiento en el desierto de Judea antes de la aparición de Jesús.",
        culturalContext: "Que Jesús se sometiera al bautismo, sin necesitar arrepentimiento, sorprendió incluso a Juan.",
        mainTeaching: "El evento revela públicamente la identidad de Jesús como el Hijo de Dios al inicio de su ministerio.",
        verseText: "Y una voz de los cielos decía: Este es mi Hijo amado, en quien tengo complacencia.",
      },
      en: {
        prompt: "What happened as Jesus came up out of the water after being baptized by John?",
        options: ["Heaven opened and the Spirit descended like a dove", "It began to rain heavily", "The crowd acclaimed him as king"],
        correctIndex: 0,
        explanation: "As he came out of the water, heaven opened, the Spirit descended like a dove, and a voice declared: 'This is my beloved Son.'",
        historicalContext: "John the Baptist preached a baptism of repentance in the Judean desert before Jesus appeared.",
        culturalContext: "That Jesus submitted to baptism, without needing repentance, surprised even John himself.",
        mainTeaching: "The event publicly reveals Jesus's identity as the Son of God at the start of his ministry.",
        verseText: "And a voice from heaven said: This is my Son, whom I love; with him I am well pleased.",
      },
    },
  },
  {
    id: "jn-20-personajes-02",
    reference: { gospel: "Juan", chapter: 20, verses: "11-18" },
    characters: ["Jesús resucitado", "María Magdalena"],
    location: "el sepulcro vacío",
    category: "personajes",
    subcategory: "maria_magdalena",
    level: 2,
    difficulty: "all",
    illustration: "personajes/maria-magdalena.png",
    keywords: ["María Magdalena", "resurrección", "sepulcro"],
    content: {
      es: {
        prompt: "¿Cómo reconoció María Magdalena a Jesús resucitado, a quien al principio confundió con el hortelano?",
        options: ["Cuando él la llamó por su nombre", "Cuando vio sus manos", "Cuando escuchó su risa"],
        correctIndex: 0,
        explanation: "María lo reconoció al escuchar a Jesús pronunciar su nombre: 'María'.",
        historicalContext: "En el testimonio legal judío del siglo I, el testimonio de mujeres tenía poco peso — por eso es notable que ellas fueran las primeras testigas.",
        culturalContext: "María Magdalena había sido liberada de una aflicción severa y se convirtió en seguidora cercana de Jesús.",
        mainTeaching: "El relato subraya que Jesús se revela de forma personal e íntima, llamando a cada uno por su nombre.",
        verseText: "Jesús le dijo: María. Ella se volvió y le dijo: Raboni, que quiere decir Maestro.",
      },
      en: {
        prompt: "How did Mary Magdalene recognize the risen Jesus, whom she first mistook for the gardener?",
        options: ["When he called her by name", "When she saw his hands", "When she heard him laugh"],
        correctIndex: 0,
        explanation: "Mary recognized him when Jesus spoke her name: 'Mary.'",
        historicalContext: "In first-century Jewish legal testimony, women's witness carried little weight — making it notable they were the first witnesses.",
        culturalContext: "Mary Magdalene had been freed from a severe affliction and became a close follower of Jesus.",
        mainTeaching: "The account underscores that Jesus reveals himself personally and intimately, calling each by name.",
        verseText: "Jesus said to her: Mary. She turned and said to him: Rabboni, which means Teacher.",
      },
    },
  },
  {
    id: "lc-22-personajes-03",
    reference: { gospel: "Lucas", chapter: 22, verses: "54-62" },
    characters: ["Pedro", "Jesús"],
    location: "patio del sumo sacerdote",
    category: "personajes",
    subcategory: "pedro",
    level: 3,
    difficulty: "all",
    illustration: "personajes/negacion-pedro.png",
    keywords: ["Pedro", "negación", "gallo"],
    content: {
      es: {
        prompt: "¿Cuántas veces negó Pedro conocer a Jesús antes de que cantara el gallo?",
        options: ["Tres veces", "Una vez", "Cinco veces"],
        correctIndex: 0,
        explanation: "Tal como Jesús había anunciado, Pedro lo negó tres veces antes de que el gallo cantara.",
        historicalContext: "Ser identificado como seguidor de Jesús esa noche implicaba riesgo real de arresto.",
        culturalContext: "El canto del gallo marcaba una hora específica de la madrugada en la vida cotidiana romana.",
        mainTeaching: "El episodio muestra la fragilidad humana y anticipa la restauración posterior de Pedro por Jesús.",
        verseText: "Y en seguida, mientras aún hablaba, cantó el gallo. El Señor se volvió y miró a Pedro.",
      },
      en: {
        prompt: "How many times did Peter deny knowing Jesus before the rooster crowed?",
        options: ["Three times", "Once", "Five times"],
        correctIndex: 0,
        explanation: "Just as Jesus had foretold, Peter denied him three times before the rooster crowed.",
        historicalContext: "Being identified as a follower of Jesus that night carried a real risk of arrest.",
        culturalContext: "The rooster's crow marked a specific early-morning hour in everyday Roman life.",
        mainTeaching: "The episode shows human frailty and anticipates Jesus's later restoration of Peter.",
        verseText: "Just as he was speaking, the rooster crowed. The Lord turned and looked straight at Peter.",
      },
    },
  },
  {
    id: "jn-03-personajes-04",
    reference: { gospel: "Juan", chapter: 3, verses: "1-21" },
    characters: ["Jesús", "Nicodemo"],
    location: "Jerusalén",
    category: "personajes",
    subcategory: "nicodemo",
    level: 4,
    difficulty: "all",
    illustration: "personajes/nicodemo.png",
    keywords: ["Nicodemo", "nacer de nuevo", "de noche"],
    content: {
      es: {
        prompt: "¿Qué le dijo Jesús a Nicodemo que era necesario para ver el Reino de Dios?",
        options: ["Nacer de nuevo", "Estudiar la ley toda la vida", "Ser rico"],
        correctIndex: 0,
        explanation: "Jesús le dijo a Nicodemo que quien no naciera de nuevo no podía ver el Reino de Dios.",
        historicalContext: "Nicodemo era un fariseo y miembro del Sanedrín, el consejo religioso judío más influyente.",
        culturalContext: "Visitar a Jesús de noche sugiere cautela, dado el riesgo social de asociarse abiertamente con él.",
        mainTeaching: "La enseñanza señala que la transformación espiritual, no el estatus religioso, da acceso al Reino.",
        verseText: "De cierto, de cierto te digo, que el que no naciere de nuevo, no puede ver el reino de Dios.",
      },
      en: {
        prompt: "What did Jesus tell Nicodemus was necessary to see the Kingdom of God?",
        options: ["To be born again", "To study the law for life", "To be wealthy"],
        correctIndex: 0,
        explanation: "Jesus told Nicodemus that no one could see the Kingdom of God without being born again.",
        historicalContext: "Nicodemus was a Pharisee and member of the Sanhedrin, the most influential Jewish religious council.",
        culturalContext: "Visiting Jesus at night suggests caution, given the social risk of openly associating with him.",
        mainTeaching: "The teaching points out that spiritual transformation, not religious status, grants access to the Kingdom.",
        verseText: "Very truly I tell you, no one can see the kingdom of God unless they are born again.",
      },
    },
  },
  {
    id: "lc-19-personajes-05",
    reference: { gospel: "Lucas", chapter: 19, verses: "1-10" },
    characters: ["Jesús", "Zaqueo"],
    location: "Jericó",
    category: "personajes",
    subcategory: "zaqueo",
    level: 5,
    difficulty: "all",
    illustration: "personajes/zaqueo.png",
    keywords: ["Zaqueo", "árbol", "publicano"],
    content: {
      es: {
        prompt: "¿Por qué se subió Zaqueo a un árbol sicómoro?",
        options: ["Porque era de baja estatura y quería ver a Jesús", "Para escapar de la multitud", "Para recoger fruta"],
        correctIndex: 0,
        explanation: "Zaqueo era de baja estatura y, para poder ver a Jesús sobre la multitud, se subió a un árbol sicómoro.",
        historicalContext: "Zaqueo era jefe de los publicanos en Jericó, una posición que implicaba riqueza mal vista socialmente.",
        culturalContext: "Que Jesús decidiera hospedarse en casa de un publicano escandalizó a quienes lo observaban.",
        mainTeaching: "El encuentro muestra que Jesús busca activamente a quienes la sociedad margina o rechaza.",
        verseText: "Hoy ha venido la salvación a esta casa, porque también este es hijo de Abraham.",
      },
      en: {
        prompt: "Why did Zacchaeus climb a sycamore tree?",
        options: ["Because he was short and wanted to see Jesus", "To escape the crowd", "To pick fruit"],
        correctIndex: 0,
        explanation: "Zacchaeus was short in stature, so to see Jesus over the crowd he climbed a sycamore tree.",
        historicalContext: "Zacchaeus was chief tax collector in Jericho, a position associated with socially frowned-upon wealth.",
        culturalContext: "That Jesus chose to stay at a tax collector's house scandalized those who were watching.",
        mainTeaching: "The encounter shows that Jesus actively seeks out those whom society marginalizes or rejects.",
        verseText: "Today salvation has come to this house, because this man, too, is a son of Abraham.",
      },
    },
  },
  {
    id: "jn-04-personajes-06",
    reference: { gospel: "Juan", chapter: 4, verses: "1-42" },
    characters: ["Jesús", "una mujer samaritana"],
    location: "pozo de Jacob, Sicar",
    category: "personajes",
    subcategory: "samaritana",
    level: 6,
    difficulty: "all",
    illustration: "personajes/samaritana.png",
    keywords: ["samaritana", "pozo", "agua viva"],
    content: {
      es: {
        prompt: "¿Qué le ofreció Jesús a la mujer samaritana en el pozo?",
        options: ["Agua viva que quita la sed para siempre", "Un lugar en su casa", "Riquezas materiales"],
        correctIndex: 0,
        explanation: "Jesús le habló de un 'agua viva' que satisface la sed espiritual para siempre.",
        historicalContext: "Judíos y samaritanos normalmente evitaban todo contacto; hablarle a una mujer en público rompía otra norma social.",
        culturalContext: "El pozo era un lugar de encuentro social cotidiano, generalmente visitado a otras horas del día.",
        mainTeaching: "El diálogo muestra que Jesús ofrece vida espiritual a quienes la sociedad excluye por múltiples razones.",
        verseText: "El que beba del agua que yo le daré, no tendrá sed jamás, dijo Jesús a la mujer.",
      },
      en: {
        prompt: "What did Jesus offer the Samaritan woman at the well?",
        options: ["Living water that removes thirst forever", "A place in his household", "Material wealth"],
        correctIndex: 0,
        explanation: "Jesus spoke to her of 'living water' that satisfies spiritual thirst forever.",
        historicalContext: "Jews and Samaritans usually avoided all contact; speaking to a woman in public broke another social norm.",
        culturalContext: "The well was a daily social gathering spot, typically visited at other times of day.",
        mainTeaching: "The dialogue shows that Jesus offers spiritual life to those excluded by society for multiple reasons.",
        verseText: "Whoever drinks the water I give them will never thirst, Jesus told the woman.",
      },
    },
  },
  {
    id: "lc-02-lugares-01",
    reference: { gospel: "Lucas", chapter: 2, verses: "1-7" },
    characters: ["María", "José", "Jesús"],
    location: "Belén",
    category: "lugares",
    subcategory: "nacimiento",
    level: 1,
    difficulty: "all",
    illustration: "lugares/belen.png",
    keywords: ["Belén", "nacimiento", "pesebre"],
    content: {
      es: {
        prompt: "¿Por qué se encontraban María y José en Belén cuando nació Jesús?",
        options: ["Por un censo del Imperio Romano", "Estaban de vacaciones", "Huían de una tormenta"],
        correctIndex: 0,
        explanation: "Un decreto de censo de César Augusto obligó a José a viajar a Belén, su ciudad de origen familiar.",
        historicalContext: "Belén era conocida como la 'ciudad de David', relevante para las expectativas mesiánicas judías.",
        culturalContext: "Que Jesús naciera en un pesebre refleja la humildad de las circunstancias de su llegada.",
        mainTeaching: "El nacimiento en Belén cumple la esperanza profética de un gobernante que vendría de esa ciudad.",
        verseText: "Y dio a luz a su hijo primogénito, lo envolvió en pañales y lo acostó en un pesebre.",
      },
      en: {
        prompt: "Why were Mary and Joseph in Bethlehem when Jesus was born?",
        options: ["A Roman Empire census", "They were on vacation", "They were fleeing a storm"],
        correctIndex: 0,
        explanation: "A census decree from Caesar Augustus required Joseph to travel to Bethlehem, his family's town of origin.",
        historicalContext: "Bethlehem was known as the 'city of David,' significant to Jewish messianic expectations.",
        culturalContext: "That Jesus was born in a manger reflects the humble circumstances of his arrival.",
        mainTeaching: "The birth in Bethlehem fulfills the prophetic hope of a ruler who would come from that town.",
        verseText: "She gave birth to her firstborn son, wrapped him in cloths, and placed him in a manger.",
      },
    },
  },
  {
    id: "lc-04-lugares-02",
    reference: { gospel: "Lucas", chapter: 4, verses: "16-30" },
    characters: ["Jesús"],
    location: "Nazaret",
    category: "lugares",
    subcategory: "rechazo",
    level: 2,
    difficulty: "all",
    illustration: "lugares/nazaret.png",
    keywords: ["Nazaret", "sinagoga", "rechazo"],
    content: {
      es: {
        prompt: "¿Cómo reaccionó la gente de Nazaret cuando Jesús se aplicó una profecía a sí mismo en la sinagoga?",
        options: ["Se enfurecieron y quisieron despeñarlo", "Lo aclamaron como rey", "Le pidieron más enseñanzas"],
        correctIndex: 0,
        explanation: "Al oírlo aplicarse la profecía de Isaías a sí mismo, la multitud se llenó de ira y trató de arrojarlo por un precipicio.",
        historicalContext: "Nazaret era su pueblo natal; muchos lo conocían desde niño, lo que dificultó que aceptaran su autoridad.",
        culturalContext: "Leer y comentar las Escrituras en la sinagoga era una práctica pública habitual en sábado.",
        mainTeaching: "El episodio ilustra el dicho de Jesús de que 'ningún profeta es aceptado en su propia tierra'.",
        verseText: "Ningún profeta es aceptado en su propia tierra, les dijo Jesús a los presentes en la sinagoga.",
      },
      en: {
        prompt: "How did the people of Nazareth react when Jesus applied a prophecy to himself in the synagogue?",
        options: ["They became furious and tried to throw him off a cliff", "They acclaimed him as king", "They asked for more teaching"],
        correctIndex: 0,
        explanation: "Hearing him apply Isaiah's prophecy to himself, the crowd grew furious and tried to throw him off a cliff.",
        historicalContext: "Nazareth was his hometown; many had known him since childhood, making his authority hard to accept.",
        culturalContext: "Reading and commenting on Scripture in the synagogue was a routine public practice on the Sabbath.",
        mainTeaching: "The episode illustrates Jesus's saying that 'no prophet is accepted in his hometown.'",
        verseText: "No prophet is accepted in his hometown, Jesus told those gathered in the synagogue.",
      },
    },
  },
  {
    id: "mt-21-lugares-03",
    reference: { gospel: "Mateo", chapter: 21, verses: "1-11" },
    characters: ["Jesús", "los discípulos", "la multitud"],
    location: "Jerusalén",
    category: "lugares",
    subcategory: "entrada_triunfal",
    level: 3,
    difficulty: "all",
    illustration: "lugares/entrada-jerusalen.png",
    keywords: ["Jerusalén", "entrada triunfal", "palmas"],
    content: {
      es: {
        prompt: "¿En qué animal entró Jesús a Jerusalén el domingo de ramos?",
        options: ["Un burro (asno)", "Un caballo blanco", "Un camello"],
        correctIndex: 0,
        explanation: "Jesús entró a Jerusalén montado en un burro, mientras la multitud extendía mantos y ramas en el camino.",
        historicalContext: "Entrar en burro, y no en caballo de guerra, señalaba un tipo de rey humilde y pacífico.",
        culturalContext: "Agitar ramas y gritar '¡Hosanna!' era una forma de aclamación festiva y mesiánica.",
        mainTeaching: "El evento cumple la profecía de un rey humilde que llega a Jerusalén en son de paz.",
        verseText: "Bendito el que viene en el nombre del Señor. ¡Hosanna en las alturas!, gritaba la multitud.",
      },
      en: {
        prompt: "What animal did Jesus ride into Jerusalem on Palm Sunday?",
        options: ["A donkey", "A white warhorse", "A camel"],
        correctIndex: 0,
        explanation: "Jesus entered Jerusalem riding a donkey, while the crowd spread cloaks and branches along the road.",
        historicalContext: "Riding a donkey, rather than a warhorse, signaled a humble, peaceful kind of king.",
        culturalContext: "Waving branches and shouting 'Hosanna!' was a form of festive, messianic acclamation.",
        mainTeaching: "The event fulfills the prophecy of a humble king arriving in Jerusalem in peace.",
        verseText: "Blessed is he who comes in the name of the Lord! Hosanna in the highest, the crowd shouted.",
      },
    },
  },
  {
    id: "mt-26-lugares-04",
    reference: { gospel: "Mateo", chapter: 26, verses: "36-46" },
    characters: ["Jesús", "Pedro", "Santiago", "Juan"],
    location: "Getsemaní",
    category: "lugares",
    subcategory: "oracion",
    level: 4,
    difficulty: "all",
    illustration: "lugares/getsemani.png",
    keywords: ["Getsemaní", "oración", "arresto"],
    content: {
      es: {
        prompt: "¿Qué hicieron los discípulos mientras Jesús oraba angustiado en Getsemaní?",
        options: ["Se quedaron dormidos", "Huyeron de inmediato", "Oraron junto a él sin descanso"],
        correctIndex: 0,
        explanation: "A pesar de que Jesús les pidió velar con él, los discípulos se quedaron dormidos varias veces.",
        historicalContext: "Getsemaní era un huerto de olivos al pie del Monte de los Olivos, cerca de Jerusalén.",
        culturalContext: "La angustia intensa de Jesús ('mi alma está muy triste, hasta la muerte') muestra su humanidad plena.",
        mainTeaching: "El pasaje enseña la sumisión de Jesús a la voluntad del Padre incluso frente al sufrimiento inminente.",
        verseText: "Padre mío, si es posible, pase de mí esta copa; pero no sea como yo quiero, sino como tú.",
      },
      en: {
        prompt: "What did the disciples do while Jesus prayed in anguish in Gethsemane?",
        options: ["They fell asleep", "They fled immediately", "They prayed alongside him without rest"],
        correctIndex: 0,
        explanation: "Even though Jesus asked them to keep watch with him, the disciples fell asleep several times.",
        historicalContext: "Gethsemane was an olive grove at the foot of the Mount of Olives, near Jerusalem.",
        culturalContext: "Jesus's intense anguish ('my soul is overwhelmed with sorrow to the point of death') shows his full humanity.",
        mainTeaching: "The passage teaches Jesus's submission to the Father's will even facing imminent suffering.",
        verseText: "My Father, if it is possible, may this cup be taken from me. Yet not as I will, but as you will.",
      },
    },
  },
  {
    id: "jn-13-ensenanzas-01",
    reference: { gospel: "Juan", chapter: 13, verses: "34-35" },
    characters: ["Jesús", "los discípulos"],
    location: "el aposento alto",
    category: "ensenanzas",
    subcategory: "mandamiento_del_amor",
    level: 1,
    difficulty: "all",
    illustration: "ensenanzas/mandamiento-amor.png",
    keywords: ["amor", "mandamiento nuevo", "discípulos"],
    content: {
      es: {
        prompt: "¿Cuál es la señal que Jesús dice que identificará a sus discípulos ante el mundo?",
        options: ["El amor que se tengan unos a otros", "Los milagros que hagan", "El conocimiento de la ley"],
        correctIndex: 0,
        explanation: "Jesús dice que todos reconocerán a sus discípulos por el amor que se tengan entre ellos.",
        historicalContext: "Este mandamiento se dio la noche antes de la crucifixión, durante la última cena.",
        culturalContext: "Un 'mandamiento nuevo' resonaba fuerte en una cultura que valoraba profundamente la ley existente.",
        mainTeaching: "El amor mutuo, y no solo la doctrina correcta, es la marca distintiva de ser seguidor de Jesús.",
        verseText: "En esto conocerán todos que sois mis discípulos, si tenéis amor los unos con los otros.",
      },
      en: {
        prompt: "According to Jesus, what will identify his disciples to the world?",
        options: ["Their love for one another", "The miracles they perform", "Their knowledge of the law"],
        correctIndex: 0,
        explanation: "Jesus says everyone will recognize his disciples by the love they have for one another.",
        historicalContext: "This command was given the night before the crucifixion, during the Last Supper.",
        culturalContext: "A 'new command' resonated strongly in a culture that deeply valued the existing law.",
        mainTeaching: "Mutual love, not just correct doctrine, is the distinguishing mark of being a follower of Jesus.",
        verseText: "By this everyone will know that you are my disciples, if you love one another.",
      },
    },
  },
  {
    id: "mt-06-ensenanzas-02",
    reference: { gospel: "Mateo", chapter: 6, verses: "9-13" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "ensenanzas",
    subcategory: "oracion_modelo",
    level: 2,
    difficulty: "all",
    illustration: "ensenanzas/padre-nuestro.png",
    keywords: ["Padre Nuestro", "oración", "sermón del monte"],
    content: {
      es: {
        prompt: "¿Con qué palabra empieza la oración que Jesús enseñó a sus discípulos?",
        options: ["Padre", "Señor", "Dios"],
        correctIndex: 0,
        explanation: "Jesús enseñó a orar dirigiéndose a Dios como 'Padre nuestro que estás en los cielos'.",
        historicalContext: "Los rabinos de la época enseñaban a menudo oraciones modelo a sus discípulos.",
        culturalContext: "Llamar a Dios 'Padre' de forma cercana era menos común que otros títulos más formales de la época.",
        mainTeaching: "La oración modela una relación cercana con Dios, junto con peticiones de provisión y perdón.",
        verseText: "Padre nuestro que estás en los cielos, santificado sea tu nombre. Venga tu reino.",
      },
      en: {
        prompt: "What word does the prayer Jesus taught his disciples begin with?",
        options: ["Father", "Lord", "God"],
        correctIndex: 0,
        explanation: "Jesus taught his disciples to pray by addressing God as 'Our Father in heaven.'",
        historicalContext: "Rabbis of that era often taught model prayers to their disciples.",
        culturalContext: "Calling God 'Father' in such a close way was less common than other more formal titles of the time.",
        mainTeaching: "The prayer models a close relationship with God, alongside requests for provision and forgiveness.",
        verseText: "Our Father in heaven, hallowed be your name. Your kingdom come, your will be done.",
      },
    },
  },
  {
    id: "mt-07-ensenanzas-03",
    reference: { gospel: "Mateo", chapter: 7, verses: "12" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "ensenanzas",
    subcategory: "regla_de_oro",
    level: 3,
    difficulty: "all",
    illustration: "ensenanzas/regla-de-oro.png",
    keywords: ["regla de oro", "sermón del monte"],
    content: {
      es: {
        prompt: "Según la 'regla de oro' de Jesús, ¿cómo debemos tratar a los demás?",
        options: ["Como queremos que ellos nos traten a nosotros", "Como ellos nos tratan primero", "Según lo que merezcan"],
        correctIndex: 0,
        explanation: "Jesús resume la ley y los profetas en tratar a los demás como uno quisiera ser tratado.",
        historicalContext: "Versiones similares de esta idea aparecían en otras tradiciones éticas antiguas, pero Jesús la formula de modo positivo y activo.",
        culturalContext: "Presentarla como resumen 'de la ley y los profetas' le daba máxima autoridad dentro del pensamiento judío.",
        mainTeaching: "La enseñanza convierte la empatía activa en el principio práctico central de la ética de Jesús.",
        verseText: "Así que todas las cosas que queráis que los hombres hagan con vosotros, así también haced vosotros con ellos.",
      },
      en: {
        prompt: "According to Jesus's 'golden rule,' how should we treat others?",
        options: ["As we want them to treat us", "As they treat us first", "According to what they deserve"],
        correctIndex: 0,
        explanation: "Jesus summarizes the law and the prophets as treating others the way one would want to be treated.",
        historicalContext: "Similar versions of this idea appeared in other ancient ethical traditions, but Jesus frames it positively and actively.",
        culturalContext: "Presenting it as a summary 'of the law and the prophets' gave it maximum authority within Jewish thought.",
        mainTeaching: "The teaching turns active empathy into the central practical principle of Jesus's ethics.",
        verseText: "So in everything, do to others what you would have them do to you.",
      },
    },
  },
  {
    id: "mt-05-ensenanzas-04",
    reference: { gospel: "Mateo", chapter: 5, verses: "43-48" },
    characters: ["Jesús"],
    location: "monte cerca del Mar de Galilea",
    category: "ensenanzas",
    subcategory: "amor_a_los_enemigos",
    level: 4,
    difficulty: "all",
    illustration: "ensenanzas/amar-enemigos.png",
    keywords: ["enemigos", "amor", "perdón"],
    content: {
      es: {
        prompt: "¿Qué mandó Jesús hacer respecto a los enemigos, contradiciendo la costumbre popular de la época?",
        options: ["Amarlos y orar por ellos", "Ignorarlos por completo", "Evitarlos a toda costa"],
        correctIndex: 0,
        explanation: "Jesús mandó amar a los enemigos y orar por quienes persiguen, en lugar de solo odiarlos como se acostumbraba.",
        historicalContext: "La enseñanza popular de la época incluía amar al prójimo, pero no necesariamente al enemigo declarado.",
        culturalContext: "En un contexto de ocupación romana, amar al enemigo era una postura radical y contracultural.",
        mainTeaching: "Enseña que el amor de los seguidores de Jesús debe superar los límites naturales de reciprocidad.",
        verseText: "Amad a vuestros enemigos, bendecid a los que os maldicen, y orad por los que os persiguen.",
      },
      en: {
        prompt: "What did Jesus command regarding enemies, contradicting the popular custom of the time?",
        options: ["Love them and pray for them", "Ignore them completely", "Avoid them at all costs"],
        correctIndex: 0,
        explanation: "Jesus commanded loving enemies and praying for persecutors, rather than simply hating them as was customary.",
        historicalContext: "Popular teaching of the time included loving one's neighbor, but not necessarily a declared enemy.",
        culturalContext: "Under Roman occupation, loving one's enemy was a radical, countercultural stance.",
        mainTeaching: "It teaches that the love of Jesus's followers must go beyond the natural limits of reciprocity.",
        verseText: "Love your enemies and pray for those who persecute you, Jesus taught the crowd.",
      },
    },
  },
  {
    id: "mt-02-profecias-01",
    reference: { gospel: "Mateo", chapter: 2, verses: "1-6" },
    characters: ["los magos", "Herodes", "los principales sacerdotes"],
    location: "Jerusalén y Belén",
    category: "profecias",
    subcategory: "lugar_de_nacimiento",
    level: 1,
    difficulty: "all",
    illustration: "profecias/nacimiento-belen.png",
    keywords: ["profecía", "Belén", "Miqueas"],
    content: {
      es: {
        prompt: "Cuando los magos preguntaron dónde nacería el Mesías, ¿qué ciudad señalaron los sacerdotes citando a los profetas?",
        options: ["Belén", "Jerusalén", "Nazaret"],
        correctIndex: 0,
        explanation: "Citando al profeta Miqueas, los sacerdotes señalaron que el Mesías nacería en Belén de Judea.",
        historicalContext: "El profeta Miqueas había escrito siglos antes que de Belén saldría un gobernante para Israel.",
        culturalContext: "Herodes, inquieto por la noticia, buscaba esa información para intentar eliminar al futuro rey.",
        mainTeaching: "El cumplimiento muestra la fidelidad de Dios a sus promesas hechas mucho tiempo antes.",
        verseText: "Y tú, Belén, tierra de Judá, de ti saldrá un guiador que apacentará a mi pueblo Israel.",
      },
      en: {
        prompt: "When the magi asked where the Messiah would be born, which city did the priests point to, quoting the prophets?",
        options: ["Bethlehem", "Jerusalem", "Nazareth"],
        correctIndex: 0,
        explanation: "Quoting the prophet Micah, the priests pointed out that the Messiah would be born in Bethlehem of Judea.",
        historicalContext: "The prophet Micah had written centuries earlier that a ruler for Israel would come out of Bethlehem.",
        culturalContext: "Herod, unsettled by the news, sought this information in an attempt to eliminate the future king.",
        mainTeaching: "The fulfillment shows God's faithfulness to promises made long before.",
        verseText: "But you, Bethlehem, out of you will come a ruler who will shepherd my people Israel.",
      },
    },
  },
  {
    id: "mt-21-profecias-02",
    reference: { gospel: "Mateo", chapter: 21, verses: "1-5" },
    characters: ["Jesús"],
    location: "camino a Jerusalén",
    category: "profecias",
    subcategory: "rey_humilde",
    level: 2,
    difficulty: "all",
    illustration: "profecias/rey-en-burro.png",
    keywords: ["profecía", "Zacarías", "burro"],
    content: {
      es: {
        prompt: "¿Qué profeta había anunciado siglos antes que el rey de Jerusalén llegaría montado en un burro?",
        options: ["Zacarías", "Isaías", "Jeremías"],
        correctIndex: 0,
        explanation: "Mateo señala que la entrada de Jesús en burro cumple lo anunciado por el profeta Zacarías.",
        historicalContext: "Zacarías escribió esa profecía siglos antes, en un contexto de restauración post-exilio de Israel.",
        culturalContext: "Un rey en burro, en vez de caballo de guerra, comunicaba humildad y paz, no conquista militar.",
        mainTeaching: "El cumplimiento profético refuerza que Jesús es reconocido como el rey mesiánico anunciado.",
        verseText: "Mira, tu rey viene a ti, humilde y montado en un asno, en un pollino, hijo de asna.",
      },
      en: {
        prompt: "Which prophet had announced centuries earlier that the king of Jerusalem would arrive riding a donkey?",
        options: ["Zechariah", "Isaiah", "Jeremiah"],
        correctIndex: 0,
        explanation: "Matthew points out that Jesus's entry on a donkey fulfills what the prophet Zechariah had announced.",
        historicalContext: "Zechariah wrote that prophecy centuries earlier, amid Israel's post-exile restoration.",
        culturalContext: "A king on a donkey, rather than a warhorse, communicated humility and peace, not military conquest.",
        mainTeaching: "The prophetic fulfillment reinforces that Jesus is recognized as the announced messianic king.",
        verseText: "See, your king comes to you, gentle and riding on a donkey, on a colt, the foal of a donkey.",
      },
    },
  },
  {
    id: "lc-22-cronologia-01",
    reference: { gospel: "Lucas", chapter: 22, verses: "14-20" },
    characters: ["Jesús", "los doce discípulos"],
    location: "el aposento alto, Jerusalén",
    category: "cronologia",
    subcategory: "ultima_cena",
    level: 1,
    difficulty: "all",
    illustration: "cronologia/ultima-cena.png",
    keywords: ["última cena", "pan", "vino", "pascua"],
    content: {
      es: {
        prompt: "¿Qué comida judía estaban celebrando Jesús y sus discípulos durante la última cena?",
        options: ["La Pascua", "El Pentecostés", "El día del perdón"],
        correctIndex: 0,
        explanation: "La última cena tuvo lugar durante la celebración de la Pascua judía, la noche antes de la crucifixión.",
        historicalContext: "La Pascua conmemoraba la liberación del pueblo de Israel de la esclavitud en Egipto.",
        culturalContext: "Jesús reinterpreta el pan y el vino de la cena como símbolos de su propio cuerpo y sangre.",
        mainTeaching: "El momento establece lo que la iglesia luego recordaría como la Cena del Señor.",
        verseText: "Esto es mi cuerpo, que por vosotros es dado; haced esto en memoria de mí.",
      },
      en: {
        prompt: "Which Jewish meal were Jesus and his disciples observing during the Last Supper?",
        options: ["Passover", "Pentecost", "The Day of Atonement"],
        correctIndex: 0,
        explanation: "The Last Supper took place during the celebration of the Jewish Passover, the night before the crucifixion.",
        historicalContext: "Passover commemorated the liberation of the people of Israel from slavery in Egypt.",
        culturalContext: "Jesus reinterprets the bread and wine of the meal as symbols of his own body and blood.",
        mainTeaching: "The moment establishes what the church would later remember as the Lord's Supper.",
        verseText: "This is my body given for you; do this in remembrance of me.",
      },
    },
  },
  {
    id: "lc-24-cronologia-02",
    reference: { gospel: "Lucas", chapter: 24, verses: "1-12" },
    characters: ["mujeres seguidoras de Jesús", "dos ángeles", "Pedro"],
    location: "el sepulcro, Jerusalén",
    category: "cronologia",
    subcategory: "resurreccion",
    level: 2,
    difficulty: "all",
    illustration: "cronologia/resurreccion.png",
    keywords: ["resurrección", "tercer día", "sepulcro vacío"],
    content: {
      es: {
        prompt: "¿Qué encontraron las mujeres al llegar al sepulcro la mañana del tercer día?",
        options: ["La piedra removida y el sepulcro vacío", "El cuerpo de Jesús intacto", "Soldados romanos dormidos"],
        correctIndex: 0,
        explanation: "Las mujeres encontraron la piedra removida y el sepulcro vacío; dos ángeles anunciaron que Jesús había resucitado.",
        historicalContext: "Jesús había anticipado varias veces que resucitaría al tercer día después de su muerte.",
        culturalContext: "Que fueran mujeres las primeras testigas de la tumba vacía era inusual dado el bajo estatus legal de su testimonio.",
        mainTeaching: "La resurrección al tercer día es el evento central que confirma las afirmaciones de Jesús sobre sí mismo.",
        verseText: "¿Por qué buscáis entre los muertos al que vive? No está aquí, sino que ha resucitado.",
      },
      en: {
        prompt: "What did the women find when they arrived at the tomb on the morning of the third day?",
        options: ["The stone rolled away and the tomb empty", "Jesus's body intact", "Roman soldiers asleep"],
        correctIndex: 0,
        explanation: "The women found the stone rolled away and the tomb empty; two angels announced that Jesus had risen.",
        historicalContext: "Jesus had repeatedly foretold that he would rise again on the third day after his death.",
        culturalContext: "That women were the first witnesses to the empty tomb was unusual given the low legal status of their testimony.",
        mainTeaching: "The resurrection on the third day is the central event confirming Jesus's claims about himself.",
        verseText: "Why do you look for the living among the dead? He is not here; he has risen!",
      },
    },
  },
];

// ============================================================
// 1.5 Asset Manifest — registro central de recursos visuales y de audio
// ============================================================

/**
 * Manifest de recursos — en este proyecto (app Vite real, con carpeta
 * public/) se usa el manifest central ya existente en
 * src/config/assetManifest.ts (import más abajo), que ya tiene las
 * rutas reales de fondos, personajes, íconos y el video del menú.
 * Mismo shape que se usaba en el artefacto — ningún componente de
 * pantalla necesita cambios más allá de este import.
 */

function getQuestionIllustrationAsset(question) {
  return {
    path: null, // pendiente de recurso real — ver checklist de esta fase
    alt: `Ilustración: ${question.illustration}`,
    responsive: "cover",
  };
}

/** Imagen normal (ilustraciones, personajes) — placeholder visible y accesible si falta el recurso. */
function AssetImage({ asset, className = "", style = {}, placeholderLabel }) {
  if (!asset?.path) {
    return (
      <div
        className={`flex items-center justify-center text-center px-2 ${className}`}
        style={{ ...style, backgroundColor: `${THEME.comicblack}22`, color: `${THEME.parchment}77`, fontSize: "0.65rem", fontFamily: FONT_BODY }}
        role="img"
        aria-label={asset?.alt ?? placeholderLabel}
      >
        {placeholderLabel ?? asset?.alt ?? ""}
      </div>
    );
  }
  return (
    <img
      src={asset.path}
      alt={asset.alt}
      className={className}
      style={{ ...style, objectFit: asset.responsive === "contain" ? "contain" : "cover", width: "100%", height: "100%" }}
    />
  );
}

/** Fondo de pantalla — invisible por completo si no hay recurso (cero cambio visual hasta tener el archivo). */
function AssetBackground({ asset, overlayOpacity = 0 }) {
  if (!asset?.path) return null;
  return (
    <>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: `url(${asset.path})`, backgroundSize: "cover", backgroundPosition: "center" }}
        role="img"
        aria-label={asset.alt}
      />
      {overlayOpacity > 0 && (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      )}
    </>
  );
}

/**
 * Fondo con video ambiental opcional — envuelve AssetBackground (sin
 * modificarlo) y, si hay un video real configurado para ese fondo
 * (ASSET_MANIFEST.ambientVideos[asset.id].path), lo reproduce encima
 * como fondo completo. El video se genera por fuera de este código
 * (cámara real / render externo del escenario: agua, nubes, aves, luz,
 * vegetación) — acá solo se integra.
 *
 * Sin video configurado (path: null, el valor por defecto hasta que se
 * entregue un archivo real): se comporta exactamente igual que
 * AssetBackground solo — fondo estático de siempre, sin overlays
 * artificiales de ningún tipo.
 *
 * Con video configurado:
 *   - autoplay, muted, loop, playsInline, sin controles visibles.
 *   - object-fit: cover, object-position: center center — mismo
 *     encuadre que la imagen estática, sin deformarse.
 *   - mientras el video no está listo, se ve la imagen estática (queda
 *     montada debajo todo el tiempo); apenas el video puede reproducirse
 *     (evento "canplay"), hace un fundado suave de opacidad hacia el
 *     video (0.8s) — nunca un salto brusco.
 *   - si el video falla, no es compatible, o tira un error en cualquier
 *     momento: se oculta automáticamente y queda la imagen estática de
 *     forma permanente, sin ningún error visible para el jugador.
 *   - siempre detrás de toda la interfaz (pointer-events: none, mismo
 *     nivel que el fondo estático) — botones, título e íconos quedan
 *     completamente encima, estáticos y utilizables, sin cambios.
 *   - nunca se reinicia mientras la pantalla siga montada: es el mismo
 *     elemento <video> en cada re-render (React no lo recrea), solo se
 *     reinicia si la pantalla se desmonta y se vuelve a montar.
 *   - se pausa cuando la pestaña no está visible (useTabVisible) y
 *     retoma desde donde estaba al volver.
 *   - prefers-reduced-motion: reduce -> el <video> nunca se monta,
 *     queda la imagen estática de siempre como alternativa.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function handleChange() {
      setReduced(mq.matches);
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);
  return reduced;
}

function useTabVisible() {
  const [visible, setVisible] = useState(() => (typeof document !== "undefined" ? !document.hidden : true));
  useEffect(() => {
    function handleChange() {
      setVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleChange);
    return () => document.removeEventListener("visibilitychange", handleChange);
  }, []);
  return visible;
}

function AmbientBackground({ asset, overlayOpacity = 0 }) {
  const tabVisible = useTabVisible();
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoPath = !reducedMotion && asset?.screen ? ASSET_MANIFEST.ambientVideos?.[asset.screen]?.path ?? null : null;
  const showVideo = Boolean(videoPath) && !videoError;

  // Si cambia el video (nueva pantalla con otro fondo), arranca de nuevo
  // desde "todavía no listo" — nunca deja pegado un estado de una
  // pantalla anterior. No se dispara por otros re-renders de la MISMA
  // pantalla, así que nunca reinicia la transición sin motivo.
  useEffect(() => {
    setVideoReady(false);
    setVideoError(false);
  }, [videoPath]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !showVideo) return;
    if (tabVisible) el.play().catch(() => {});
    else el.pause();
  }, [tabVisible, showVideo]);

  return (
    <>
      {/* Imagen estática — SIEMPRE presente, sin overlay propio (el
          overlay de contraste se agrega una sola vez más abajo, encima
          de lo que corresponda). Sirve de respaldo visual mientras el
          video carga y si el video falla o no es compatible. */}
      <AssetBackground asset={asset} overlayOpacity={0} />
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            opacity: videoReady ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
          src={videoPath}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
          aria-hidden="true"
        />
      )}
      {overlayOpacity > 0 && (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      )}
    </>
  );
}

// 2. i18n
// ============================================================

const STRINGS = {
  es: {
    title: "Historia de Jesús",
    credit: "Developed by OTSV",
    play: "Jugar",
    configuration: "Configuración",
    score: "Puntuación",
    newPlayer: "Nuevo jugador",
    namePrompt: "¿Cómo te llamas?",
    continueLabel: "Continuar",
    restart: "Reiniciar",
    level: "Nivel",
    difficulty: "Dificultad",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    lives: "Vidas",
    language: "Idioma",
    defaultDifficultyNote: "Esta es la dificultad con la que empieza cada jugador nuevo. Los jugadores ya existentes pueden cambiar la suya en su pantalla de progreso.",
    loading: "Cargando...",
    noPlayers: "Todavía no hay jugadores registrados.",
    name: "Nombre",
    backToMenu: "Menú",
    timeLabel: "Tiempo",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    correctAnswerLabel: "Respuesta correcta",
    timeUp: "¡Se acabó el tiempo!",
    nextQuestion: "Siguiente pregunta",
    reference: "Referencia",
    mainTeaching: "Enseñanza principal",
    historicalContext: "Contexto histórico",
    culturalContext: "Contexto cultural",
    gameFinishedTitle: "¡Historia completa!",
    gameFinishedBody: "Completaste los 10 niveles con",
    pointsWord: "puntos",
    lifeLostAllTitle: "De vuelta al Nivel 1",
    lifeLostAllBody: "El juego vuelve al Nivel 1, pero conservas tu historial de preguntas ya vistas.",
    startFromLevel1: "Comenzar desde el Nivel 1",
    levelUnlockedLabel: "Nivel desbloqueado:",
    startButtonLabel: "Iniciar",
    introPresentsLabel: "presenta",
    playMusicTitle: "Reproducir música",
    pauseMusicTitle: "Pausar música",
    muteTitle: "Silenciar",
    unmuteTitle: "Activar sonido",
    questionOf: "Pregunta",
    of: "de",
    levelsCompletedLabel: "Niveles completados en total",
    actions: "Acciones",
    resetPlayerTitle: "Reiniciar avance a 0",
    deletePlayerTitle: "Borrar jugador",
    confirmDeleteTitle: "Confirmar borrado permanente",
    cancelTitle: "Cancelar",
    existingPlayersLabel: "Jugadores existentes",
    orCreateNewLabel: "O crea un jugador nuevo",
  },
  en: {
    title: "Story of Jesus",
    credit: "Developed by OTSV",
    play: "Play",
    configuration: "Configuration",
    score: "Score",
    newPlayer: "New player",
    namePrompt: "What's your name?",
    continueLabel: "Continue",
    restart: "Restart",
    level: "Level",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    lives: "Lives",
    language: "Language",
    defaultDifficultyNote: "This is the difficulty new players start with. Existing players can change their own on their progress screen.",
    loading: "Loading...",
    noPlayers: "No players registered yet.",
    name: "Name",
    backToMenu: "Menu",
    timeLabel: "Time",
    correct: "Correct!",
    incorrect: "Incorrect",
    correctAnswerLabel: "Correct answer",
    timeUp: "Time's up!",
    nextQuestion: "Next question",
    reference: "Reference",
    mainTeaching: "Main teaching",
    historicalContext: "Historical context",
    culturalContext: "Cultural context",
    gameFinishedTitle: "Story complete!",
    gameFinishedBody: "You completed all 10 levels with",
    pointsWord: "points",
    lifeLostAllTitle: "Back to Level 1",
    lifeLostAllBody: "The game returns to Level 1, but your seen-questions history is kept.",
    startFromLevel1: "Start from Level 1",
    levelUnlockedLabel: "Level unlocked:",
    startButtonLabel: "Start",
    introPresentsLabel: "presents",
    playMusicTitle: "Play music",
    pauseMusicTitle: "Pause music",
    muteTitle: "Mute",
    unmuteTitle: "Unmute",
    questionOf: "Question",
    of: "of",
    levelsCompletedLabel: "Total levels completed",
    actions: "Actions",
    resetPlayerTitle: "Reset progress to 0",
    deletePlayerTitle: "Delete player",
    confirmDeleteTitle: "Confirm permanent deletion",
    cancelTitle: "Cancel",
    existingPlayersLabel: "Existing players",
    orCreateNewLabel: "Or create a new player",
  },
};

// ============================================================
// 3. Tema visual
// ============================================================

const THEME = {
  ink: "#1A1F3C",
  parchment: "#F5E8C9",
  parchmentLight: "#FBF3DE",
  halo: "#E8B94A",
  clay: "#C0603D",
  olive: "#6E7F4B",
  comicblack: "#14141C",
};
const FONT_DISPLAY = "'Baloo 2', system-ui, sans-serif";
const FONT_BODY = "'Nunito Sans', system-ui, sans-serif";

/**
 * QUESTION_BANK guarda reference.gospel siempre en español (Mateo, Marcos,
 * Lucas, Juan) — es la clave estable que también usan las estadísticas
 * internas (accuracyByGospel). Esta tabla solo traduce ese nombre para
 * mostrarlo en pantalla cuando el idioma activo es inglés; el dato
 * original nunca se modifica.
 */
const GOSPEL_NAMES = {
  es: { Mateo: "Mateo", Marcos: "Marcos", Lucas: "Lucas", Juan: "Juan" },
  en: { Mateo: "Matthew", Marcos: "Mark", Lucas: "Luke", Juan: "John" },
};

function translateGospel(gospel, language) {
  return GOSPEL_NAMES[language]?.[gospel] ?? gospel;
}

// ============================================================
// 4. Audio — servicio real (archivos), ver src/services/audio
// ============================================================
// En este proyecto (app Vite real) el audio ya no es síntesis interna:
// usa el mismo audioService de archivos reales construido en fases
// anteriores (SfxPlayer.ts / MusicPlayer.ts) — mismos controles,
// mismo comportamiento para el jugador, backend real en vez de
// generativo/incrustado (que era un workaround del artefacto sin
// servidor). playChime() se conserva solo para el chime del intro
// (no tiene archivo real asignado todavía, es un detalle menor).

/**
 * Acorde cálido con ataque y caída lentos — solo para el chime del
 * intro del estudio, una vez por sesión. El resto de los efectos
 * (clic, acierto, error, nivel completo) usan audioService.playSfx().
 */
function playChime(freqs, { arpeggioGapS = 0.15, attack = 0.6, sustain = 1.1, release = 1.3, volume = 0.1 } = {}) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const t0 = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t0 + i * arpeggioGapS;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + attack);
      gain.gain.setValueAtTime(volume, start + attack + sustain);
      gain.gain.linearRampToValueAtTime(0, start + attack + sustain + release);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + attack + sustain + release + 0.1);
    });
    const totalMs = (freqs.length * arpeggioGapS + attack + sustain + release + 0.2) * 1000;
    setTimeout(() => ctx.close().catch(() => {}), totalMs);
  } catch {
    // Web Audio no soportado — falla en silencio.
  }
}

/**
 * Adaptador entre el audioService real (archivo único en loop, ver
 * MusicPlayer.ts) y el shape que ya usan MusicControlBar/App/MainMenu:
 * { isPlaying, volume, muted, play, pause, togglePlay, setVolume,
 * toggleMute }. Vive en App(), que nunca se desmonta al navegar entre
 * pantallas, así que la música nunca se reinicia por cambiar de
 * pantalla — solo por play()/pause() explícitos del jugador.
 */
function useMusicService(initialVolume, initialMuted, ready, onPersist) {
  const appliedInitialRef = useRef(false);
  const [state, setState] = useState(() => getMusicState());

  useEffect(() => subscribeMusicState(setState), []);

  // La preferencia de volumen/mute se carga async desde localStorage —
  // se aplica UNA sola vez apenas está lista, para no pisar cambios que
  // el jugador haga con los controles antes de que termine de cargar.
  useEffect(() => {
    if (ready && !appliedInitialRef.current) {
      appliedInitialRef.current = true;
      initMusicPreferences(initialVolume, initialMuted);
      setState(getMusicState());
    }
  }, [ready, initialVolume, initialMuted]);

  function setVolume(v) {
    audioService.setMusicVolume(v);
    onPersist?.(v, state.muted);
  }

  function toggleMute() {
    audioService.toggleMusicMute();
    onPersist?.(state.volume, !state.muted);
  }

  return {
    isPlaying: state.isPlaying,
    volume: state.volume,
    muted: state.muted,
    play: audioService.playMusic,
    pause: audioService.pauseMusic,
    togglePlay: audioService.toggleMusic,
    setVolume,
    toggleMute,
  };
}

// ============================================================
// 5. Persistencia (localStorage real — ver shim `storage` abajo)
// ============================================================

/**
 * Shim de almacenamiento con el mismo shape que `window.storage` (la
 * API del entorno de artefactos de Claude.ai: get/set/list/delete,
 * devolviendo { key, value } / { keys }), pero implementado con
 * `localStorage` real del navegador — necesario porque `window.storage`
 * NO existe fuera de ese entorno. El resto de esta sección (getPlayer,
 * savePlayer, etc.) no cambia ni una línea de lógica: mismas llamadas,
 * mismos shapes de retorno, mismo try/catch.
 */
const STORAGE_PREFIX = "hdj:";
const storage = {
  async get(key) {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) throw new Error(`clave inexistente: ${key}`);
    return { key, value: raw };
  },
  async set(key, value) {
    window.localStorage.setItem(STORAGE_PREFIX + key, value);
    return { key, value };
  },
  async delete(key) {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = [];
    const fullPrefix = STORAGE_PREFIX + prefix;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) keys.push(k.slice(STORAGE_PREFIX.length));
    }
    return { keys };
  },
};

async function getPlayer(slug) {
  try {
    const res = await storage.get(`player-${slug}`);
    return res ? JSON.parse(res.value) : null;
  } catch {
    return null;
  }
}

async function savePlayer(profile) {
  try {
    await storage.set(`player-${profile.id}`, JSON.stringify(profile));
  } catch {
    // Falla en silencio.
  }
}

async function listPlayerProfiles() {
  try {
    const res = await storage.list("player-");
    const keys = res?.keys ?? [];
    const profiles = await Promise.all(
      keys.map(async (key) => {
        try {
          const r = await storage.get(key);
          return r ? JSON.parse(r.value) : null;
        } catch {
          return null;
        }
      })
    );
    return profiles.filter(Boolean);
  } catch {
    return [];
  }
}

async function deletePlayerProfile(playerId) {
  try {
    await storage.delete(`player-${playerId}`);
  } catch {
    // Falla en silencio.
  }
}

async function getSettings() {
  try {
    const res = await storage.get("settings");
    return res ? JSON.parse(res.value) : null;
  } catch {
    return null;
  }
}

async function saveSettings(settings) {
  try {
    await storage.set("settings", JSON.stringify(settings));
  } catch {
    // Falla en silencio.
  }
}

async function updateStatistics(playerId, gospel, wasCorrect, timeTakenSeconds) {
  try {
    const key = `stats-${playerId}`;
    const res = await storage.get(key);
    const stats = res
      ? JSON.parse(res.value)
      : {
          questionsAnswered: 0,
          correctAnswers: 0,
          totalTimeSpentSeconds: 0,
          currentStreak: 0,
          maxStreak: 0,
          accuracyByGospel: { Mateo: { a: 0, c: 0 }, Marcos: { a: 0, c: 0 }, Lucas: { a: 0, c: 0 }, Juan: { a: 0, c: 0 } },
        };
    stats.questionsAnswered += 1;
    stats.correctAnswers += wasCorrect ? 1 : 0;
    stats.totalTimeSpentSeconds += timeTakenSeconds;
    stats.currentStreak = wasCorrect ? stats.currentStreak + 1 : 0;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.accuracyByGospel[gospel].a += 1;
    stats.accuracyByGospel[gospel].c += wasCorrect ? 1 : 0;
    await storage.set(key, JSON.stringify(stats));
  } catch {
    // La recolección de estadísticas nunca debe romper el juego.
  }
}

// ============================================================
// 6. Dominio
// ============================================================

const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 10;
const POINTS_PER_LEVEL = 100;
const MAX_SCORE = TOTAL_LEVELS * POINTS_PER_LEVEL;
const STARTING_LIVES = 5;
const DIFFICULTY_SECONDS = { beginner: 30, intermediate: 15, advanced: 10 };

/**
 * Feature flags — un interruptor centralizado por función. Para
 * desactivar el intro en el futuro (o cambiar su comportamiento) alcanza
 * con tocar este objeto, sin buscar por el resto del código.
 */
const FEATURES = {
  introEnabled: true,
};

/**
 * Duraciones del intro, en milisegundos. Un solo lugar para ajustar el
 * ritmo de la secuencia completa (logo OTSV + frase bíblica) sin tocar
 * la lógica del componente IntroSequence.
 */
const INTRO_TIMING = {
  logoFadeInMs: 1000,
  logoHoldMs: 3300,
  logoFadeOutMs: 700, // logo phase total = 1000 + 3300 + 700 = 5000ms (5s)
  verseFadeInMs: 400,
  verseHoldMs: 1600,
  verseFadeOutMs: 500,
};

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Frases bíblicas breves sobre sabiduría y aprendizaje, mostradas una
 * vez tras el logo del intro. Igual que en el banco de preguntas, el
 * texto es una paráfrasis propia y breve — no una cita textual de una
 * traducción con derechos de autor.
 */
const WISDOM_VERSES = [
  { es: { text: "Tu palabra es lámpara a mis pies.", ref: "Salmo 119:105" }, en: { text: "Your word is a lamp for my feet.", ref: "Psalm 119:105" } },
  { es: { text: "Escudriñad las Escrituras.", ref: "Juan 5:39" }, en: { text: "Search the Scriptures.", ref: "John 5:39" } },
  { es: { text: "Creced en la gracia y el conocimiento.", ref: "2 Pedro 3:18" }, en: { text: "Grow in grace and knowledge.", ref: "2 Peter 3:18" } },
  { es: { text: "El temor de Dios es el principio de la sabiduría.", ref: "Proverbios 9:10" }, en: { text: "The fear of the Lord is the beginning of wisdom.", ref: "Proverbs 9:10" } },
  { es: { text: "Tu palabra es verdad.", ref: "Juan 17:17" }, en: { text: "Your word is truth.", ref: "John 17:17" } },
  { es: { text: "Si a alguno le falta sabiduría, pídala a Dios.", ref: "Santiago 1:5" }, en: { text: "If anyone lacks wisdom, let them ask God.", ref: "James 1:5" } },
];

function pickRandomVerse() {
  return pickRandom(WISDOM_VERSES);
}

/** Mensajes al completar un nivel — uno distinto cada vez, nunca siempre "¡Nivel completado!". */
const LEVEL_COMPLETE_MESSAGES = {
  es: ["¡Sí!", "¡Excelente!", "¡Muy bien!", "¡Sigue así!", "¡Buen trabajo!", "¡Increíble!", "¡Lo lograste!", "¡Cada vez aprendes más!", "¡Sigue creciendo!", "¡Buen avance!", "¡Nivel completado!"],
  en: ["Yes!", "Excellent!", "Well done!", "Keep it up!", "Great job!", "Incredible!", "You did it!", "You're learning more every time!", "Keep growing!", "Great progress!", "Level complete!"],
};

/** Mensajes al perder las 5 vidas — una invitación a seguir aprendiendo, nunca una reprensión. */
const ENCOURAGEMENT_MESSAGES = {
  es: ["No te preocupes.", "Inténtalo nuevamente.", "Tú puedes.", "Sigue aprendiendo.", "Cada intento te hace crecer.", "No te rindas.", "Levántate y continúa."],
  en: ["Don't worry.", "Try again.", "You can do it.", "Keep learning.", "Never give up.", "Every attempt helps you grow.", "Keep going."],
};

function slugify(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "jugador";
}

function createPlayerProfile(name, difficulty = "beginner") {
  const now = new Date().toISOString();
  return {
    id: slugify(name),
    name: name.trim(),
    progress: { currentLevel: 1, score: 0, lives: STARTING_LIVES, difficulty },
    questionHistory: { answeredIds: [], cycleCount: 0 },
    // Registro de avances: una entrada por cada nivel completado (el
    // primero incluido), independiente del progreso actual — así queda
    // un historial aunque el jugador luego pierda vidas y "progress"
    // se reinicie al Nivel 1.
    levelHistory: [],
    createdAt: now,
    lastPlayedAt: now,
  };
}

/**
 * Reinicia el progreso de un jugador a cero: nivel 1, puntaje 0, 5 vidas.
 * Conserva nombre, dificultad elegida, historial de preguntas ya vistas
 * (anti-repetición) y el registro de niveles completados — solo el
 * AVANCE ACTUAL vuelve a cero. Única fuente de verdad para "reiniciar":
 * la usan tanto el botón Restart de la pantalla de progreso como el
 * botón de reinicio en la pantalla de Puntuación.
 */
function resetProgress(profile) {
  return {
    ...profile,
    progress: { ...profile.progress, currentLevel: 1, score: 0, lives: STARTING_LIVES },
    lastPlayedAt: new Date().toISOString(),
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selector anti-repetición: excluye preguntas ya vistas por el jugador.
 * Si el pool disponible no alcanza, se considera agotado el banco: se
 * libera el historial (incrementando cycleCount) y se recorre de nuevo
 * desde cero. Con ~1000 preguntas (Fase 5) esto da ~100 niveles antes
 * de repetir; hoy, con 40, da 4 niveles — comportamiento esperado y
 * correcto para el tamaño actual del banco.
 */
function selectQuestionsForLevel(pool, history, count) {
  const answeredSet = new Set(history.answeredIds);
  let available = pool.filter((q) => !answeredSet.has(q.id));
  let nextHistory = history;
  if (available.length < count) {
    nextHistory = { answeredIds: [], cycleCount: history.cycleCount + 1 };
    available = pool;
  }
  return { questions: shuffle(available).slice(0, count), history: nextHistory };
}

function recordAnswered(history, questionId) {
  if (history.answeredIds.includes(questionId)) return history;
  return { ...history, answeredIds: [...history.answeredIds, questionId] };
}

/**
 * Orden de presentación de las 3 opciones de una pregunta.
 *
 * El dato canónico en QUESTION_BANK siempre guarda la respuesta correcta
 * en options[correctIndex] — eso nunca cambia, es la fuente de verdad.
 * Lo que se mezcla es solo el ORDEN EN QUE SE MUESTRAN en pantalla:
 * newOptionOrder() devuelve una permutación de [0,1,2] con probabilidad
 * uniforme (Fisher-Yates), recalculada cada vez que una pregunta se
 * presenta. Para pintar las opciones: order.map(i => options[i]).
 * Para validar un clic en la posición visual `pos`: order[pos] es el
 * índice real en el arreglo original — comparar contra correctIndex
 * ahí, nunca contra `pos` directamente.
 */
function newOptionOrder() {
  return shuffle([0, 1, 2]);
}

// ============================================================
// 7. Componentes UI reutilizables
// ============================================================

function ComicButton({ children, onClick, color = THEME.halo, textColor = THEME.comicblack, disabled = false, className = "" }) {
  const [pressed, setPressed] = useState(false);
  // Sonido de click centralizado acá: como todas las pantallas usan
  // ComicButton para sus acciones principales, cualquier botón lo tiene
  // gratis sin tener que tocar cada pantalla una por una.
  function handleClick(e) {
    audioService.playSfx("click");
    onClick?.(e);
  }
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`rounded-xl border-4 px-4 py-2 transition-transform duration-100 flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: color,
        color: textColor,
        borderColor: THEME.comicblack,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        boxShadow: pressed ? "none" : `0 5px 0 0 ${THEME.comicblack}`,
        transform: pressed ? "translateY(5px)" : "translateY(0)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ComicPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border-4 p-6 ${className}`}
      style={{ backgroundColor: THEME.parchment, borderColor: THEME.comicblack, boxShadow: `0 6px 0 0 ${THEME.comicblack}` }}
    >
      {children}
    </div>
  );
}

/**
 * Panel "vidrio esmerilado" — bordes suaves, translúcido con desenfoque
 * de fondo, sombra difusa. Pensado para pantallas donde el fondo debe
 * sentirse parte del entorno (ej. Puntuación) en vez de quedar oculto
 * detrás de una tarjeta opaca como ComicPanel. 88% de opacidad en el
 * relleno para mantener excelente contraste de texto.
 */
function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border p-6 ${className}`}
      style={{
        backgroundColor: `${THEME.parchment}e0`,
        borderColor: `${THEME.halo}66`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

function HeartRow({ lives, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} size={20} fill={i < lives ? THEME.clay : "none"} color={THEME.clay} strokeWidth={2} />
      ))}
    </div>
  );
}

function ScreenShell({ title, onBack, t, children, wide = false, backgroundAsset = null, backgroundOverlay = 0.25, panelVariant = "comic" }) {
  const PanelComponent = panelVariant === "glass" ? GlassPanel : ComicPanel;
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ backgroundColor: THEME.ink, fontFamily: FONT_BODY }}>
      <AmbientBackground asset={backgroundAsset} overlayOpacity={backgroundOverlay} />
      <PanelComponent className={`relative z-10 ${wide ? "w-full max-w-lg" : "w-full max-w-md"}`}>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} style={{ color: THEME.comicblack }} aria-label={t.backToMenu}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontFamily: FONT_DISPLAY, color: THEME.comicblack }} className="text-xl font-extrabold">
            {title}
          </h2>
        </div>
        {children}
      </PanelComponent>
    </div>
  );
}

/**
 * v2.0: controles de música simplificados — play/pausa, silenciar,
 * volumen. Se quitaron los botones de pista anterior/siguiente y el
 * nombre de la canción porque la música de fondo ahora es un pad
 * generativo continuo (useAmbientMusic), no una playlist con pistas
 * navegables. Se monta una sola vez en App(), junto a las pantallas
 * pero fuera del bloque que se intercambia al navegar, así el control
 * (y la música) nunca se reinician por cambiar de pantalla.
 */
function MusicControlBar({ t, music }) {
  return (
    <div
      className="music-bar fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-full border-2 px-3 py-2 shadow-lg"
      style={{ backgroundColor: THEME.ink, borderColor: THEME.halo }}
    >
      <button onClick={music.togglePlay} title={music.isPlaying ? t.pauseMusicTitle : t.playMusicTitle} aria-label={music.isPlaying ? t.pauseMusicTitle : t.playMusicTitle} style={{ color: THEME.halo }}>
        {music.isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button onClick={music.toggleMute} title={music.muted ? t.unmuteTitle : t.muteTitle} aria-label={music.muted ? t.unmuteTitle : t.muteTitle} style={{ color: THEME.halo }}>
        {music.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={music.muted ? 0 : music.volume}
        onChange={(e) => music.setVolume(parseFloat(e.target.value))}
        className="w-16"
        style={{ accentColor: THEME.halo }}
        aria-label={t.playMusicTitle}
      />
    </div>
  );
}

// ============================================================
// 8. Pantallas
// ============================================================

/**
 * Pantalla previa al intro: fondo negro, botón "Iniciar" con un rebote
 * suave y constante mientras permanece centrado. El intro OTSV solo
 * empieza a reproducirse cuando el jugador toca este botón.
 */
function TapToStartScreen({ t, onStart }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#000000" }}>
      <button
        onClick={onStart}
        className="start-bounce rounded-2xl border-4 px-10 py-4"
        style={{
          backgroundColor: THEME.halo,
          borderColor: THEME.halo,
          color: THEME.comicblack,
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: "1.5rem",
          letterSpacing: "0.15em",
          boxShadow: `0 0 34px ${THEME.halo}66`,
        }}
      >
        {t.startButtonLabel}
      </button>
    </div>
  );
}

/**
 * Intro del estudio OTSV. Se monta una sola vez por sesión de la app —
 * ver App(): `introComplete` es un useState en memoria (nunca se guarda
 * en localStorage a propósito), así que sobrevive a volver al menú,
 * cambiar idioma, reiniciar una partida, etc. dentro de la misma sesión,
 * pero se reinicia solo cuando el artefacto se recarga desde cero.
 * Secuencia (dispara al tocar "Iniciar" en TapToStartScreen): logo OTSV
 * con brillo + "presenta" (5s en total) -> frase bíblica aleatoria sobre
 * sabiduría -> termina y pasa el control a onComplete (el menú principal).
 */
function IntroSequence({ t, language, onComplete }) {
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [showVerse, setShowVerse] = useState(false);
  const [verseOpacity, setVerseOpacity] = useState(0);
  const verseRef = useRef(pickRandomVerse());

  useEffect(() => {
    playChime([261.63, 329.63, 392.0, 523.25]); // C4-E4-G4-C5, acorde mayor cálido
    const timers = [];
    let t = 40; // pequeño margen para que el navegador registre opacity:0 antes de animar a 1

    timers.push(setTimeout(() => setLogoOpacity(1), t));
    t += INTRO_TIMING.logoFadeInMs + INTRO_TIMING.logoHoldMs;
    timers.push(setTimeout(() => setLogoOpacity(0), t));
    t += INTRO_TIMING.logoFadeOutMs;
    timers.push(
      setTimeout(() => {
        setShowVerse(true);
        setTimeout(() => setVerseOpacity(1), 30);
      }, t)
    );
    t += 30 + INTRO_TIMING.verseFadeInMs + INTRO_TIMING.verseHoldMs;
    timers.push(setTimeout(() => setVerseOpacity(0), t));
    t += INTRO_TIMING.verseFadeOutMs;
    timers.push(setTimeout(() => onComplete(), t));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verse = verseRef.current;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 cursor-pointer"
      style={{ backgroundColor: "#000000" }}
      onClick={onComplete}
      title="Toca para continuar"
    >
      {!showVerse ? (
        <div
          className="flex flex-col items-center"
          style={{ opacity: logoOpacity, transition: `opacity ${INTRO_TIMING.logoFadeInMs}ms ease` }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "3rem",
              letterSpacing: "0.4em",
              color: THEME.halo,
              textShadow: `0 0 22px ${THEME.halo}99, 0 0 46px ${THEME.halo}55`,
            }}
          >
            OTSV
          </div>
          <div style={{ width: 72, height: 2, backgroundColor: THEME.halo, marginTop: 14, opacity: 0.65 }} />
          <div
            className="mt-3 text-sm uppercase"
            style={{ fontFamily: FONT_BODY, color: THEME.parchment, letterSpacing: "0.35em", opacity: 0.85 }}
          >
            {t.introPresentsLabel}
          </div>
        </div>
      ) : (
        <div
          className="text-center max-w-sm"
          style={{ opacity: verseOpacity, transition: `opacity ${INTRO_TIMING.verseFadeInMs}ms ease` }}
        >
          <p style={{ fontFamily: FONT_DISPLAY, color: THEME.parchment, fontSize: "1.375rem", lineHeight: 1.4 }}>
            "{verse[language].text}"
          </p>
          <p className="font-mono text-xs mt-3 tracking-widest uppercase" style={{ color: THEME.halo }}>
            {verse[language].ref}
          </p>
        </div>
      )}
    </div>
  );
}

function MainMenu({ t, language, onToggleLanguage, onNavigate, music }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 px-4 py-10 relative overflow-hidden" style={{ backgroundColor: THEME.ink, fontFamily: FONT_BODY }}>
      <AmbientBackground asset={ASSET_MANIFEST.backgrounds.menu} overlayOpacity={0.15} />
      <div className="w-full max-w-xs flex justify-end relative z-10">
        <button onClick={onToggleLanguage} className="rounded-lg border-2 px-3 py-1 text-xs font-mono" style={{ borderColor: THEME.halo, color: THEME.halo }}>
          {language === "es" ? "ES" : "EN"}
        </button>
      </div>
      <h1
        className="text-4xl md:text-5xl text-center font-extrabold relative z-10"
        style={{
          color: THEME.halo,
          fontFamily: FONT_DISPLAY,
          // Contorno limpio: paintOrder pinta el trazo DETRÁS del relleno,
          // así el trazo queda como borde exterior en vez de cortar las
          // letras por dentro (eso era el bug de las líneas negras).
          // Solo dos sombras: el desnivel "cómic" del resto de la interfaz
          // y una sombra difusa para separar el texto de fondos claros.
          WebkitTextStroke: `2px ${THEME.comicblack}`,
          paintOrder: "stroke fill",
          textShadow: `0 4px 0 ${THEME.comicblack}, 0 8px 16px rgba(0,0,0,0.55)`,
        }}
      >
        {t.title}
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <ComicButton
          color={THEME.halo}
          onClick={() => {
            music.play(); // gesto real del usuario -> desbloquea el AudioContext para el resto de la sesión
            onNavigate("playerSetup");
          }}
        >
          <Play size={18} /> {t.play}
        </ComicButton>
        <ComicButton color={THEME.olive} textColor={THEME.parchment} onClick={() => onNavigate("configuration")}>
          <Settings size={18} /> {t.configuration}
        </ComicButton>
        <ComicButton color={THEME.clay} textColor={THEME.parchment} onClick={() => onNavigate("score")}>
          <Trophy size={18} /> {t.score}
        </ComicButton>
      </div>
      <p className="text-xs uppercase tracking-widest font-mono relative z-10" style={{ color: `${THEME.parchment}99` }}>
        {t.credit}
      </p>
    </div>
  );
}

function PlayerQuickSelectButton({ player, t, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="w-full rounded-xl border-4 px-4 py-2 transition-transform duration-100 flex items-center"
      style={{
        backgroundColor: THEME.parchmentLight,
        color: THEME.comicblack,
        borderColor: THEME.comicblack,
        fontFamily: FONT_BODY,
        justifyContent: "space-between",
        boxShadow: pressed ? "none" : `0 5px 0 0 ${THEME.comicblack}`,
        transform: pressed ? "translateY(5px)" : "translateY(0)",
      }}
    >
      <span className="font-bold" style={{ fontFamily: FONT_DISPLAY }}>{player.name}</span>
      <span className="text-xs font-mono opacity-70">
        {t.level} {player.progress.currentLevel} · {player.progress.score} {t.pointsWord}
      </span>
    </button>
  );
}

function PlayerSetup({ t, onSubmitName, onSelectExisting, onBack, loading }) {
  const [name, setName] = useState("");
  const [existingPlayers, setExistingPlayers] = useState(null); // null = cargando

  useEffect(() => {
    let mounted = true;
    listPlayerProfiles().then((list) => {
      if (!mounted) return;
      setExistingPlayers(list.sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt)));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenShell title={t.newPlayer} onBack={onBack} t={t} backgroundAsset={ASSET_MANIFEST.backgrounds.playerSetup}>
      {existingPlayers && existingPlayers.length > 0 && (
        <div className="mb-5">
          <div className="font-bold mb-2 text-sm" style={{ color: THEME.comicblack }}>
            {t.existingPlayersLabel}
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {existingPlayers.map((p) => (
              <PlayerQuickSelectButton key={p.id} player={p} t={t} onClick={() => onSelectExisting(p)} />
            ))}
          </div>
        </div>
      )}

      <label className="block font-bold mb-2" style={{ color: THEME.comicblack }}>
        {existingPlayers && existingPlayers.length > 0 ? t.orCreateNewLabel : t.namePrompt}
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        placeholder={t.name}
        className="w-full rounded-lg border-4 px-3 py-2 mb-4 outline-none"
        style={{ borderColor: THEME.comicblack, fontFamily: FONT_BODY }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim() && !loading) onSubmitName(name);
        }}
      />
      <ComicButton color={THEME.halo} disabled={!name.trim() || loading} onClick={() => onSubmitName(name)}>
        {loading ? t.loading : t.continueLabel}
      </ComicButton>
    </ScreenShell>
  );
}

function DifficultySelector({ t, value, onChange }) {
  const options = ["beginner", "intermediate", "advanced"];
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((key) => (
        <ComicButton key={key} color={value === key ? THEME.halo : THEME.parchmentLight} onClick={() => onChange(key)}>
          {t[key]} · {DIFFICULTY_SECONDS[key]}s
        </ComicButton>
      ))}
    </div>
  );
}

function PlayerProgress({ t, profile, onContinue, onRestart, onBack, onSetDifficulty }) {
  return (
    <ScreenShell title={profile.name} onBack={onBack} t={t} backgroundAsset={ASSET_MANIFEST.backgrounds.playerSetup}>
      <div className="space-y-2 mb-3" style={{ color: THEME.comicblack }}>
        <div>{t.level}: {profile.progress.currentLevel} / {TOTAL_LEVELS}</div>
        <div>{t.score}: {profile.progress.score}</div>
        <div className="flex items-center gap-2">{t.lives}: <HeartRow lives={profile.progress.lives} /></div>
        <div className="text-xs opacity-70">{t.levelsCompletedLabel}: {(profile.levelHistory ?? []).length}</div>
      </div>
      <div className="mb-5">
        <div className="font-bold mb-2" style={{ color: THEME.comicblack }}>{t.difficulty}</div>
        <DifficultySelector t={t} value={profile.progress.difficulty} onChange={onSetDifficulty} />
      </div>
      <div className="flex gap-3">
        <ComicButton color={THEME.halo} onClick={onContinue}>{t.continueLabel}</ComicButton>
        <ComicButton color={THEME.clay} textColor={THEME.parchment} onClick={onRestart}>{t.restart}</ComicButton>
      </div>
    </ScreenShell>
  );
}

function ConfigurationScreen({ t, language, onSetLanguage, defaultDifficulty, onSetDefaultDifficulty, onBack }) {
  return (
    <ScreenShell
      title={t.configuration}
      onBack={onBack}
      t={t}
      backgroundAsset={ASSET_MANIFEST.backgrounds.configuration}
      backgroundOverlay={0.12}
      panelVariant="glass"
    >
      <div className="mb-4">
        <div className="font-bold mb-2" style={{ color: THEME.comicblack }}>{t.language}</div>
        <div className="flex gap-2">
          <ComicButton color={language === "es" ? THEME.halo : THEME.parchmentLight} onClick={() => onSetLanguage("es")}>ES</ComicButton>
          <ComicButton color={language === "en" ? THEME.halo : THEME.parchmentLight} onClick={() => onSetLanguage("en")}>EN</ComicButton>
        </div>
      </div>
      <div className="mb-2">
        <div className="font-bold mb-2" style={{ color: THEME.comicblack }}>{t.difficulty}</div>
        <DifficultySelector t={t} value={defaultDifficulty} onChange={onSetDefaultDifficulty} />
      </div>
      <p className="text-xs italic" style={{ color: `${THEME.comicblack}99` }}>{t.defaultDifficultyNote}</p>
    </ScreenShell>
  );
}

const MEDAL_COLORS = ["#E8B94A", "#C9C9D1", "#C0603D"]; // oro, plata, bronce — solo para los primeros 3 puestos

function IconButton({ icon: Icon, onClick, color, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-transform active:scale-90"
      style={{ borderColor: THEME.comicblack, backgroundColor: color, color: THEME.comicblack }}
    >
      <Icon size={14} />
    </button>
  );
}

function ScoreBoard({ t, onBack }) {
  const [players, setPlayers] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  async function refresh() {
    const list = await listPlayerProfiles();
    setPlayers(list.sort((a, b) => b.progress.score - a.progress.score));
  }

  useEffect(() => {
    let mounted = true;
    listPlayerProfiles().then((list) => {
      if (!mounted) return;
      setPlayers(list.sort((a, b) => b.progress.score - a.progress.score));
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleReset(p) {
    await savePlayer(resetProgress(p));
    await refresh();
  }

  async function handleConfirmDelete(p) {
    await deletePlayerProfile(p.id);
    setPendingDeleteId(null);
    await refresh();
  }

  return (
    <ScreenShell
      title={t.score}
      onBack={onBack}
      t={t}
      wide
      backgroundAsset={ASSET_MANIFEST.backgrounds.score}
      backgroundOverlay={0.12}
      panelVariant="glass"
    >
      {players === null && <p style={{ color: THEME.comicblack }}>{t.loading}</p>}
      {players?.length === 0 && <p style={{ color: THEME.comicblack }}>{t.noPlayers}</p>}
      {players && players.length > 0 && (
        <table className="w-full text-left" style={{ color: THEME.comicblack }}>
          <thead>
            <tr className="border-b-2" style={{ borderColor: THEME.comicblack }}>
              <th className="py-1 pr-2 w-8">#</th>
              <th className="py-1">{t.name}</th>
              <th className="py-1">{t.difficulty}</th>
              <th className="py-1">{t.level}</th>
              <th className="py-1 text-right">{t.score}</th>
              <th className="py-1 text-right pl-2">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, rank) => {
              const medal = MEDAL_COLORS[rank];
              const confirming = pendingDeleteId === p.id;
              return (
                <tr key={p.id} className="border-b" style={{ borderColor: `${THEME.comicblack}33` }}>
                  <td className="py-2 pr-2 font-mono font-bold">
                    {medal ? (
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
                        style={{ backgroundColor: medal, color: THEME.comicblack }}
                      >
                        {rank + 1}
                      </span>
                    ) : (
                      rank + 1
                    )}
                  </td>
                  <td className="py-2 font-semibold">{p.name}</td>
                  <td className="py-2 text-sm opacity-80">{t[p.progress.difficulty]}</td>
                  <td className="py-2">{p.progress.currentLevel} / {TOTAL_LEVELS}</td>
                  <td className="py-2 text-right font-mono font-bold">{p.progress.score}</td>
                  <td className="py-2 text-right pl-2">
                    <div className="flex items-center justify-end gap-1">
                      {confirming ? (
                        <>
                          <IconButton icon={Check} color={THEME.clay} title={t.confirmDeleteTitle} onClick={() => handleConfirmDelete(p)} />
                          <IconButton icon={X} color={THEME.parchmentLight} title={t.cancelTitle} onClick={() => setPendingDeleteId(null)} />
                        </>
                      ) : (
                        <>
                          <IconButton icon={RotateCcw} color={THEME.halo} title={t.resetPlayerTitle} onClick={() => handleReset(p)} />
                          <IconButton icon={Trash2} color={THEME.parchmentLight} title={t.deletePlayerTitle} onClick={() => setPendingDeleteId(p.id)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Reservado para futuras estadísticas del jugador (Fase 6: precisión,
          racha máxima, evangelio más fuerte/débil, etc. — ver statisticsStore
          en el proyecto modular). Se puede insertar una sección adicional
          justo aquí, debajo de la tabla, sin rediseñar esta pantalla. */}
    </ScreenShell>
  );
}

/** Tarjeta educativa mostrada tras CADA respuesta, correcta o incorrecta. */
function VerseRevealCard({ t, question, language, wasCorrect, timedOut, onNext }) {
  const c = question.content[language];
  const ref = question.reference;
  return (
    <div>
      <div
        className="rounded-xl px-4 py-2 mb-3 font-extrabold text-center"
        style={{
          backgroundColor: wasCorrect ? THEME.olive : THEME.clay,
          color: THEME.parchment,
          fontFamily: FONT_DISPLAY,
        }}
      >
        {timedOut ? t.timeUp : wasCorrect ? t.correct : t.incorrect}
      </div>

      {!wasCorrect && (
        <div className="text-sm mb-3" style={{ color: THEME.comicblack }}>
          <strong>{t.correctAnswerLabel}:</strong> {c.options[c.correctIndex]}
        </div>
      )}

      <div className="rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: THEME.ink, color: THEME.halo }}>
        <div className="text-xs font-mono opacity-70 mb-1">
          {t.reference}: {translateGospel(ref.gospel, language)} {ref.chapter}:{ref.verses}
        </div>
        <div className="italic text-sm" style={{ fontFamily: FONT_BODY }}>
          "{c.verseText}"
        </div>
      </div>

      <div className="text-sm mb-2" style={{ color: THEME.comicblack }}>
        {c.explanation}
      </div>
      <div className="text-sm mb-3 font-semibold" style={{ color: THEME.comicblack }}>
        {t.mainTeaching}: {c.mainTeaching}
      </div>
      <div className="text-xs mb-1" style={{ color: `${THEME.comicblack}bb` }}>
        <strong>{t.historicalContext}:</strong> {c.historicalContext}
      </div>
      <div className="text-xs mb-4" style={{ color: `${THEME.comicblack}bb` }}>
        <strong>{t.culturalContext}:</strong> {c.culturalContext}
      </div>

      <ComicButton color={THEME.halo} onClick={onNext} className="w-full">
        {t.nextQuestion}
      </ComicButton>
    </div>
  );
}

function QuestionCard({ t, question, language, optionOrder, timeLeft, maxTime, questionNumber, onAnswer }) {
  const c = question.content[language];
  const pct = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  // optionOrder es una permutación de [0,1,2] recalculada cada vez que
  // esta pregunta se presenta (ver newOptionOrder). Se muestra en ese
  // orden; onAnswer recibe la POSICIÓN VISUAL (0..2) en la que se hizo
  // clic — GameScreen.handleAnswer la traduce de vuelta al índice real
  // vía optionOrder[posiciónVisual] antes de comparar con correctIndex.
  const displayedOptions = optionOrder.map((realIndex) => c.options[realIndex]);
  const illustrationAsset = getQuestionIllustrationAsset(question);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-mono mb-2" style={{ color: `${THEME.comicblack}99` }}>
        <span>{t.questionOf} {questionNumber} {t.of} {QUESTIONS_PER_LEVEL}</span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {timeLeft}s
        </span>
      </div>
      {illustrationAsset.path && (
        <AssetImage asset={illustrationAsset} className="w-full h-28 rounded-xl mb-3 border-2" style={{ borderColor: THEME.comicblack }} />
      )}
      <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: `${THEME.comicblack}22` }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, backgroundColor: pct < 30 ? THEME.clay : THEME.halo }}
        />
      </div>
      <p className="font-bold text-lg mb-4" style={{ color: THEME.comicblack, fontFamily: FONT_DISPLAY }}>
        {c.prompt}
      </p>
      <div className="flex flex-col gap-3">
        {displayedOptions.map((opt, visualIndex) => (
          <ComicButton key={visualIndex} color={THEME.parchmentLight} onClick={() => onAnswer(visualIndex)} className="w-full justify-start text-left">
            {opt}
          </ComicButton>
        ))}
      </div>
    </div>
  );
}

/**
 * Celebración al completar un nivel: mensaje aleatorio (nunca siempre
 * "¡Nivel completado!") + animación de candado desbloqueándose, y luego
 * avanza sola al siguiente nivel — sin necesitar un clic, tal como pide
 * el flujo original. onDone dispara el mismo onLevelComplete de siempre.
 */
const CELEBRATE_ENTER_MS = 350;
const CELEBRATE_HOLD_MS = 1300;
const CELEBRATE_EXIT_MS = 350;
const CELEBRATE_TOTAL_MS = CELEBRATE_ENTER_MS + CELEBRATE_HOLD_MS + CELEBRATE_EXIT_MS; // ~2s, según especificación

function LevelCompleteAnimation({ t, language, level, onDone }) {
  const [stage, setStage] = useState("celebrate"); // celebrate | locked | unlocked
  const [celebrateVisible, setCelebrateVisible] = useState(false); // entrada/salida con fade+slide
  const messageRef = useRef(pickRandom(LEVEL_COMPLETE_MESSAGES[language]));
  const celebrateAsset = ASSET_MANIFEST.characters.celebrate;
  const lockOpenAsset = ASSET_MANIFEST.icons.lockOpen;

  useEffect(() => {
    const tEnter = setTimeout(() => setCelebrateVisible(true), 30);
    const tExit = setTimeout(() => setCelebrateVisible(false), CELEBRATE_TOTAL_MS - CELEBRATE_EXIT_MS);
    const t1 = setTimeout(() => setStage("locked"), CELEBRATE_TOTAL_MS);
    const t2 = setTimeout(() => setStage("unlocked"), CELEBRATE_TOTAL_MS + 500);
    const t3 = setTimeout(() => onDone(), CELEBRATE_TOTAL_MS + 500 + 900);
    return () => {
      clearTimeout(tEnter);
      clearTimeout(tExit);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4" style={{ backgroundColor: THEME.ink }}>
      {stage === "celebrate" && (
        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: celebrateVisible ? 1 : 0,
            transform: `translateY(${celebrateVisible ? 0 : 24}px)`,
            transition: `opacity ${CELEBRATE_ENTER_MS}ms ease, transform ${CELEBRATE_ENTER_MS}ms ease`,
          }}
        >
          {celebrateAsset.path ? (
            <div className="relative flex items-center justify-center">
              {/* brillo suave detrás del personaje */}
              <div
                className="absolute pointer-events-none"
                style={{
                  width: "70%",
                  height: "70%",
                  borderRadius: "9999px",
                  background: `radial-gradient(circle, ${THEME.halo}66 0%, transparent 70%)`,
                  filter: "blur(10px)",
                }}
              />
              <img
                src={celebrateAsset.path}
                alt={celebrateAsset.alt}
                className="char-celebrate-img char-celebrate-float relative"
                style={{ objectFit: "contain" }}
              />
            </div>
          ) : (
            <div className="intro-bounce">
              <Sparkles size={72} color={THEME.halo} style={{ filter: `drop-shadow(0 0 18px ${THEME.halo})` }} />
            </div>
          )}
          <div style={{ fontFamily: FONT_DISPLAY, color: THEME.halo, fontSize: "2rem", fontWeight: 800 }}>{messageRef.current}</div>
        </div>
      )}
      {stage === "locked" && (
        <div className="flex flex-col items-center gap-3">
          <Lock size={72} color={THEME.parchment} style={{ opacity: 0.85 }} />
          <div style={{ fontFamily: FONT_DISPLAY, color: THEME.parchment, fontSize: "1.1rem" }}>
            {t.levelUnlockedLabel} {level}
          </div>
        </div>
      )}
      {stage === "unlocked" && (
        <div className="flex flex-col items-center gap-3">
          {lockOpenAsset.path ? (
            <img
              src={lockOpenAsset.path}
              alt={lockOpenAsset.alt}
              className="icon-asset-lock lock-pop"
              style={{ objectFit: "contain", filter: `drop-shadow(0 0 18px ${THEME.halo})` }}
            />
          ) : (
            <Unlock size={72} color={THEME.halo} style={{ filter: `drop-shadow(0 0 18px ${THEME.halo})` }} className="lock-pop" />
          )}
          <div style={{ fontFamily: FONT_DISPLAY, color: THEME.parchment, fontSize: "1.25rem" }}>
            {t.levelUnlockedLabel} {level}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pantalla mostrada al perder las 5 vidas. Reemplaza un "Game Over"
 * punitivo por una invitación cálida a seguir aprendiendo — mensaje
 * aleatorio de ánimo (nunca el mismo) + ícono de aliento, no de castigo.
 */
function EncouragementScreen({ t, language, onBack, onStartOver }) {
  const messageRef = useRef(pickRandom(ENCOURAGEMENT_MESSAGES[language]));
  return (
    <ScreenShell title={t.lifeLostAllTitle} onBack={onBack} t={t} backgroundAsset={ASSET_MANIFEST.backgrounds.game}>
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="gentle-pulse">
          <HeartHandshake size={56} color={THEME.olive} style={{ filter: `drop-shadow(0 0 14px ${THEME.olive}aa)` }} />
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, color: THEME.comicblack, fontSize: "1.5rem", fontWeight: 800 }}>
          {messageRef.current}
        </div>
        <p className="text-sm" style={{ color: `${THEME.comicblack}bb` }}>
          {t.lifeLostAllBody}
        </p>
        <ComicButton color={THEME.olive} textColor={THEME.parchment} onClick={onStartOver} className="w-full mt-2">
          {t.startFromLevel1}
        </ComicButton>
      </div>
    </ScreenShell>
  );
}

/**
 * Motor de juego real de la Fase 2. Estado interno de la sesión (índice
 * de pregunta, cronómetro, fase) vive aquí; los cambios que deben
 * persistir (vidas, puntuación, nivel, historial anti-repetición) se
 * reportan hacia App vía callbacks.
 */
function GameScreen({ t, language, profile, onQuestionAnswered, onLevelComplete, onLifeLossReset, onBack }) {
  const [levelQuestions, setLevelQuestions] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [optionOrder, setOptionOrder] = useState([0, 1, 2]);
  const [phase, setPhase] = useState("loading"); // loading | question | reveal | levelComplete | lifeLossReset | finished
  const [lastAnswer, setLastAnswer] = useState({ wasCorrect: false, timedOut: false });
  const maxTime = DIFFICULTY_SECONDS[profile.progress.difficulty] ?? 30;
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const questionStartRef = useRef(Date.now());

  // Selección de preguntas al iniciar el intento de nivel.
  useEffect(() => {
    const { questions, history } = selectQuestionsForLevel(QUESTION_BANK, profile.questionHistory, QUESTIONS_PER_LEVEL);
    setLevelQuestions(questions);
    setQuestionIndex(0);
    setOptionOrder(newOptionOrder());
    setPhase(questions.length > 0 ? "question" : "loading");
    setTimeLeft(maxTime);
    questionStartRef.current = Date.now();
    if (history !== profile.questionHistory) {
      onQuestionAnswered(null, null, 0, history); // propaga el reinicio de ciclo sin registrar una respuesta
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cronómetro.
  useEffect(() => {
    if (phase !== "question") return undefined;
    if (timeLeft <= 0) {
      handleAnswer(null, true);
      return undefined;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  // selectedVisualIndex es la POSICIÓN EN PANTALLA donde el jugador
  // hizo clic (0..2), no el índice real dentro de question.content.options.
  // Se traduce a través de optionOrder antes de comparar con correctIndex,
  // así la mezcla nunca puede invalidar la corrección de la respuesta.
  function handleAnswer(selectedVisualIndex, timedOut = false) {
    if (phase !== "question" || !levelQuestions) return;
    const question = levelQuestions[questionIndex];
    const correctIndex = question.content[language].correctIndex;
    const selectedRealIndex = selectedVisualIndex === null ? null : optionOrder[selectedVisualIndex];
    const wasCorrect = !timedOut && selectedRealIndex === correctIndex;
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);

    if (wasCorrect) audioService.playSfx("correct");
    else audioService.playSfx("incorrect");

    setLastAnswer({ wasCorrect, timedOut });
    setPhase("reveal");
    onQuestionAnswered(question, wasCorrect, timeTaken, recordAnswered(profile.questionHistory, question.id));
  }

  function handleNext() {
    // profile.progress.lives ya refleja la vida perdida (onQuestionAnswered
    // la restó en handleAnswer, antes de llegar a esta pantalla). No restar
    // de nuevo aquí — eso era el bug que descontaba una vida de más.
    const willRunOutOfLives = !lastAnswer.wasCorrect && profile.progress.lives <= 0;
    if (willRunOutOfLives) {
      setPhase("lifeLossReset");
      return;
    }
    if (questionIndex + 1 >= QUESTIONS_PER_LEVEL) {
      audioService.playSfx("levelComplete");
      setPhase("levelComplete");
      return;
    }
    setQuestionIndex((i) => i + 1);
    setOptionOrder(newOptionOrder());
    setTimeLeft(maxTime);
    questionStartRef.current = Date.now();
    setPhase("question");
  }

  if (phase === "loading" || !levelQuestions) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: THEME.ink, color: THEME.halo, fontFamily: FONT_BODY }}>
        {t.loading}
      </div>
    );
  }

  if (phase === "levelComplete") {
    const isFinal = profile.progress.currentLevel >= TOTAL_LEVELS;
    if (isFinal) {
      return (
        <ScreenShell title={t.gameFinishedTitle} onBack={onBack} t={t} backgroundAsset={ASSET_MANIFEST.backgrounds.game}>
          <p className="mb-4" style={{ color: THEME.comicblack }}>
            {t.gameFinishedBody} {profile.progress.score + POINTS_PER_LEVEL} {t.pointsWord}.
          </p>
          <ComicButton color={THEME.halo} onClick={onLevelComplete}>
            {t.backToMenu}
          </ComicButton>
        </ScreenShell>
      );
    }
    // Nivel no final: celebración con mensaje aleatorio + candado
    // desbloqueándose, y avanza sola al siguiente nivel.
    return <LevelCompleteAnimation t={t} language={language} level={profile.progress.currentLevel + 1} onDone={onLevelComplete} />;
  }

  if (phase === "lifeLossReset") {
    return <EncouragementScreen t={t} language={language} onBack={onBack} onStartOver={onLifeLossReset} />;
  }

  const question = levelQuestions[questionIndex];

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ backgroundColor: THEME.ink, fontFamily: FONT_BODY }}>
      <AmbientBackground asset={ASSET_MANIFEST.backgrounds.game} overlayOpacity={0.12} />
      <ComicPanel className="relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} style={{ color: THEME.comicblack }} aria-label={t.backToMenu}>
            <ArrowLeft size={20} />
          </button>
          <div className="font-mono font-bold" style={{ color: THEME.comicblack }}>
            {t.level} {profile.progress.currentLevel} · {t.score}: {profile.progress.score}
          </div>
          {/* profile.progress.lives ya está actualizado para cuando esta
              pantalla se pinta (ver nota en handleAnswer/handleNext) —
              mostrarlo directo, sin restar de nuevo. */}
          <HeartRow lives={profile.progress.lives} />
        </div>

        {phase === "question" && (
          <QuestionCard
            t={t}
            question={question}
            language={language}
            optionOrder={optionOrder}
            timeLeft={timeLeft}
            maxTime={maxTime}
            questionNumber={questionIndex + 1}
            onAnswer={handleAnswer}
          />
        )}
        {phase === "reveal" && (
          <VerseRevealCard t={t} question={question} language={language} wasCorrect={lastAnswer.wasCorrect} timedOut={lastAnswer.timedOut} onNext={handleNext} />
        )}
      </ComicPanel>
    </div>
  );
}

// ============================================================
// 9. App raíz
// ============================================================

export default function App() {
  const [language, setLanguage] = useState("es");
  const [defaultDifficulty, setDefaultDifficulty] = useState("beginner");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Deliberadamente NO se guarda en localStorage: debe reproducirse una
  // vez por sesión de la app (cada vez que el artefacto se carga desde
  // cero), pero nunca de nuevo solo por volver al menú, cambiar idioma,
  // reiniciar una partida, etc. — todo eso ocurre sin remontar App().
  const [introComplete, setIntroComplete] = useState(false);
  // Controla la pantalla previa "Iniciar": el intro OTSV no arranca solo,
  // espera este toque.
  const [introStarted, setIntroStarted] = useState(false);
  const [screen, setScreen] = useState("menu");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [musicMuted, setMusicMuted] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSettings().then((s) => {
      if (!mounted) return;
      if (s?.language) setLanguage(s.language);
      if (s?.defaultDifficulty) setDefaultDifficulty(s.defaultDifficulty);
      if (typeof s?.musicVolume === "number") setMusicVolume(s.musicVolume);
      if (typeof s?.musicMuted === "boolean") setMusicMuted(s.musicMuted);
      setSettingsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const t = STRINGS[language];

  const music = useMusicService(musicVolume, musicMuted, settingsLoaded, (v, m) => {
    setMusicVolume(v);
    setMusicMuted(m);
    saveSettings({ language, defaultDifficulty, musicVolume: v, musicMuted: m });
  });

  async function handleSetLanguage(next) {
    setLanguage(next);
    await saveSettings({ language: next, defaultDifficulty, musicVolume, musicMuted });
  }

  async function handleSetDefaultDifficulty(next) {
    setDefaultDifficulty(next);
    await saveSettings({ language, defaultDifficulty: next, musicVolume, musicMuted });
  }

  /** Cambia la dificultad del jugador YA CARGADO (no el default global). */
  async function handleSetPlayerDifficulty(next) {
    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, progress: { ...prev.progress, difficulty: next }, lastPlayedAt: new Date().toISOString() };
      savePlayer(updated);
      return updated;
    });
  }

  async function handleSubmitName(name) {
    setLoading(true);
    const slug = slugify(name);
    const existing = await getPlayer(slug);
    if (existing) {
      setPlayer(existing);
      setScreen("playerProgress");
    } else {
      const fresh = createPlayerProfile(name, defaultDifficulty);
      await savePlayer(fresh);
      setPlayer(fresh);
      setAttempt((a) => a + 1);
      setScreen("game");
    }
    setLoading(false);
  }

  function handleSelectExistingPlayer(p) {
    setPlayer(p);
    setScreen("playerProgress");
  }

  function handleContinue() {
    setAttempt((a) => a + 1);
    setScreen("game");
  }

  async function handleRestart() {
    if (!player) return;
    const reset = resetProgress(player);
    await savePlayer(reset);
    setPlayer(reset);
    setAttempt((a) => a + 1);
    setScreen("game");
  }

  function handleBackToMenu() {
    setScreen("menu");
    setPlayer(null);
  }

  /** Se llama tras cada respuesta dentro del GameScreen. */
  function handleQuestionAnswered(question, wasCorrect, timeTakenSeconds, newHistory) {
    setPlayer((prev) => {
      if (!prev) return prev;
      const nextLives = question === null ? prev.progress.lives : wasCorrect ? prev.progress.lives : Math.max(0, prev.progress.lives - 1);
      const updated = {
        ...prev,
        questionHistory: newHistory,
        progress: { ...prev.progress, lives: nextLives },
        lastPlayedAt: new Date().toISOString(),
      };
      savePlayer(updated);
      return updated;
    });
    if (question) {
      updateStatistics(player.id, question.reference.gospel, wasCorrect, timeTakenSeconds);
    }
  }

  function handleLevelComplete() {
    setPlayer((prev) => {
      if (!prev) return prev;
      const isFinal = prev.progress.currentLevel >= TOTAL_LEVELS;
      const newScore = Math.min(MAX_SCORE, prev.progress.score + POINTS_PER_LEVEL);
      const historyEntry = {
        level: prev.progress.currentLevel,
        score: newScore,
        completedAt: new Date().toISOString(),
      };
      const updated = {
        ...prev,
        progress: {
          ...prev.progress,
          score: newScore,
          currentLevel: isFinal ? prev.progress.currentLevel : prev.progress.currentLevel + 1,
          lives: STARTING_LIVES,
        },
        levelHistory: [...(prev.levelHistory ?? []), historyEntry],
        lastPlayedAt: new Date().toISOString(),
      };
      savePlayer(updated);
      if (isFinal) {
        setScreen("menu");
        return null;
      }
      return updated;
    });
    setAttempt((a) => a + 1);
  }

  function handleLifeLossReset() {
    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, progress: { ...prev.progress, currentLevel: 1, score: 0, lives: STARTING_LIVES }, lastPlayedAt: new Date().toISOString() };
      savePlayer(updated);
      return updated;
    });
    setAttempt((a) => a + 1);
  }

  if (!settingsLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: THEME.ink, color: THEME.halo, fontFamily: FONT_BODY }}>
        {t.loading}
      </div>
    );
  }

  const sharedStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito+Sans:wght@400;600;700&display=swap');
      @keyframes introBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      .intro-bounce { animation: introBounce 0.9s ease-in-out infinite; }
      @keyframes lockPop { 0% { transform: scale(0.6) rotate(-8deg); opacity: 0; } 60% { transform: scale(1.15) rotate(4deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
      .lock-pop { animation: lockPop 0.5s ease-out; }
      @keyframes gentlePulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.06); opacity: 1; } }
      .gentle-pulse { animation: gentlePulse 1.8s ease-in-out infinite; }
      @keyframes startBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      .start-bounce { animation: startBounce 1.1s ease-in-out infinite; }

      /* char-celebrate.png — contain, centrado, alto máx. 38% móvil / 45% escritorio */
      .char-celebrate-img { max-height: 38vh; max-width: 80vw; object-fit: contain; }
      @media (min-width: 768px) { .char-celebrate-img { max-height: 45vh; } }
      @keyframes celebrateFloat {
        0%, 100% { transform: translateY(0) scale(1) rotate(-1deg); }
        25% { transform: translateY(-10px) scale(1.03) rotate(1deg); }
        50% { transform: translateY(0) scale(1.05) rotate(-1deg); }
        75% { transform: translateY(-6px) scale(1.02) rotate(1deg); }
      }
      .char-celebrate-float { animation: celebrateFloat 1.6s ease-in-out infinite; }

      /* lock-open.png — contain, centrado, 130px móvil / 200px escritorio (rango pedido: 160-240px) */
      .icon-asset-lock { width: 130px; max-width: 240px; }
      @media (min-width: 768px) { .icon-asset-lock { width: 200px; } }

      /* Barra de música: se compacta en móvil (sin título, control de
         volumen más angosto) para no tapar preguntas, botones ni
         información importante. */
      @media (max-width: 420px) {
        .music-bar { gap: 4px; padding: 6px 8px; }
        .music-bar input[type="range"] { width: 40px; }
      }

    `}</style>
  );

  if (FEATURES.introEnabled && !introComplete) {
    return (
      <>
        {sharedStyles}
        {introStarted ? (
          <IntroSequence t={t} language={language} onComplete={() => setIntroComplete(true)} />
        ) : (
          <TapToStartScreen t={t} onStart={() => setIntroStarted(true)} />
        )}
      </>
    );
  }

  return (
    <>
      {sharedStyles}
      <MusicControlBar t={t} music={music} />

      {screen === "menu" && (
        <MainMenu
          t={t}
          language={language}
          onToggleLanguage={() => handleSetLanguage(language === "es" ? "en" : "es")}
          onNavigate={setScreen}
          music={music}
        />
      )}
      {screen === "playerSetup" && (
        <PlayerSetup t={t} onSubmitName={handleSubmitName} onSelectExisting={handleSelectExistingPlayer} onBack={handleBackToMenu} loading={loading} />
      )}
      {screen === "playerProgress" && player && (
        <PlayerProgress
          t={t}
          profile={player}
          onContinue={handleContinue}
          onRestart={handleRestart}
          onBack={handleBackToMenu}
          onSetDifficulty={handleSetPlayerDifficulty}
        />
      )}
      {screen === "game" && player && (
        <GameScreen
          key={attempt}
          t={t}
          language={language}
          profile={player}
          onQuestionAnswered={handleQuestionAnswered}
          onLevelComplete={handleLevelComplete}
          onLifeLossReset={handleLifeLossReset}
          onBack={handleBackToMenu}
        />
      )}
      {screen === "configuration" && (
        <ConfigurationScreen
          t={t}
          language={language}
          onSetLanguage={handleSetLanguage}
          defaultDifficulty={defaultDifficulty}
          onSetDefaultDifficulty={handleSetDefaultDifficulty}
          onBack={handleBackToMenu}
        />
      )}
      {screen === "score" && <ScoreBoard t={t} onBack={handleBackToMenu} />}
    </>
  );
}
