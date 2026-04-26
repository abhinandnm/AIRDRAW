# 🎨 AirDraw: Professional AI-Powered Air Drawing

**AirDraw** is a premium, web-based drawing application that allows you to paint in thin air using your hand gestures or your mouse. Powered by **MediaPipe's Hand Landmarker AI**, it provides a magical, zero-touch creative experience with professional-grade precision smoothing and stunning visual effects.



## ✨ Key Features

- ☝️ **AI Hand Tracking**: Draw naturally in the air using your index finger.
- 🖱️ **Mouse Support**: Pixel-perfect drawing and erasing fallback for fine details.
- ✨ **Glitter Mode**: A magical, shimmering rainbow trail effect for your creations.
- 🎯 **Precision Smoothing**: Built-in exponential smoothing algorithm for professional, non-jittery strokes.
- 📐 **Auto-Resolution Sync**: Automatically adjusts workspace to match your camera's native aspect ratio for 1:1 accuracy.
- 💎 **Glassmorphic UI**: A beautiful, modern dark-themed interface with Apple-style blurring and animations.
- 🖼️ **Download & Share**: Export your masterpieces directly as high-quality PNG files.
- 🎉 **Haptic Visuals**: Interactive particle systems and confetti effects for a rich user experience.

## 🛠️ Technology Stack

- **Framework**: [React 19](https://reactjs.org/)
- **AI Engine**: [Google MediaPipe Tasks Vision](https://developers.google.com/mediapipe)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **Effects**: [Canvas Confetti](https://github.com/catdad/canvas-confetti)

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A modern web browser with camera access

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/airdraw.git
   cd airdraw
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to `http://localhost:5173`
6 How to Use

1. **Initialize**: Allow camera access and wait for the "Precision Active" status.
2. **Air Drawing**: Point your **Index Finger** up to start drawing. Lower it or curl it to stop.
3. **Mouse Drawing**: Click and drag anywhere on the workspace to draw or erase.
4. **Toolbar**: Use the bottom toolbar to switch colors, toggle **Glitter Mode**, adjust brush size, or clear the canvas.
5. **Download**: Click the download icon to save your artwork!

