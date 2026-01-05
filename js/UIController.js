/**
 * 🎨 UI Controller
 * Manages all user interface interactions
 */

import { PLANET_DATA } from './data.js';

export class UIController {
    constructor(solarSystem, gestureController, settings) {
        this.solarSystem = solarSystem;
        this.gestureController = gestureController;
        this.settings = settings;
        
        // UI Elements
        this.elements = {};
        
        // State
        this.isPanelOpen = {
            controls: false,
            settings: false,
            planetInfo: false
        };
        
        // Event callbacks
        this.callbacks = {
            settingChanged: []
        };
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initSettings();
    }
    
    cacheElements() {
        this.elements = {
            // Camera info
            rotationValue: document.getElementById('rotation-value'),
            elevationValue: document.getElementById('elevation-value'),
            zoomValue: document.getElementById('zoom-value'),
            followingInfo: document.getElementById('following-info'),
            followingValue: document.getElementById('following-value'),
            
            // Planet info
            planetInfo: document.getElementById('planet-info'),
            planetIcon: document.getElementById('planet-icon'),
            planetName: document.getElementById('planet-name'),
            planetType: document.getElementById('planet-type'),
            planetDistance: document.getElementById('planet-distance'),
            planetPeriod: document.getElementById('planet-period'),
            planetDiameter: document.getElementById('planet-diameter'),
            planetMoons: document.getElementById('planet-moons'),
            planetDescription: document.getElementById('planet-description'),
            planetFunfact: document.getElementById('planet-funfact'),
            closePlanetInfo: document.getElementById('close-planet-info'),
            
            // Panels
            controlsGuide: document.getElementById('controls-guide'),
            settingsPanel: document.getElementById('settings-panel'),
            
            // Toolbar buttons
            btnHelp: document.getElementById('btn-help'),
            btnSettings: document.getElementById('btn-settings'),
            btnScreenshot: document.getElementById('btn-screenshot'),
            btnReset: document.getElementById('btn-reset'),
            btnSound: document.getElementById('btn-sound'),
            
            // Planet bar
            planetButtons: document.querySelectorAll('.planet-btn'),
            
            // Settings controls
            showLabels: document.getElementById('show-labels'),
            showOrbits: document.getElementById('show-orbits'),
            showMoons: document.getElementById('show-moons'),
            showAsteroids: document.getElementById('show-asteroids'),
            orbitSpeed: document.getElementById('orbit-speed'),
            realisticScale: document.getElementById('realistic-scale'),
            
            // Audio
            ambientAudio: document.getElementById('ambient-audio')
        };
    }
    
    bindEvents() {
        // Toolbar buttons
        this.elements.btnHelp.addEventListener('click', () => this.togglePanel('controls'));
        this.elements.btnSettings.addEventListener('click', () => this.togglePanel('settings'));
        this.elements.btnScreenshot.addEventListener('click', () => this.takeScreenshot());
        this.elements.btnReset.addEventListener('click', () => this.resetView());
        this.elements.btnSound.addEventListener('click', () => this.toggleSound());
        
        // Close planet info
        this.elements.closePlanetInfo.addEventListener('click', () => this.hidePlanetInfo());
        
        // Planet selection buttons
        this.elements.planetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const planetName = btn.dataset.planet;
                this.gestureController.manualSelectPlanet(planetName);
                this.showPlanetInfo(planetName);
                this.updateActivePlanetButton(planetName);
            });
        });
        
        // Settings checkboxes
        this.elements.showLabels.addEventListener('change', (e) => {
            this.onSettingChanged('showLabels', e.target.checked);
        });
        
        this.elements.showOrbits.addEventListener('change', (e) => {
            this.onSettingChanged('showOrbits', e.target.checked);
        });
        
        this.elements.showMoons.addEventListener('change', (e) => {
            this.onSettingChanged('showMoons', e.target.checked);
        });
        
        this.elements.showAsteroids.addEventListener('change', (e) => {
            this.onSettingChanged('showAsteroids', e.target.checked);
        });
        
        this.elements.orbitSpeed.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value) / 100;
            this.onSettingChanged('orbitSpeed', speed);
        });
        
        this.elements.realisticScale.addEventListener('change', (e) => {
            this.onSettingChanged('realisticScale', e.target.checked);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Mouse/touch fallback controls
        this.initFallbackControls();
    }
    
    initSettings() {
        // Set initial values from settings
        this.elements.showLabels.checked = this.settings.showLabels;
        this.elements.showOrbits.checked = this.settings.showOrbits;
        this.elements.showMoons.checked = this.settings.showMoons;
        this.elements.showAsteroids.checked = this.settings.showAsteroids;
        this.elements.orbitSpeed.value = this.settings.orbitSpeed * 100;
    }
    
    initFallbackControls() {
        const canvas = this.solarSystem.renderer.domElement;
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = (e.clientX - lastX) * 0.01;
            const deltaY = (e.clientY - lastY) * 0.01;
            
            this.gestureController.manualRotate(deltaX, deltaY);
            
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * 0.05;
            this.gestureController.manualZoom(delta);
        });
        
        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartDistance = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                touchStartDistance = this.getTouchDistance(e.touches);
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1) {
                const deltaX = (e.touches[0].clientX - touchStartX) * 0.01;
                const deltaY = (e.touches[0].clientY - touchStartY) * 0.01;
                
                this.gestureController.manualRotate(deltaX, deltaY);
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const distance = this.getTouchDistance(e.touches);
                const delta = (touchStartDistance - distance) * 0.5;
                this.gestureController.manualZoom(delta);
                touchStartDistance = distance;
            }
        });
    }
    
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    handleKeyboard(e) {
        switch (e.key) {
            case 'Escape':
                this.closeAllPanels();
                break;
            case 'h':
            case 'H':
                this.togglePanel('controls');
                break;
            case 's':
            case 'S':
                if (!e.ctrlKey) this.togglePanel('settings');
                break;
            case 'r':
            case 'R':
                this.resetView();
                break;
            case 'm':
            case 'M':
                this.toggleSound();
                break;
            case ' ':
                e.preventDefault();
                this.resetView();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                const planetNames = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
                const index = parseInt(e.key) - 1;
                if (index < planetNames.length) {
                    this.gestureController.manualSelectPlanet(planetNames[index]);
                    this.showPlanetInfo(planetNames[index]);
                }
                break;
        }
    }
    
    togglePanel(panelName) {
        const panelMap = {
            controls: 'controlsGuide',
            settings: 'settingsPanel'
        };
        
        const panelElement = this.elements[panelMap[panelName]];
        const btnElement = this.elements[`btn${panelName.charAt(0).toUpperCase() + panelName.slice(1)}`] ||
                          this.elements.btnHelp;
        
        if (this.isPanelOpen[panelName]) {
            panelElement.classList.add('hidden');
            btnElement.classList.remove('active');
        } else {
            // Close other panels first
            this.closeAllPanels();
            panelElement.classList.remove('hidden');
            btnElement.classList.add('active');
        }
        
        this.isPanelOpen[panelName] = !this.isPanelOpen[panelName];
    }
    
    closeAllPanels() {
        this.elements.controlsGuide.classList.add('hidden');
        this.elements.settingsPanel.classList.add('hidden');
        this.elements.btnHelp.classList.remove('active');
        this.elements.btnSettings.classList.remove('active');
        
        this.isPanelOpen.controls = false;
        this.isPanelOpen.settings = false;
    }
    
    showPlanetInfo(planetName) {
        const data = PLANET_DATA[planetName];
        if (!data) return;
        
        this.elements.planetIcon.textContent = data.icon;
        this.elements.planetName.textContent = data.name;
        this.elements.planetType.textContent = data.type;
        this.elements.planetDistance.textContent = data.distanceFromSun;
        this.elements.planetPeriod.textContent = data.orbitalPeriod;
        this.elements.planetDiameter.textContent = data.diameter;
        this.elements.planetMoons.textContent = data.moonCount;
        this.elements.planetDescription.textContent = data.description;
        this.elements.planetFunfact.textContent = data.funFact;
        
        this.elements.planetInfo.classList.remove('hidden');
        this.isPanelOpen.planetInfo = true;
        
        this.updateActivePlanetButton(planetName);
    }
    
    hidePlanetInfo() {
        this.elements.planetInfo.classList.add('hidden');
        this.isPanelOpen.planetInfo = false;
        this.updateActivePlanetButton(null);
    }
    
    updateActivePlanetButton(planetName) {
        this.elements.planetButtons.forEach(btn => {
            if (btn.dataset.planet === planetName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    updateFollowingStatus(planetName) {
        if (planetName) {
            this.elements.followingInfo.classList.remove('hidden');
            this.elements.followingValue.textContent = PLANET_DATA[planetName]?.name || planetName;
        } else {
            this.elements.followingInfo.classList.add('hidden');
        }
    }
    
    takeScreenshot() {
        // Get canvas data
        const canvas = this.solarSystem.renderer.domElement;
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `solar-system-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        // Visual feedback
        this.showNotification('📷 Screenshot saved!');
    }
    
    resetView() {
        this.gestureController.manualReset();
        this.hidePlanetInfo();
        this.showNotification('🏠 View reset');
    }
    
    toggleSound() {
        const audio = this.elements.ambientAudio;
        const btn = this.elements.btnSound;
        
        if (audio.paused) {
            audio.volume = 0.3;
            audio.play().then(() => {
                btn.querySelector('span').textContent = '🔊';
                this.settings.soundEnabled = true;
            }).catch(() => {
                this.showNotification('🔇 Could not play audio');
            });
        } else {
            audio.pause();
            btn.querySelector('span').textContent = '🔇';
            this.settings.soundEnabled = false;
        }
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.75rem 1.5rem;
            background: rgba(0, 18, 51, 0.9);
            border: 1px solid rgba(0, 245, 255, 0.3);
            border-radius: 50px;
            color: white;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    onSettingChanged(setting, value) {
        this.settings[setting] = value;
        this.emit('settingChanged', setting, value);
    }
    
    update() {
        // Update camera info display
        const cameraInfo = this.solarSystem.getCameraInfo();
        
        this.elements.rotationValue.textContent = `${cameraInfo.rotation}°`;
        this.elements.elevationValue.textContent = `${cameraInfo.elevation}°`;
        this.elements.zoomValue.textContent = `${cameraInfo.zoom}%`;
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
    
    emit(event, ...data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...data));
        }
    }
}
