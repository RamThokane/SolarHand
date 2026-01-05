/**
 * 🌌 Interactive Solar System with Hand Gesture Control
 * Main Entry Point
 */

import * as THREE from 'three';
import { SolarSystem } from './SolarSystem.js';
import { HandTracker } from './HandTracker.js';
import { GestureController } from './GestureController.js';
import { UIController } from './UIController.js';
import { PLANET_DATA, SPACE_FACTS } from './data.js';

class SolarSystemApp {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        
        // Core systems
        this.solarSystem = null;
        this.handTracker = null;
        this.gestureController = null;
        this.uiController = null;
        
        // Settings
        this.settings = {
            showLabels: true,
            showOrbits: true,
            showMoons: true,
            showAsteroids: true,
            orbitSpeed: 1,
            realisticScale: false,
            soundEnabled: false
        };
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
        
        // Initialize landing screen
        this.initLandingScreen();
    }
    
    initLandingScreen() {
        // Create animated stars for landing screen
        this.createLandingStars();
        
        // Start button handler
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => this.startExperience());
    }
    
    createLandingStars() {
        const starsContainer = document.getElementById('landing-stars');
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.8 + 0.2};
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            starsContainer.appendChild(star);
        }
        
        // Add twinkle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
    
    async startExperience() {
        const landingScreen = document.getElementById('landing-screen');
        const loadingScreen = document.getElementById('loading-screen');
        const mainExperience = document.getElementById('main-experience');
        
        // Transition to loading screen
        landingScreen.classList.add('fade-out');
        setTimeout(() => {
            landingScreen.classList.add('hidden');
            loadingScreen.classList.remove('hidden');
            loadingScreen.classList.add('fade-in');
        }, 500);
        
        // Show random space facts during loading
        this.startFactRotation();
        
        try {
            // Initialize all systems
            await this.initialize();
            
            // Transition to main experience
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    mainExperience.classList.remove('hidden');
                    mainExperience.classList.add('fade-in');
                    
                    // Start the experience
                    this.start();
                }, 500);
            }, 2000); // Minimum loading time for effect
            
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to initialize. Please refresh and try again.');
        }
    }
    
    startFactRotation() {
        const factElement = document.getElementById('loading-fact');
        let factIndex = 0;
        
        this.factInterval = setInterval(() => {
            factIndex = (factIndex + 1) % SPACE_FACTS.length;
            factElement.style.opacity = '0';
            setTimeout(() => {
                factElement.textContent = SPACE_FACTS[factIndex];
                factElement.style.opacity = '1';
            }, 300);
        }, 3000);
    }
    
    async initialize() {
        // Initialize Three.js Solar System
        this.solarSystem = new SolarSystem(
            document.getElementById('canvas-container'),
            this.settings
        );
        await this.solarSystem.init();
        
        // Initialize Hand Tracker
        this.handTracker = new HandTracker(
            document.getElementById('webcam'),
            document.getElementById('hand-canvas')
        );
        await this.handTracker.init();
        
        // Initialize Gesture Controller
        this.gestureController = new GestureController(
            this.solarSystem,
            this.handTracker
        );
        
        // Initialize UI Controller
        this.uiController = new UIController(
            this.solarSystem,
            this.gestureController,
            this.settings
        );
        this.uiController.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', this.onResize);
        
        // Hand tracking events
        this.handTracker.on('handDetected', (landmarks) => {
            this.gestureController.processHand(landmarks);
            this.updateHandIndicator(true);
        });
        
        this.handTracker.on('handLost', () => {
            this.gestureController.onHandLost();
            this.updateHandIndicator(false);
        });
        
        // Gesture events
        this.gestureController.on('gesture', (gesture) => {
            this.showGestureFeedback(gesture);
        });
        
        this.gestureController.on('planetSelected', (planetName) => {
            this.uiController.showPlanetInfo(planetName);
        });
        
        this.gestureController.on('planetFollowing', (planetName) => {
            this.uiController.updateFollowingStatus(planetName);
        });
        
        // Settings changes
        this.uiController.on('settingChanged', (setting, value) => {
            this.settings[setting] = value;
            this.solarSystem.updateSetting(setting, value);
        });
    }
    
    updateHandIndicator(detected) {
        const indicator = document.getElementById('hand-indicator');
        const status = indicator.querySelector('.hand-status');
        
        if (detected) {
            indicator.classList.add('detected');
            status.textContent = 'Hand detected';
        } else {
            indicator.classList.remove('detected');
            status.textContent = 'Detecting hand...';
        }
    }
    
    showGestureFeedback(gesture) {
        const feedback = document.getElementById('gesture-feedback');
        const gestureName = feedback.querySelector('.gesture-name');
        
        const gestureNames = {
            'pinch': '🤏 Zooming',
            'point': '👆 Selecting',
            'fist': '✊ Following',
            'palm': '🖐️ Reset View',
            'rotate': '👋 Rotating'
        };
        
        if (gestureNames[gesture]) {
            gestureName.textContent = gestureNames[gesture];
            feedback.classList.remove('hidden');
            
            clearTimeout(this.gestureFeedbackTimeout);
            this.gestureFeedbackTimeout = setTimeout(() => {
                feedback.classList.add('hidden');
            }, 1000);
        }
    }
    
    start() {
        if (this.factInterval) {
            clearInterval(this.factInterval);
        }
        
        this.isRunning = true;
        this.animate();
        
        // Start hand tracking
        this.handTracker.start();
        
        // Play ambient music if enabled
        if (this.settings.soundEnabled) {
            const audio = document.getElementById('ambient-audio');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(this.animate);
        
        // Update solar system
        this.solarSystem.update();
        
        // Update gesture controller
        this.gestureController.update();
        
        // Update UI
        this.uiController.update();
    }
    
    onResize() {
        this.solarSystem.onResize();
    }
    
    showError(message) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ff4757';
        }
    }
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SolarSystemApp();
});
