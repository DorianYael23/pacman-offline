# 🟡 Pac-Man Arcade Offline

Versión moderna, **mobile-first** y **100% offline (PWA)** del clásico Pac-Man, construida con HTML5 Canvas, CSS y JavaScript puro (sin frameworks ni dependencias externas). Funciona tanto en **teléfonos móviles / tablets** como en **PC**.

---

## ✨ Características principales

- 📱 **Diseñado para móvil y PC:** interfaz adaptable (`100dvh`) sin scroll accidental, optimizada para jugar en vertical u horizontal en teléfonos y en escritorio.
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
- 🌈 **6 laberintos con estilo neón dinámico:** *Clásico Neón*, *Ciber Púrpura*, *Fortaleza Esmeralda*, *Núcleo Solar*, *Espiral Carmesí* y *Abismo Cian*, con paredes conectadas, cuadrícula luminosa, puerta láser y túneles señalizados.
- 🔊 **Audio offline híbrido:** música de inicio en bucle hasta pulsar **JUGAR**, sirena dinámica según avance del nivel y efectos combinando MP3 locales + Web Audio API.
- 📶 **Modo Offline (PWA):** incluye `manifest.json` y Service Worker (`sw.js`) para instalarlo en la pantalla de inicio y jugar sin internet.

---

## ⚡ Mecánicas adicionales

| Mecánica | Descripción |
| :--- | :--- |
| **⚡ Turbo Dash** | Comer puntos carga la barra de Turbo. Al llegar al 100%, actívalo para ganar **+55% de velocidad** durante `1.45s` con estela luminosa. |
| **🔥 Racha Combo (`x1` → `x4`)** | Comer puntos de forma continua aumenta tu multiplicador de puntuación. |
| **🍒 Frutas Clásicas** | Aparecen de forma independiente en cada nivel (a los 35 y 85 puntos) para otorgar `150 × nivel` puntos y +20% de Turbo. |
| **❄️ Orbe de Hielo** | Congela a todos los fantasmas activos durante `4.5s`. |
| **🧲 Imán de Puntos** | Atrae automáticamente los puntos cercanos durante `6.5s`. |
| **🛡️ Escudo** | Absorbe un golpe mortal, lanza una onda expansiva que asusta a los fantasmas cercanos y otorga invulnerabilidad breve. |
| **💚 Recuperación de Vidas** | Si tienes menos de 5 vidas, pueden aparecer **corazones de vida extra** en el mapa, y además obtienes **+1 vida (1-UP)** automáticamente cada **10,000 puntos**. |

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

Después de cargarlo una vez, podrás abrirlo y jugarlo **sin conexión a internet**.

---

## 📁 Estructura del proyecto

```text
pacman-offline/
├── index.html      # Estructura principal, HUD, barras y controles táctiles
├── style.css       # Diseño responsive mobile-first y estilos arcade
├── game.js         # Motor del juego, mapas, IA de fantasmas, audio y controles
├── manifest.json   # Configuración PWA para instalación en móviles
├── sw.js           # Service Worker para caché y juego sin conexión
├── icon-192.png    # Ícono de la app (192x192)
├── icon-512.png    # Ícono de la app (512x512)
└── sounds/         # Efectos de sonido locales (.mp3)
    ├── death.mp3
    ├── eatghost.mp3
    ├── fruit.mp3
    └── power.mp3
```
