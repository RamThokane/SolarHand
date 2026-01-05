/**
 * 🖐️ Hand Tracker - MediaPipe Hands Integration
 * Handles webcam access and hand landmark detection
 */

export class HandTracker {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        this.hands = null;
        this.camera = null;
        
        this.isRunning = false;
        this.lastLandmarks = null;
        this.handDetected = false;
        
        // Event callbacks
        this.callbacks = {
            handDetected: [],
            handLost: []
        };
        
        // Smoothing
        this.smoothedLandmarks = null;
        this.smoothingFactor = 0.5;
    }
    
    async init() {
        // Request camera access
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            this.video.srcObject = stream;
            await this.video.play();
        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error('Camera access is required for hand tracking');
        }
        
        // Initialize MediaPipe Hands
        this.hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });
        
        this.hands.onResults((results) => this.onResults(results));
        
        // Setup canvas for hand visualization
        this.canvas.width = 200;
        this.canvas.height = 150;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Use Camera utility from MediaPipe
        this.camera = new window.Camera(this.video, {
            onFrame: async () => {
                if (this.isRunning) {
                    await this.hands.send({ image: this.video });
                }
            },
            width: 640,
            height: 480
        });
        
        this.camera.start();
    }
    
    stop() {
        this.isRunning = false;
        if (this.camera) {
            this.camera.stop();
        }
    }
    
    onResults(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw mirrored video
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
            results.image,
            -this.canvas.width, 0,
            this.canvas.width, this.canvas.height
        );
        this.ctx.restore();
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Smooth landmarks
            this.smoothLandmarks(landmarks);
            
            // Draw hand visualization
            this.drawHand(landmarks);
            
            // Emit hand detected event
            if (!this.handDetected) {
                this.handDetected = true;
            }
            this.emit('handDetected', this.smoothedLandmarks);
            
            this.lastLandmarks = this.smoothedLandmarks;
        } else {
            // Hand lost
            if (this.handDetected) {
                this.handDetected = false;
                this.emit('handLost');
            }
            this.smoothedLandmarks = null;
        }
    }
    
    smoothLandmarks(landmarks) {
        if (!this.smoothedLandmarks) {
            this.smoothedLandmarks = landmarks.map(lm => ({ ...lm }));
            return;
        }
        
        for (let i = 0; i < landmarks.length; i++) {
            this.smoothedLandmarks[i].x = this.lerp(
                this.smoothedLandmarks[i].x,
                landmarks[i].x,
                this.smoothingFactor
            );
            this.smoothedLandmarks[i].y = this.lerp(
                this.smoothedLandmarks[i].y,
                landmarks[i].y,
                this.smoothingFactor
            );
            this.smoothedLandmarks[i].z = this.lerp(
                this.smoothedLandmarks[i].z,
                landmarks[i].z,
                this.smoothingFactor
            );
        }
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    drawHand(landmarks) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Mirror x coordinates for display
        const mirror = (x) => w - x * w;
        
        // Draw connections
        const connections = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20],
            // Palm
            [5, 9], [9, 13], [13, 17]
        ];
        
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.6)';
        ctx.lineWidth = 2;
        
        connections.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(mirror(landmarks[i].x), landmarks[i].y * h);
            ctx.lineTo(mirror(landmarks[j].x), landmarks[j].y * h);
            ctx.stroke();
        });
        
        // Draw landmarks
        landmarks.forEach((landmark, i) => {
            const x = mirror(landmark.x);
            const y = landmark.y * h;
            
            // Fingertips are larger
            const isFingerTip = [4, 8, 12, 16, 20].includes(i);
            const radius = isFingerTip ? 5 : 3;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isFingerTip ? '#00f5ff' : 'rgba(0, 245, 255, 0.8)';
            ctx.fill();
        });
    }
    
    // Event system
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
    
    // Getters for current state
    getLandmarks() {
        return this.smoothedLandmarks;
    }
    
    isHandDetected() {
        return this.handDetected;
    }
}
