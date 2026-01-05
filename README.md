# Interactive Solar System with Hand Gesture Control

An immersive 3D solar system visualization where you control the camera using hand gestures detected through your webcam. Built with Three.js and MediaPipe Hands.



## ✨ Features

### 🖐️ Hand Gesture Controls

- **Move Hand Left/Right** → Rotate camera horizontally around the solar system
- **Move Hand Up/Down** → Adjust vertical viewing angle
- **Pinch Gesture** → Zoom in (closer) / Zoom out (spread fingers)
- **Point at Planet** → Highlight and select planets
- **Fist Gesture** → Lock camera to follow selected planet
- **Open Palm** → Reset view to default

### 🌍 Solar System Elements

- ☀️ **Sun** - Glowing center with animated corona effects
- 🪐 **8 Planets** - Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- 🌙 **Moons** - Major moons including Earth's Moon, Jupiter's Galilean moons
- 💫 **Asteroid Belt** - Particle system between Mars and Jupiter
- ✨ **Starfield** - Animated background with parallax effect
- 🌊 **Orbital Paths** - Visible orbit lines (toggleable)

### 🎨 Visual Features

- Realistic planet colors and relative sizes
- Saturn's rings with transparency
- Earth with continents and clouds
- Sun as the light source
- Bloom/glow effects
- Smooth camera transitions

### 🎮 UI Components

- Hand tracking indicator with gesture feedback
- Planet info panels with scientific data
- Interactive planet selection bar
- Settings panel (labels, orbits, speed)
- Screenshot capture
- Keyboard shortcuts

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge recommended)
- Webcam for hand tracking
- Local web server (for development)

### Installation

1. **Clone or download this repository**

```bash
git clone <repository-url>
cd SolarHand
```

2. **Start a local server**

Using Python:

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Using Node.js:

```bash
npx serve
```

Using VS Code:

- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

3. **Open in browser**

```
http://localhost:8080
```

4. **Allow camera access** when prompted

## 🎯 Controls

### Hand Gestures

| Gesture      | Action                 |
| ------------ | ---------------------- |
| ✋ Move Hand | Rotate camera view     |
| 🤏 Pinch     | Zoom in/out            |
| 👆 Point     | Select planet          |
| ✊ Fist      | Follow selected planet |
| 🖐️ Open Palm | Reset view             |

### Keyboard Shortcuts

| Key           | Action              |
| ------------- | ------------------- |
| `1-9`         | Quick select planet |
| `H`           | Toggle help panel   |
| `S`           | Toggle settings     |
| `R` / `Space` | Reset view          |
| `M`           | Toggle music        |
| `Esc`         | Close panels        |

### Mouse/Touch (Fallback)

- **Drag** to rotate
- **Scroll** to zoom
- **Click** planet buttons to select

## ⚙️ Settings

- **Planet Labels** - Show/hide planet names
- **Orbit Paths** - Show/hide orbital lines
- **Show Moons** - Toggle moon visibility
- **Asteroid Belt** - Toggle asteroid particles
- **Orbit Speed** - Adjust animation speed
- **Realistic Distances** - Toggle scaled distances

## 🛠️ Technologies

- **[Three.js](https://threejs.org/)** - 3D graphics and WebGL rendering
- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)** - Real-time hand tracking
- **ES6 Modules** - Modern JavaScript architecture
- **CSS3** - Animations and glassmorphism effects

## 📁 Project Structure

```
SolarHand/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── js/
│   ├── main.js         # Application entry point
│   ├── SolarSystem.js  # Three.js scene and planets
│   ├── HandTracker.js  # MediaPipe hand tracking
│   ├── GestureController.js  # Gesture recognition
│   ├── UIController.js # UI interactions
│   └── data.js         # Planet data and facts
└── README.md
```

## 🎨 Customization

### Adding More Planets/Objects

Edit `js/data.js` to add or modify celestial objects:

```javascript
export const PLANET_DATA = {
  // Add your custom object
  pluto: {
    name: "Pluto",
    icon: "❄️",
    type: "Dwarf Planet",
    color: 0xc9a77c,
    size: 0.2,
    distance: 90,
    // ... more properties
  },
};
```

### Adjusting Visual Settings

Modify `js/SolarSystem.js` for:

- Camera settings (FOV, near/far planes)
- Post-processing effects (bloom intensity)
- Planet materials and textures
- Lighting configuration

## 🐛 Troubleshooting

### Camera not working?

- Check browser permissions for camera access
- Ensure HTTPS or localhost (required for webcam)
- Try refreshing the page

### Hand not detected?

- Ensure good lighting
- Keep hand in frame of webcam
- Hold gestures steady for recognition

### Performance issues?

- Close other browser tabs
- Reduce star count in `SolarSystem.js`
- Lower pixel ratio in renderer settings

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

- Planet data from NASA
- Hand tracking by Google MediaPipe
- 3D rendering by Three.js team

---

**Made with ❤️ for space enthusiasts**

🌟 If you like this project, give it a star!
