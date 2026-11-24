# 🟡 Pac-Man Arcade Offline

Versión moderna, **mobile-first** y **100% offline (PWA)** del clásico Pac-Man, construida con HTML5 Canvas, CSS y JavaScript puro (sin frameworks ni dependencias externas). Funciona tanto en **teléfonos móviles / tablets** como en **PC**.

---

## ✨ Características principales

- 📱 **Diseñado para móvil y PC:** interfaz adaptable (`100dvh`) sin scroll accidental, optimizada para jugar en vertical u horizontal en teléfonos y en escritorio.
- 🕹️ **Modos de juego en un menú interactivo:**
  - **Arcade — 🟡 Normal (Clásico Puro):** recorre los 10 niveles de forma secuencial sin poderes ni Turbo, solo puntos, frutas dulces y 1-UP cada 10,000 pts.
  - **Arcade — ⚡ Poderes:** recorre los 10 niveles con todas las mecánicas modernas (Turbo Dash, Racha Combo, Hielo, Imán, Escudo, Corazones de Vida y frutas tóxicas).
  - **🔥 Modo Caótico:** incluye selector de **Mapa Aleatorio** (sin repetir el recién jugado) o cualquier mapa inicial de los 10 disponibles, **muros internos destructibles**, **lluvia de poderes cada 14s**, **Bombas Destructoras** y un **5.º fantasma caótico veloz** durante 14 segundos. Al ganar cada nivel cambia automáticamente al siguiente mapa.
- 🌈 **10 laberintos neón dinámicos (`19 × 21`):** *Clásico Neón*, *Ciber Púrpura*, *Fortaleza Esmeralda*, *Núcleo Solar*, *Espiral Carmesí*, *Abismo Cian*, *Circuito Neón*, *Arena Diamante*, *Templo Magenta* y *Núcleo Caos* — todos validados sin callejones sin salida (*dead-ends*) ni pasillos dobles (`2×2`), con paredes conectadas, cuadrícula luminosa, puerta láser y túneles señalizados.
- 💾 **Auto-guardado tipo app nativa:** al salir de la app, cambiar de pestaña o bloquear el teléfono (`visibilitychange` / `pagehide`), la partida se pausa y guarda automáticamente en `localStorage` (`pacman_offline_savestate`). Al volver, puedes elegir **▶ CONTINUAR PARTIDA** o **↻ NUEVA PARTIDA**.
- 🎮 **3 modos de control táctil** intercambiables en cualquier momento:
  - **Dedo (Swipe):** deslizamiento rápido con ancla rodante y soporte multitáctil para cambios de dirección instantáneos.
  - **Joystick virtual:** palanca flotante ágil con zona muerta reducida.
  - **Cruceta (D-Pad):** botones direccionales con soporte para deslizar el pulgar sin levantarlo.
- 🎯 **Movimiento preciso:** sin giros automáticos en esquinas ni asistencias artificiales; control total en cada intersección y giro de 180° instantáneo.
- 👻 **IA fiel al Pac-Man original:**
  - Ciclos oficiales de **Scatter** (dispersión a las 4 esquinas) y **Chase** (persecución), con inversión de sentido al cambiar de fase.
  - Salida escalonada de la casa de fantasmas.
  - Personalidades clásicas: **Blinky** (perseguidor + *Cruise Elroy*), **Pinky** (embosca 4 casillas adelante), **Inky** (flanqueo por vector con Blinky) y **Clyde** (persigue de lejos y se retira si se acerca).
  - Fantasmas comidos regresan como ojos flotantes a regenerarse a la casa.
- 🔊 **Audio offline híbrido:** música de inicio en bucle hasta pulsar **JUGAR**, sirena dinámica según avance del nivel y efectos combinando MP3 locales + Web Audio API.
- 📶 **Modo Offline (PWA):** incluye `manifest.json` y Service Worker (`sw.js`) para instalarlo en la pantalla de inicio y jugar sin internet.

---

## ⚡ Mecánicas y Power-Ups

| Mecánica | Descripción |
| :--- | :--- |
| **⚡ Turbo Dash** | Comer puntos carga la barra de Turbo. Al llegar al 100%, actívalo para ganar **+55% de velocidad** durante `1.45s` con estela luminosa. En **Modo Caótico**, embestir muros internos con Turbo los destruye. |
| **🔥 Racha Combo (`x1` → `x4`)** | Comer puntos de forma continua aumenta tu multiplicador de puntuación. |
| **🍒 Frutas Clásicas** | Aparecen de forma independiente en cada nivel (a los 35 y 85 puntos) para otorgar `150 × nivel` puntos y +20% de Turbo. |
| **☠️ Fruta Tóxica / Podrida** | En *Arcade Poderes* y *Caótico*, cada fruta tiene un **30% de probabilidad** de salir podrida (morado oscuro y verde ácido con burbujas). El Imán no la atrae; comerla resta `100 × nivel` pts, reinicia el combo a `x1` y quita `-20%` de Turbo. Con **Escudo** o **Turbo Dash** activo, la purificas y ganas **`+100` pts**. |
| **❄️ Orbe de Hielo** | Congela a todos los fantasmas activos durante `4.5s`. |
| **🧲 Imán de Puntos** | Atrae automáticamente los puntos cercanos durante `6.5s`. |
| **🛡️ Escudo** | Absorbe un golpe mortal, lanza una onda expansiva que asusta fantasmas cercanos (y en **Modo Caótico** destruye muros internos cercanos) y otorga invulnerabilidad breve. |
| **🤖 Clon Holográfico (Píldora Pac-Man)** | *(Arcade Poderes y Modo Caótico)* Invoca un segundo Pac-Man con IA propia durante `10s`: come puntos por ti, se come fantasmas asustados y sirve de **señuelo** atrayendo a todos los fantasmas hacia él sin quitarte vidas si lo atrapan. |
| **💣 Bomba Destructora** | *(Exclusivo de Modo Caótico)* Explota al recogerla y destruye muros internos en un radio de 2 casillas (protegiendo siempre bordes exteriores y la casa de fantasmas). |
| **👾 5.º Fantasma Caótico** | *(Exclusivo de Modo Caótico)* Fantasma neón morado (`#a855f7`) más veloz que persigue agresivamente a Pac-Man durante `14s`. |
| **👹 Titán Destructor** | *(Exclusivo de Modo Caótico)* Fantasma gigante (`1.45×`) con aura de fuego que aparece durante `16s` y **atraviesa y destruye muros internos** en su camino hacia Pac-Man (comérselo asustado da mínimo `+600` pts). |
| **♾️ Mapas Infinitos** | Generador procedural simétrico (`js/mapGenerator.js`) disponible en el selector de Modo Caótico (`♾️`) y automáticamente al superar el Nivel 10 en Modo Arcade. |
| **💚 Recuperación de Vidas** | Empiezas con 5 vidas (máximo 6). Si pierdes vidas (en *Poderes* o *Caótico*), se garantiza un **corazón verde** en el mapa. En todos los modos, cada **10,000 puntos** aparece un banner animado con **+1 vida (1-UP)** o **`+500` puntos bonus** si ya tienes todas las vidas. |

---

## 🕹️ Controles

### 📱 En móvil / tablet
- **Moverse:** elige entre **Dedo**, **Joystick** o **Cruceta** con el botón de modo de control en la barra inferior.
- **Activar Turbo:** pulsa el botón **⚡ Turbo** o haz **doble toque rápido** en pantalla (en modo *Dedo*).
- **Pausa / Sonido:** botones dedicados en la barra arcade.

### 💻 En PC
- **Moverse:** `Flechas` o `W` `A` `S` `D`
- **Activar Turbo:** `Espacio` o `Shift`
- **Pausar / Continuar:** `P`
- **Silenciar / Activar sonido:** `M`

### 🎮 Con control (Xbox, PlayStation, Switch o genérico USB/Bluetooth)
*(Conecta tu mando y presiona cualquier botón; el juego lo detecta automáticamente con cursor visual en los menús y vibración).*
- **Moverse:** `Cruceta (D-Pad)` o `Stick izquierdo`
- **Activar Turbo:** `A`, `X`, `RB` o `RT` *(en PlayStation: `✕`, `□`, `R1` o `R2`)*
- **Pausa:** `Start / Menú` *(usa `Arriba / Abajo` + `A` para elegir Continuar, Menú Principal o Nueva Partida; atajos rápidos: `Start` reanuda, `B` sale al Menú Principal, `Y` inicia Nueva Partida)*
- **Silenciar / Activar sonido:** `View / Back / Select`
- **Menú principal:** `Arriba / Abajo` mueve el cursor entre **Modo**, **Selector de mapa (Caótico)**, **Continuar partida** y **Jugar / Nueva partida**; `Izquierda / Derecha` cambia de modo o de mapa; `LB / RB` cambian de mapa rápido en Caótico (`X` vuelve a Aleatorio); `A` acepta la opción resaltada y `Y` inicia nueva partida directo.

---

## 🚀 Cómo descargarlo y ejecutarlo

### Opción 1: Descargar o clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd pacman-offline
```
*(O descarga el proyecto como ZIP y descomprímelo en una carpeta).*

### Opción 2: Jugarlo rápido en PC
Puedes abrir `index.html` directamente en tu navegador.

> **Nota:** Para que el **Service Worker (modo offline / PWA)** y la carga óptima de audios funcionen al 100%, se recomienda abrirlo mediante un servidor HTTP local.

### Opción 3: Ejecutar con servidor local (recomendado)

Con **Python 3**:
```bash
python -m http.server 8080
```

Con **Node.js (`npx`)**:
```bash
npx serve .
```

Con **VS Code**:
- Instala la extensión **Live Server**, haz clic derecho en `index.html` y elige **Open with Live Server**.

Luego abre en tu navegador: `http://localhost:8080` (o la IP local de tu PC desde tu teléfono en la misma red Wi-Fi).

---

## 📲 Instalarlo como app en el teléfono (PWA)

Una vez abierto desde un servidor HTTP/HTTPS (por ejemplo GitHub Pages, Netlify o tu red local):
- **Android (Chrome):** abre el menú (`⋮`) → **"Instalar aplicación"** o **"Agregar a pantalla principal"**.
- **iPhone / iPad (Safari):** pulsa el botón **Compartir** → **"Agregar a inicio"**.

Después de cargarlo una vez, podrás abrirlo y jugarlo **sin conexión a internet** con auto-guardado automático al salir.

---

## 📁 Estructura del proyecto

```text
pacman-offline/
├── index.html          # Estructura principal, HUD, menú de modos y controles táctiles
├── style.css           # Diseño responsive mobile-first y estilos arcade
├── js/
│   ├── constants.js    # Constantes, direcciones, ciclos Scatter/Chase y helpers
│   ├── maps.js         # Catálogo de 10 laberintos neón (19 × 21)
│   ├── audio.js        # Motor de audio offline híbrido (MP3 + Web Audio API)
│   ├── input.js        # Controles de teclado, Swipe, Joystick y Cruceta
│   ├── renderer.js     # Renderizado Canvas 2D (laberinto, Pac-Man, fantasmas, FX)
│   └── main.js         # Estado, lógica de juego, IA, Modo Caótico y auto-guardado
├── manifest.json       # Configuración PWA para instalación en móviles
├── sw.js               # Service Worker para caché y juego sin conexión
├── icon-192.png        # Ícono de la app (192x192)
├── icon-512.png        # Ícono de la app (512x512)
└── sounds/             # Efectos de sonido locales (.mp3)
    ├── death.mp3
    ├── eatghost.mp3
    ├── fruit.mp3
    └── power.mp3
```
