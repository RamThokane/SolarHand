/**
 * 🌌 Solar System - Three.js Scene
 * Handles all 3D rendering and planet animations
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { PLANET_DATA } from './data.js';

export class SolarSystem {
    constructor(container, settings) {
        this.container = container;
        this.settings = settings;
        
        // Three.js core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        
        // Camera control
        this.cameraOrbit = {
            radius: 80,
            theta: 0,        // Horizontal angle
            phi: Math.PI / 6, // Vertical angle (30 degrees)
            targetRadius: 80,
            targetTheta: 0,
            targetPhi: Math.PI / 6
        };
        
        // Solar system objects
        this.sun = null;
        this.planets = {};
        this.moons = {};
        this.orbits = {};
        this.labels = {};
        this.asteroidBelt = null;
        this.starfield = null;
        
        // Animation state
        this.clock = new THREE.Clock();
        this.time = 0;
        
        // Following
        this.followingPlanet = null;
        this.followOffset = new THREE.Vector3();
        
        // Selection
        this.selectedPlanet = null;
        this.hoveredPlanet = null;
        this.raycaster = new THREE.Raycaster();
    }
    
    async init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLighting();
        this.setupPostProcessing();
        this.createStarfield();
        this.createSun();
        this.createPlanets();
        this.createAsteroidBelt();
        this.createOrbits();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000814);
    }
    
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
        this.updateCameraPosition();
    }
    
    updateCameraPosition() {
        const { radius, theta, phi } = this.cameraOrbit;
        
        // Spherical to Cartesian coordinates
        this.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        this.camera.position.y = radius * Math.cos(phi);
        this.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Look at center or following planet
        if (this.followingPlanet && this.planets[this.followingPlanet]) {
            const planet = this.planets[this.followingPlanet];
            this.camera.lookAt(planet.mesh.position);
        } else {
            this.camera.lookAt(0, 0, 0);
        }
    }
    
    setupLighting() {
        // Ambient light for base visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Point light at sun position
        const sunLight = new THREE.PointLight(0xffffff, 2, 500);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        this.scene.add(sunLight);
        
        // Hemisphere light for subtle fill
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
        this.scene.add(hemiLight);
    }
    
    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom for glow effects
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random position in sphere
            const radius = 500 + Math.random() * 1500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Star colors (white, blue-ish, yellow-ish)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors[i3] = 1;
                colors[i3 + 1] = 1;
                colors[i3 + 2] = 1;
            } else if (colorChoice < 0.85) {
                colors[i3] = 0.8;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 1;
            } else {
                colors[i3] = 1;
                colors[i3 + 1] = 0.95;
                colors[i3 + 2] = 0.8;
            }
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }
    
    createSun() {
        // Sun geometry
        const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
        
        // Sun material with glow
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            emissive: 0xffaa00,
            emissiveIntensity: 1
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // Sun glow (corona effect)
        const glowGeometry = new THREE.SphereGeometry(6, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    vec3 color = vec3(1.0, 0.6, 0.1);
                    gl_FragColor = vec4(color, intensity * 0.6);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGlow.scale.setScalar(1.5);
        this.sun.add(sunGlow);
        this.sun.glowMaterial = glowMaterial;
        
        // Animated solar flares
        this.createSolarFlares();
    }
    
    createSolarFlares() {
        const flareCount = 50;
        const flareGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(flareCount * 3);
        const sizes = new Float32Array(flareCount);
        
        for (let i = 0; i < flareCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 5.5 + Math.random() * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            sizes[i] = Math.random() * 0.5 + 0.2;
        }
        
        flareGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        flareGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const flareMaterial = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.5,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.solarFlares = new THREE.Points(flareGeometry, flareMaterial);
        this.sun.add(this.solarFlares);
    }
    
    createPlanets() {
        Object.entries(PLANET_DATA).forEach(([name, data]) => {
            const planet = this.createPlanet(name, data);
            this.planets[name] = planet;
            
            // Create moons if any
            if (data.moons && this.settings.showMoons) {
                data.moons.forEach((moonData, index) => {
                    const moon = this.createMoon(planet, moonData, index);
                    if (!this.moons[name]) this.moons[name] = [];
                    this.moons[name].push(moon);
                });
            }
        });
    }
    
    createPlanet(name, data) {
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        
        // Create material based on planet
        let material;
        
        if (name === 'earth') {
            material = this.createEarthMaterial(data);
        } else if (name === 'saturn') {
            material = this.createPlanetMaterial(data);
        } else {
            material = this.createPlanetMaterial(data);
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Create planet container for orbit
        const container = new THREE.Object3D();
        container.add(mesh);
        
        // Initial position
        const angle = Math.random() * Math.PI * 2;
        mesh.position.x = Math.cos(angle) * data.distance;
        mesh.position.z = Math.sin(angle) * data.distance;
        
        // Axial tilt
        mesh.rotation.z = (data.tilt || 0) * Math.PI / 180;
        
        this.scene.add(container);
        
        // Saturn's rings
        if (name === 'saturn') {
            this.createSaturnRings(mesh, data);
        }
        
        // Create label
        if (this.settings.showLabels) {
            const label = this.createLabel(name, mesh);
            this.labels[name] = label;
        }
        
        return {
            mesh,
            container,
            data,
            angle,
            orbitSpeed: data.orbitSpeed
        };
    }
    
    createPlanetMaterial(data) {
        // Procedural planet material
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create gradient based on planet color
        const color = new THREE.Color(data.color);
        const hsl = {};
        color.getHSL(hsl);
        
        // Base color
        ctx.fillStyle = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
        ctx.fillRect(0, 0, 512, 256);
        
        // Add some noise/texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const lightness = hsl.l + (Math.random() - 0.5) * 0.2;
            ctx.fillStyle = `hsla(${hsl.h * 360}, ${hsl.s * 100}%, ${lightness * 100}%, 0.5)`;
            ctx.fillRect(x, y, 3, 2);
        }
        
        // Add bands for gas giants
        if (data.hasAtmosphere) {
            for (let i = 0; i < 10; i++) {
                const y = (i / 10) * 256;
                const bandLightness = hsl.l + (Math.random() - 0.5) * 0.15;
                ctx.fillStyle = `hsla(${hsl.h * 360}, ${hsl.s * 80}%, ${bandLightness * 100}%, 0.3)`;
                ctx.fillRect(0, y, 512, 25);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });
    }
    
    createEarthMaterial(data) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Ocean base
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(0, 0, 1024, 512);
        
        // Simple continent shapes
        ctx.fillStyle = '#27ae60';
        
        // North America
        ctx.beginPath();
        ctx.ellipse(200, 150, 80, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // South America
        ctx.beginPath();
        ctx.ellipse(280, 300, 40, 70, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Europe/Africa
        ctx.beginPath();
        ctx.ellipse(520, 180, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(530, 280, 45, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Asia
        ctx.beginPath();
        ctx.ellipse(700, 150, 100, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Australia
        ctx.beginPath();
        ctx.ellipse(820, 320, 40, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.ellipse(x, y, 30 + Math.random() * 40, 15 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        
        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.1
        });
    }
    
    createSaturnRings(planet, data) {
        const innerRadius = data.size * 1.4;
        const outerRadius = data.size * 2.4;
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
        
        // Create ring texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Ring bands
        const gradient = ctx.createLinearGradient(0, 0, 512, 0);
        gradient.addColorStop(0, 'rgba(210, 180, 140, 0.0)');
        gradient.addColorStop(0.1, 'rgba(210, 180, 140, 0.8)');
        gradient.addColorStop(0.2, 'rgba(180, 150, 100, 0.3)');
        gradient.addColorStop(0.3, 'rgba(210, 180, 140, 0.9)');
        gradient.addColorStop(0.5, 'rgba(160, 130, 90, 0.2)');
        gradient.addColorStop(0.6, 'rgba(200, 170, 130, 0.7)');
        gradient.addColorStop(0.8, 'rgba(180, 150, 110, 0.5)');
        gradient.addColorStop(1, 'rgba(210, 180, 140, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 64);
        
        const ringTexture = new THREE.CanvasTexture(canvas);
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.rotation.y = 0.4; // Slight tilt
        planet.add(rings);
    }
    
    createMoon(planet, moonData, index) {
        const geometry = new THREE.SphereGeometry(moonData.size || 0.3, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: moonData.color || 0xaaaaaa,
            roughness: 0.9
        });
        
        const moon = new THREE.Mesh(geometry, material);
        
        // Moon orbit container
        const moonOrbit = new THREE.Object3D();
        moonOrbit.add(moon);
        planet.mesh.add(moonOrbit);
        
        // Initial moon position
        const distance = moonData.distance || (planet.data.size * 2 + index * 0.5);
        moon.position.x = distance;
        
        return {
            mesh: moon,
            orbit: moonOrbit,
            distance,
            speed: moonData.orbitSpeed || 2,
            angle: Math.random() * Math.PI * 2
        };
    }
    
    createLabel(name, planet) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(4, 1, 1);
        planet.add(sprite);
        sprite.position.y = PLANET_DATA[name].size + 1.5;
        
        return sprite;
    }
    
    createOrbits() {
        Object.entries(PLANET_DATA).forEach(([name, data]) => {
            const orbitGeometry = new THREE.BufferGeometry();
            const segments = 128;
            const positions = new Float32Array(segments * 3);
            
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                positions[i * 3] = Math.cos(angle) * data.distance;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = Math.sin(angle) * data.distance;
            }
            
            orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const orbitMaterial = new THREE.LineBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.2
            });
            
            const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
            orbit.visible = this.settings.showOrbits;
            this.scene.add(orbit);
            this.orbits[name] = orbit;
        });
    }
    
    createAsteroidBelt() {
        const asteroidCount = 2000;
        const asteroidGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);
        const sizes = new Float32Array(asteroidCount);
        
        const minRadius = PLANET_DATA.mars.distance + 3;
        const maxRadius = PLANET_DATA.jupiter.distance - 5;
        
        for (let i = 0; i < asteroidCount; i++) {
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 2;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            sizes[i] = Math.random() * 0.15 + 0.05;
        }
        
        asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const asteroidMaterial = new THREE.PointsMaterial({
            color: 0x888888,
            size: 0.1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6
        });
        
        this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
        this.asteroidBelt.visible = this.settings.showAsteroids;
        this.scene.add(this.asteroidBelt);
    }
    
    // Camera controls
    setRotation(theta, phi) {
        this.cameraOrbit.targetTheta = theta;
        this.cameraOrbit.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    }
    
    setZoom(radius) {
        this.cameraOrbit.targetRadius = Math.max(20, Math.min(200, radius));
    }
    
    adjustRotation(deltaTheta, deltaPhi) {
        this.cameraOrbit.targetTheta += deltaTheta;
        this.cameraOrbit.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraOrbit.targetPhi + deltaPhi));
    }
    
    adjustZoom(delta) {
        this.cameraOrbit.targetRadius = Math.max(20, Math.min(200, this.cameraOrbit.targetRadius + delta));
    }
    
    followPlanet(planetName) {
        if (this.planets[planetName]) {
            this.followingPlanet = planetName;
            this.cameraOrbit.targetRadius = this.planets[planetName].data.size * 8;
        }
    }
    
    stopFollowing() {
        this.followingPlanet = null;
        this.cameraOrbit.targetRadius = 80;
    }
    
    resetView() {
        this.cameraOrbit.targetTheta = 0;
        this.cameraOrbit.targetPhi = Math.PI / 6;
        this.cameraOrbit.targetRadius = 80;
        this.followingPlanet = null;
    }
    
    focusOnPlanet(planetName) {
        if (this.planets[planetName]) {
            const planet = this.planets[planetName];
            const pos = planet.mesh.position;
            
            // Calculate angle to planet
            this.cameraOrbit.targetTheta = Math.atan2(pos.z, pos.x);
            this.cameraOrbit.targetRadius = planet.data.distance + planet.data.size * 5;
        }
    }
    
    // Raycasting for planet selection
    getPlanetAtScreenPosition(x, y) {
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );
        
        this.raycaster.setFromCamera(mouse, this.camera);
        
        const planetMeshes = Object.entries(this.planets).map(([name, p]) => {
            p.mesh.userData.planetName = name;
            return p.mesh;
        });
        
        const intersects = this.raycaster.intersectObjects(planetMeshes);
        
        if (intersects.length > 0) {
            return intersects[0].object.userData.planetName;
        }
        
        // Also check sun
        const sunIntersect = this.raycaster.intersectObject(this.sun);
        if (sunIntersect.length > 0) {
            return 'sun';
        }
        
        return null;
    }
    
    highlightPlanet(planetName) {
        // Remove previous highlight
        if (this.hoveredPlanet && this.planets[this.hoveredPlanet]) {
            this.planets[this.hoveredPlanet].mesh.scale.setScalar(1);
        }
        
        // Add new highlight
        if (planetName && this.planets[planetName]) {
            this.planets[planetName].mesh.scale.setScalar(1.2);
            this.hoveredPlanet = planetName;
        } else {
            this.hoveredPlanet = null;
        }
    }
    
    selectPlanet(planetName) {
        this.selectedPlanet = planetName;
        this.highlightPlanet(planetName);
    }
    
    // Settings updates
    updateSetting(setting, value) {
        this.settings[setting] = value;
        
        switch (setting) {
            case 'showLabels':
                Object.values(this.labels).forEach(label => {
                    label.visible = value;
                });
                break;
            case 'showOrbits':
                Object.values(this.orbits).forEach(orbit => {
                    orbit.visible = value;
                });
                break;
            case 'showMoons':
                Object.values(this.moons).forEach(moons => {
                    moons.forEach(moon => {
                        moon.mesh.visible = value;
                    });
                });
                break;
            case 'showAsteroids':
                if (this.asteroidBelt) {
                    this.asteroidBelt.visible = value;
                }
                break;
            case 'orbitSpeed':
                // Handled in update loop
                break;
        }
    }
    
    // Update loop
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;
        
        // Smooth camera interpolation
        const smoothing = 0.05;
        this.cameraOrbit.theta += (this.cameraOrbit.targetTheta - this.cameraOrbit.theta) * smoothing;
        this.cameraOrbit.phi += (this.cameraOrbit.targetPhi - this.cameraOrbit.phi) * smoothing;
        this.cameraOrbit.radius += (this.cameraOrbit.targetRadius - this.cameraOrbit.radius) * smoothing;
        
        // Update camera position
        if (this.followingPlanet && this.planets[this.followingPlanet]) {
            const planet = this.planets[this.followingPlanet];
            const pos = planet.mesh.position.clone();
            
            this.camera.position.x = pos.x + this.cameraOrbit.radius * Math.sin(this.cameraOrbit.phi) * Math.cos(this.cameraOrbit.theta);
            this.camera.position.y = pos.y + this.cameraOrbit.radius * Math.cos(this.cameraOrbit.phi);
            this.camera.position.z = pos.z + this.cameraOrbit.radius * Math.sin(this.cameraOrbit.phi) * Math.sin(this.cameraOrbit.theta);
            
            this.camera.lookAt(pos);
        } else {
            this.updateCameraPosition();
        }
        
        // Sun animation
        this.sun.rotation.y += 0.001;
        if (this.sun.glowMaterial) {
            this.sun.glowMaterial.uniforms.time.value = this.time;
        }
        if (this.solarFlares) {
            this.solarFlares.rotation.y += 0.002;
        }
        
        // Planet orbits
        const speedMultiplier = this.settings.orbitSpeed;
        Object.entries(this.planets).forEach(([name, planet]) => {
            planet.angle += planet.orbitSpeed * delta * speedMultiplier * 0.1;
            
            planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;
            
            // Planet rotation
            planet.mesh.rotation.y += delta * 0.5;
        });
        
        // Moon orbits
        Object.entries(this.moons).forEach(([planetName, moons]) => {
            moons.forEach(moon => {
                moon.angle += moon.speed * delta * speedMultiplier;
                moon.orbit.rotation.y = moon.angle;
            });
        });
        
        // Asteroid belt rotation
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += delta * 0.02 * speedMultiplier;
        }
        
        // Starfield parallax
        if (this.starfield) {
            this.starfield.rotation.y += delta * 0.005;
        }
        
        // Render
        this.composer.render();
    }
    
    // Get current camera info
    getCameraInfo() {
        return {
            rotation: Math.round((this.cameraOrbit.theta * 180 / Math.PI) % 360),
            elevation: Math.round((90 - this.cameraOrbit.phi * 180 / Math.PI)),
            zoom: Math.round((1 - (this.cameraOrbit.radius - 20) / 180) * 100)
        };
    }
    
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }
}
