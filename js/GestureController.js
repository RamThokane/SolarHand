/**
 * 🎮 Gesture Controller
 * Interprets hand landmarks and controls the solar system
 */

import { PLANET_DATA } from './data.js';

// Hand landmark indices
const LANDMARKS = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_MCP: 5,
    INDEX_PIP: 6,
    INDEX_DIP: 7,
    INDEX_TIP: 8,
    MIDDLE_MCP: 9,
    MIDDLE_PIP: 10,
    MIDDLE_DIP: 11,
    MIDDLE_TIP: 12,
    RING_MCP: 13,
    RING_PIP: 14,
    RING_DIP: 15,
    RING_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20
};

export class GestureController {
    constructor(solarSystem, handTracker) {
        this.solarSystem = solarSystem;
        this.handTracker = handTracker;
        
        // Current state
        this.currentGesture = null;
        this.previousGesture = null;
        this.gestureStartTime = 0;
        this.gestureDuration = 0;
        
        // Hand position tracking
        this.handPosition = { x: 0.5, y: 0.5 };
        this.previousHandPosition = { x: 0.5, y: 0.5 };
        this.handVelocity = { x: 0, y: 0 };
        
        // Pinch state
        this.pinchDistance = 0;
        this.previousPinchDistance = 0;
        this.basePinchDistance = 0;
        this.isPinching = false;
        
        // Selection state
        this.hoveredPlanet = null;
        this.selectedPlanet = null;
        this.followingPlanet = null;
        this.hoverStartTime = 0;
        this.hoverDuration = 0;
        
        // Camera control
        this.rotationSensitivity = 3;
        this.zoomSensitivity = 100;
        
        // Event callbacks
        this.callbacks = {
            gesture: [],
            planetSelected: [],
            planetFollowing: [],
            cameraReset: []
        };
        
        // Gesture thresholds
        this.PINCH_THRESHOLD = 0.08;
        this.FIST_THRESHOLD = 0.15;
        this.POINT_THRESHOLD = 0.1;
        this.PALM_THRESHOLD = 0.15;
    }
    
    processHand(landmarks) {
        if (!landmarks) return;
        
        // Update hand position (palm center)
        this.previousHandPosition = { ...this.handPosition };
        this.handPosition = this.getPalmCenter(landmarks);
        
        // Calculate velocity
        this.handVelocity = {
            x: this.handPosition.x - this.previousHandPosition.x,
            y: this.handPosition.y - this.previousHandPosition.y
        };
        
        // Detect current gesture
        const gesture = this.detectGesture(landmarks);
        
        // Handle gesture changes
        if (gesture !== this.currentGesture) {
            this.previousGesture = this.currentGesture;
            this.currentGesture = gesture;
            this.gestureStartTime = Date.now();
            
            if (gesture) {
                this.emit('gesture', gesture);
            }
        }
        
        this.gestureDuration = Date.now() - this.gestureStartTime;
        
        // Process based on gesture
        this.handleGesture(landmarks, gesture);
    }
    
    getPalmCenter(landmarks) {
        const wrist = landmarks[LANDMARKS.WRIST];
        const indexMcp = landmarks[LANDMARKS.INDEX_MCP];
        const pinkyMcp = landmarks[LANDMARKS.PINKY_MCP];
        
        return {
            x: (wrist.x + indexMcp.x + pinkyMcp.x) / 3,
            y: (wrist.y + indexMcp.y + pinkyMcp.y) / 3
        };
    }
    
    detectGesture(landmarks) {
        // Get finger states
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 'index');
        const middleExtended = this.isFingerExtended(landmarks, 'middle');
        const ringExtended = this.isFingerExtended(landmarks, 'ring');
        const pinkyExtended = this.isFingerExtended(landmarks, 'pinky');
        
        // Calculate pinch distance
        const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
        const indexTip = landmarks[LANDMARKS.INDEX_TIP];
        this.previousPinchDistance = this.pinchDistance;
        this.pinchDistance = this.distance(thumbTip, indexTip);
        
        // Pinch gesture (thumb and index close)
        if (this.pinchDistance < this.PINCH_THRESHOLD) {
            if (!this.isPinching) {
                this.isPinching = true;
                this.basePinchDistance = this.solarSystem.cameraOrbit.radius;
            }
            return 'pinch';
        } else {
            this.isPinching = false;
        }
        
        // Fist gesture (all fingers closed)
        if (!thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'fist';
        }
        
        // Point gesture (only index extended)
        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'point';
        }
        
        // Open palm gesture (all fingers extended)
        if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return 'palm';
        }
        
        // Default rotation control
        return 'rotate';
    }
    
    isThumbExtended(landmarks) {
        const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
        const thumbIp = landmarks[LANDMARKS.THUMB_IP];
        const thumbMcp = landmarks[LANDMARKS.THUMB_MCP];
        
        // Check if thumb is extended away from palm
        const tipToIp = this.distance(thumbTip, thumbIp);
        const ipToMcp = this.distance(thumbIp, thumbMcp);
        
        return tipToIp > 0.03 && tipToIp / ipToMcp > 0.5;
    }
    
    isFingerExtended(landmarks, finger) {
        const fingerMap = {
            'index': { tip: LANDMARKS.INDEX_TIP, pip: LANDMARKS.INDEX_PIP, mcp: LANDMARKS.INDEX_MCP },
            'middle': { tip: LANDMARKS.MIDDLE_TIP, pip: LANDMARKS.MIDDLE_PIP, mcp: LANDMARKS.MIDDLE_MCP },
            'ring': { tip: LANDMARKS.RING_TIP, pip: LANDMARKS.RING_PIP, mcp: LANDMARKS.RING_MCP },
            'pinky': { tip: LANDMARKS.PINKY_TIP, pip: LANDMARKS.PINKY_PIP, mcp: LANDMARKS.PINKY_MCP }
        };
        
        const indices = fingerMap[finger];
        const tip = landmarks[indices.tip];
        const pip = landmarks[indices.pip];
        const mcp = landmarks[indices.mcp];
        
        // Finger is extended if tip is further from wrist than pip
        const tipY = tip.y;
        const pipY = pip.y;
        
        return tipY < pipY - 0.02;
    }
    
    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    handleGesture(landmarks, gesture) {
        switch (gesture) {
            case 'rotate':
                this.handleRotation();
                break;
            case 'pinch':
                this.handlePinch(landmarks);
                break;
            case 'point':
                this.handlePoint(landmarks);
                break;
            case 'fist':
                this.handleFist();
                break;
            case 'palm':
                this.handlePalm();
                break;
        }
    }
    
    handleRotation() {
        // Map hand position to camera rotation
        // Hand moves left/right -> rotate horizontally
        // Hand moves up/down -> adjust vertical angle
        
        const deltaTheta = this.handVelocity.x * this.rotationSensitivity;
        const deltaPhi = this.handVelocity.y * this.rotationSensitivity;
        
        this.solarSystem.adjustRotation(-deltaTheta, deltaPhi);
    }
    
    handlePinch(landmarks) {
        // Use distance between thumb and index for zoom
        const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
        const indexTip = landmarks[LANDMARKS.INDEX_TIP];
        
        // Spread = zoom out, pinch = zoom in
        const currentDistance = this.distance(thumbTip, indexTip);
        const deltaDistance = currentDistance - this.previousPinchDistance;
        
        // Invert: smaller distance = closer zoom
        this.solarSystem.adjustZoom(-deltaDistance * this.zoomSensitivity);
    }
    
    handlePoint(landmarks) {
        // Get index fingertip position
        const indexTip = landmarks[LANDMARKS.INDEX_TIP];
        
        // Convert to screen coordinates
        const screenX = (1 - indexTip.x) * window.innerWidth;
        const screenY = indexTip.y * window.innerHeight;
        
        // Check for planet at position
        const planet = this.solarSystem.getPlanetAtScreenPosition(screenX, screenY);
        
        if (planet) {
            if (this.hoveredPlanet !== planet) {
                this.hoveredPlanet = planet;
                this.hoverStartTime = Date.now();
                this.solarSystem.highlightPlanet(planet);
            }
            
            this.hoverDuration = Date.now() - this.hoverStartTime;
            
            // Select after 1.5 seconds of hovering
            if (this.hoverDuration > 1500 && this.selectedPlanet !== planet) {
                this.selectedPlanet = planet;
                this.solarSystem.selectPlanet(planet);
                this.solarSystem.focusOnPlanet(planet);
                this.emit('planetSelected', planet);
            }
        } else {
            if (this.hoveredPlanet) {
                this.solarSystem.highlightPlanet(null);
                this.hoveredPlanet = null;
            }
        }
    }
    
    handleFist() {
        // Toggle follow mode on currently selected planet
        if (this.gestureDuration > 500 && this.gestureDuration < 700) {
            if (this.selectedPlanet) {
                if (this.followingPlanet === this.selectedPlanet) {
                    // Stop following
                    this.followingPlanet = null;
                    this.solarSystem.stopFollowing();
                    this.emit('planetFollowing', null);
                } else {
                    // Start following
                    this.followingPlanet = this.selectedPlanet;
                    this.solarSystem.followPlanet(this.selectedPlanet);
                    this.emit('planetFollowing', this.selectedPlanet);
                }
            }
        }
    }
    
    handlePalm() {
        // Reset view after holding palm for 1 second
        if (this.gestureDuration > 1000 && this.gestureDuration < 1200) {
            this.solarSystem.resetView();
            this.selectedPlanet = null;
            this.followingPlanet = null;
            this.emit('cameraReset');
            this.emit('planetFollowing', null);
        }
    }
    
    onHandLost() {
        this.currentGesture = null;
        this.isPinching = false;
        
        // Clear hover state
        if (this.hoveredPlanet) {
            this.solarSystem.highlightPlanet(null);
            this.hoveredPlanet = null;
        }
    }
    
    update() {
        // Additional updates if needed
    }
    
    // Manual controls (for fallback)
    manualRotate(deltaTheta, deltaPhi) {
        this.solarSystem.adjustRotation(deltaTheta, deltaPhi);
    }
    
    manualZoom(delta) {
        this.solarSystem.adjustZoom(delta);
    }
    
    manualSelectPlanet(planetName) {
        this.selectedPlanet = planetName;
        this.solarSystem.selectPlanet(planetName);
        this.solarSystem.focusOnPlanet(planetName);
        this.emit('planetSelected', planetName);
    }
    
    manualFollowPlanet(planetName) {
        this.followingPlanet = planetName;
        this.solarSystem.followPlanet(planetName);
        this.emit('planetFollowing', planetName);
    }
    
    manualReset() {
        this.solarSystem.resetView();
        this.selectedPlanet = null;
        this.followingPlanet = null;
        this.emit('cameraReset');
        this.emit('planetFollowing', null);
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
    
    // Getters
    getCurrentGesture() {
        return this.currentGesture;
    }
    
    getHandPosition() {
        return this.handPosition;
    }
    
    getSelectedPlanet() {
        return this.selectedPlanet;
    }
    
    getFollowingPlanet() {
        return this.followingPlanet;
    }
}
