# Interactive Solar System with Hand Gesture Control

An immersive 3D solar system visualization where you control the camera using hand gestures detected through your webcam. Built with Three.js and MediaPipe Hands.



## Features

### Hand Gesture Controls

- **Move Hand Left/Right** → Rotate camera horizontally around the solar system
- **Move Hand Up/Down** → Adjust vertical viewing angle
- **Pinch Gesture** → Zoom in (closer) / Zoom out (spread fingers)
- **Point at Planet** → Highlight and select planets
- **Fist Gesture** → Lock camera to follow selected planet
- **Open Palm** → Reset view to default

 - Visible orbit lines (toggleable)



### UI Components

- Hand tracking indicator with gesture feedback
- Planet info panels with scientific data
- Interactive planet selection bar
- Settings panel (labels, orbits, speed)
- Screenshot capture
- Keyboard shortcuts



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

## Controls

### Hand Gestures

| Gesture      | Action                 |
| ------------ | ---------------------- |
| ✋ Move Hand | Rotate camera view     |
| 🤏 Pinch     | Zoom in/out            |
| 👆 Point     | Select planet          |
| ✊ Fist      | Follow selected planet |
| 🖐️ Open Palm | Reset view             |





## 🛠️ Technologies

- **[Three.js](https://threejs.org/)** - 3D graphics and WebGL rendering
- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)** - Real-time hand tracking
- **ES6 Modules** - Modern JavaScript architecture
- **CSS3** - Animations and glassmorphism effects







### Hand not detected?

- Ensure good lighting
- Keep hand in frame of webcam
- Hold gestures steady for recognition

### Performance issues?

- Close other browser tabs
- Reduce star count in `SolarSystem.js`
- Lower pixel ratio in renderer settings








**Made with ❤️ by ram for space enthusiasts**


