// Solar System Simulation
class SolarSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight - 200; // Account for header
        
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        this.isPlaying = true;
        this.speed = 1;
        this.gravity = 0.62;
        this.physicsMode = 'n-body'; // 'n-body' or 'simplified'
        this.collisionMode = 'off'; // 'off', 'merge', 'elastic', 'inelastic'
        this.collisionsEnabled = false;
        this.collisionCooldown = new Set(); // Track bodies that just collided to prevent re-collision
        this.showAccelerationVectors = false; // Changed from force to acceleration
        this.vectorScale = 1.0;
        this.showVectorsForSelectedOnly = false;
        
        // Initialize stars (generate once to prevent flickering)
        this.stars = [];
        this.generateStars();
        
        // Initialize celestial bodies
        this.bodies = this.createBodies();
        
        // Property editor state
        this.selectedBody = null;
        this.showEditor = false;
        this.justFinishedDrag = false; // Track if we just finished dragging to prevent click from closing editor
        this.showMoonConnections = false; // Toggle for showing moon connection lines
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation
        this.animate();
    }
    
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * this.width * 2,
                y: (Math.random() - 0.5) * this.height * 2,
                size: Math.random() * 2
            });
        }
    }
    
    createBodies() {
        const bodies = [
            // Sun
            {
                name: 'Sun',
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                mass: 1000,
                radius: 20,
                color: '#FFD700',
                trail: [],
                maxTrailLength: 100,
                isStar: true,
                isMoon: false,
                parent: null
            },
            // Mercury
            {
                name: 'Mercury',
                x: 100,
                y: 0,
                vx: 0,
                vy: 2.5,
                mass: 1,
                radius: 4,
                color: '#8C7853',
                trail: [],
                maxTrailLength: 50,
                orbitRadius: 100,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Mercury
            {
                name: 'Mercury',
                x: 100,
                y: 0,
                vx: 0,
                vy: 2.5,
                mass: 1,
                radius: 4,
                color: '#8C7853',
                trail: [],
                maxTrailLength: 50,
                orbitRadius: 100,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Venus
            {
                name: 'Venus',
                x: 150,
                y: 0,
                vx: 0,
                vy: 2.0,
                mass: 2,
                radius: 6,
                color: '#FFC649',
                trail: [],
                maxTrailLength: 60,
                orbitRadius: 150,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Earth
            {
                name: 'Earth',
                x: 200,
                y: 0,
                vx: 0,
                vy: 1.8,
                mass: 2.5,
                radius: 7,
                color: '#4A90E2',
                trail: [],
                maxTrailLength: 80,
                orbitRadius: 200,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Mars
            {
                name: 'Mars',
                x: 280,
                y: 0,
                vx: 0,
                vy: 1.5,
                mass: 1.5,
                radius: 5,
                color: '#CD5C5C',
                trail: [],
                maxTrailLength: 70,
                orbitRadius: 280,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Jupiter
            {
                name: 'Jupiter',
                x: 400,
                y: 0,
                vx: 0,
                vy: 1.2,
                mass: 50,
                radius: 15,
                color: '#D8CA9D',
                trail: [],
                maxTrailLength: 100,
                orbitRadius: 400,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Saturn
            {
                name: 'Saturn',
                x: 550,
                y: 0,
                vx: 0,
                vy: 1.0,
                mass: 40,
                radius: 13,
                color: '#FAD5A5',
                trail: [],
                maxTrailLength: 120,
                orbitRadius: 550,
                hasRings: true,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Uranus
            {
                name: 'Uranus',
                x: 700,
                y: 0,
                vx: 0,
                vy: 0.8,
                mass: 15,
                radius: 10,
                color: '#4FD0E7',
                trail: [],
                maxTrailLength: 100,
                orbitRadius: 700,
                isStar: false,
                isMoon: false,
                parent: null
            },
            // Neptune
            {
                name: 'Neptune',
                x: 850,
                y: 0,
                vx: 0,
                vy: 0.7,
                mass: 15,
                radius: 9,
                color: '#4166F5',
                trail: [],
                maxTrailLength: 100,
                orbitRadius: 850,
                isStar: false,
                isMoon: false,
                parent: null
            }
        ];
        
        return bodies;
    }
    
    setupEventListeners() {
        // Play/Pause button
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            playPauseBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            speedValue.textContent = this.speed.toFixed(1) + 'x';
        });
        
        // Zoom slider
        const zoomSlider = document.getElementById('zoomSlider');
        const zoomValue = document.getElementById('zoomValue');
        zoomSlider.addEventListener('input', (e) => {
            this.scale = parseFloat(e.target.value);
            zoomValue.textContent = this.scale.toFixed(1) + 'x';
        });
        
        // Gravity slider
        const gravitySlider = document.getElementById('gravitySlider');
        const gravityValue = document.getElementById('gravityValue');
        gravitySlider.addEventListener('input', (e) => {
            this.gravity = parseFloat(e.target.value);
            gravityValue.textContent = this.gravity.toFixed(2);
        });
        
        // Physics mode selector
        const physicsModeSelect = document.getElementById('physicsModeSelect');
        physicsModeSelect.addEventListener('change', (e) => {
            this.physicsMode = e.target.value;
        });
        
        // Collision mode selector
        const collisionModeSelect = document.getElementById('collisionModeSelect');
        collisionModeSelect.addEventListener('change', (e) => {
            this.collisionMode = e.target.value;
            this.collisionsEnabled = (e.target.value !== 'off');
        });
        
        // Moon connections toggle
        const showMoonConnections = document.getElementById('showMoonConnections');
        showMoonConnections.addEventListener('change', (e) => {
            this.showMoonConnections = e.target.checked;
        });
        
        // Add Star button
        const addStarBtn = document.getElementById('addStarBtn');
        addStarBtn.addEventListener('click', () => {
            this.addStar();
        });
        
        // Vector visualization toggles
        const showAccelerationVectors = document.getElementById('showAccelerationVectors');
        showAccelerationVectors.addEventListener('change', (e) => {
            this.showAccelerationVectors = e.target.checked;
        });
        
        const vectorScaleSlider = document.getElementById('vectorScaleSlider');
        const vectorScaleValue = document.getElementById('vectorScaleValue');
        vectorScaleSlider.addEventListener('input', (e) => {
            this.vectorScale = parseFloat(e.target.value);
            vectorScaleValue.textContent = this.vectorScale.toFixed(1) + 'x';
        });
        
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        // Reset Settings button
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        resetSettingsBtn.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Canvas drag and click
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Check if clicking on a body
            const clickedBody = this.getBodyAtScreenPosition(clickX, clickY);
            if (clickedBody) {
                const screenX = e.clientX;
                const screenY = e.clientY;
                this.showPropertyEditor(clickedBody, screenX, screenY);
                return;
            }
            
            // If clicking elsewhere and editor is open, close it
            if (this.showEditor) {
                this.closePropertyEditor();
            }
            
            this.isDragging = true;
            this.dragStartX = e.clientX - this.offsetX;
            this.dragStartY = e.clientY - this.offsetY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.offsetX = e.clientX - this.dragStartX;
                this.offsetY = e.clientY - this.dragStartY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight - 200;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;
            // Regenerate stars for new canvas size
            this.generateStars();
        });
        
        // Property editor event listeners
        const editorCloseBtn = document.getElementById('editorCloseBtn');
        editorCloseBtn.addEventListener('click', () => {
            this.closePropertyEditor();
        });
        
        const editorForm = document.getElementById('propertyEditorForm');
        editorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBodyProperties();
        });
        
        // Create Moon button
        const createMoonBtn = document.getElementById('createMoonBtn');
        createMoonBtn.addEventListener('click', () => {
            if (this.selectedBody && !this.selectedBody.isMoon) {
                this.createMoon(this.selectedBody);
            }
        });
        
        // Delete Body button
        const deleteBodyBtn = document.getElementById('deleteBodyBtn');
        deleteBodyBtn.addEventListener('click', () => {
            if (this.selectedBody) {
                this.deleteBody(this.selectedBody);
            }
        });
        
        // Prevent clicks inside editor from closing it
        const propertyEditor = document.getElementById('propertyEditor');
        propertyEditor.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Drag-to-adjust for number inputs
        this.setupDragToAdjust();
        
        // Close editor when clicking outside (on document/body, but not canvas)
        document.addEventListener('click', (e) => {
            if (!this.showEditor) return;
            
            // Don't close if we just finished dragging
            if (this.justFinishedDrag) {
                this.justFinishedDrag = false;
                return;
            }
            
            const propertyEditor = document.getElementById('propertyEditor');
            const clickedElement = e.target;
            
            // Don't close if clicking inside editor
            if (propertyEditor && propertyEditor.contains(clickedElement)) {
                return;
            }
            
            // Don't close if clicking on canvas (canvas handler manages this)
            if (clickedElement === this.canvas || this.canvas.contains(clickedElement)) {
                return;
            }
            
            // Close for all other clicks (body, header, etc.)
            this.closePropertyEditor();
        });
    }
    
    setupDragToAdjust() {
        // Define sensitivity for each input (value change per 10px drag)
        const sensitivities = {
            'editorMass': 1,
            'editorVx': 0.01,
            'editorVy': 0.01,
            'editorX': 0.1,
            'editorY': 0.1,
            'editorRadius': 0.5
        };
        
        let dragState = {
            active: false,
            input: null,
            startX: 0,
            startValue: 0,
            sensitivity: 0,
            lastX: 0
        };
        
        // Get all number inputs
        const numberInputs = ['editorMass', 'editorVx', 'editorVy', 'editorX', 'editorY', 'editorRadius'];
        
        numberInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            input.addEventListener('mousedown', (e) => {
                // Only start drag on left mouse button
                if (e.button !== 0) return;
                
                // Prevent default to avoid text selection
                e.preventDefault();
                
                dragState.active = true;
                dragState.input = input;
                dragState.startX = e.clientX;
                dragState.lastX = e.clientX;
                dragState.startValue = parseFloat(input.value) || 0;
                dragState.sensitivity = sensitivities[inputId] || 0.1;
                
                // Change cursor and prevent text selection
                input.style.cursor = 'ew-resize';
                input.style.userSelect = 'none';
                document.body.style.userSelect = 'none'; // Prevent selection on entire page
                input.blur(); // Remove focus to prevent keyboard input during drag
            });
        });
        
        // Global mouse move handler - tracks movement across entire document
        const handleMouseMove = (e) => {
            if (!dragState.active || !dragState.input) return;
            
            // Calculate delta from last position (allows continuous tracking)
            const deltaX = e.clientX - dragState.lastX;
            dragState.lastX = e.clientX;
            
            // If mouse goes outside window, we'll lose tracking, but that's acceptable
            // The user can move mouse back and continue dragging
            
            const deltaValue = (deltaX / 10) * dragState.sensitivity;
            const currentValue = parseFloat(dragState.input.value) || dragState.startValue;
            const newValue = currentValue + deltaValue;
            
            // Get min/max constraints from input
            const min = parseFloat(dragState.input.min) || -Infinity;
            const max = parseFloat(dragState.input.max) || Infinity;
            const step = parseFloat(dragState.input.step) || 1;
            
            // Clamp and round to step
            let clampedValue = Math.max(min, Math.min(max, newValue));
            clampedValue = Math.round(clampedValue / step) * step;
            
            // Update input value
            dragState.input.value = clampedValue;
            
            // Apply changes immediately
            if (this.selectedBody) {
                this.updateBodyProperties();
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        
        // Global mouse up handler
        const handleMouseUp = () => {
            if (dragState.active && dragState.input) {
                dragState.input.style.cursor = '';
                dragState.input.style.userSelect = '';
                document.body.style.userSelect = ''; // Restore selection
                
                // Mark that we just finished dragging to prevent click from closing editor
                this.justFinishedDrag = true;
            }
            dragState.active = false;
            dragState.input = null;
        };
        
        document.addEventListener('mouseup', handleMouseUp);
        
        // Handle mouse leaving window - update lastX to current position to prevent jumps
        document.addEventListener('mouseleave', (e) => {
            if (dragState.active) {
                dragState.lastX = e.clientX;
            }
        });
    }
    
    getBodyAtScreenPosition(screenX, screenY) {
        // Convert screen coordinates to world coordinates
        const worldX = (screenX - this.centerX - this.offsetX) / this.scale;
        const worldY = (screenY - this.centerY - this.offsetY) / this.scale;
        
        // Check each body (reverse order to check front bodies first)
        for (let i = this.bodies.length - 1; i >= 0; i--) {
            const body = this.bodies[i];
            const dx = worldX - body.x;
            const dy = worldY - body.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= body.radius + 5) { // Add 5px padding for easier clicking
                return body;
            }
        }
        return null;
    }
    
    showPropertyEditor(body, screenX, screenY) {
        this.selectedBody = body;
        this.showEditor = true;
        
        const editor = document.getElementById('propertyEditor');
        editor.style.display = 'block';
        
        // Position panel near clicked body, but keep it on screen
        const panelWidth = 300;
        const panelHeight = 400;
        let x = screenX + 20;
        let y = screenY - panelHeight / 2;
        
        // Keep panel on screen
        if (x + panelWidth > window.innerWidth) {
            x = screenX - panelWidth - 20;
        }
        if (y < 0) {
            y = 10;
        }
        if (y + panelHeight > window.innerHeight) {
            y = window.innerHeight - panelHeight - 10;
        }
        
        editor.style.left = x + 'px';
        editor.style.top = y + 'px';
        
        // Populate form with current values
        document.getElementById('editorName').textContent = body.name;
        document.getElementById('editorMass').value = body.mass;
        document.getElementById('editorVx').value = body.vx.toFixed(3);
        document.getElementById('editorVy').value = body.vy.toFixed(3);
        document.getElementById('editorX').value = body.x.toFixed(2);
        document.getElementById('editorY').value = body.y.toFixed(2);
        document.getElementById('editorRadius').value = body.radius;
        document.getElementById('editorColor').value = body.color;
        
        // Show/hide create moon button based on whether body is a moon
        const createMoonBtn = document.getElementById('createMoonBtn');
        if (body.isMoon) {
            createMoonBtn.style.display = 'none';
        } else {
            createMoonBtn.style.display = 'block';
        }
    }
    
    addStar() {
        // Create a new star at a random position away from center
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        const starX = Math.cos(angle) * distance;
        const starY = Math.sin(angle) * distance;
        
        // Give it some initial velocity for orbital motion
        const orbitalSpeed = Math.sqrt((this.gravity * this.bodies[0].mass) / distance) * 0.6;
        const starVx = -Math.sin(angle) * orbitalSpeed;
        const starVy = Math.cos(angle) * orbitalSpeed;
        
        // Create star with high mass
        const star = {
            name: `Star ${this.bodies.filter(b => b.isStar).length + 1}`,
            x: starX,
            y: starY,
            vx: starVx,
            vy: starVy,
            mass: 500 + Math.random() * 500, // High mass between 500-1000
            radius: 15 + Math.random() * 10,
            color: '#FFD700', // Gold color, can be customized
            trail: [],
            maxTrailLength: 100,
            isStar: true,
            isMoon: false,
            parent: null,
            forceVector: { fx: 0, fy: 0 },
            velocityVector: { vx: starVx, vy: starVy }
        };
        
        this.bodies.push(star);
    }
    
    addPlanet() {
        // Create a new planet at a random position away from center
        const angle = Math.random() * Math.PI * 2;
        const distance = 250 + Math.random() * 400;
        const planetX = Math.cos(angle) * distance;
        const planetY = Math.sin(angle) * distance;
        
        // Calculate orbital velocity
        const orbitalSpeed = Math.sqrt((this.gravity * this.bodies[0].mass) / distance) * 0.8;
        const planetVx = -Math.sin(angle) * orbitalSpeed;
        const planetVy = Math.cos(angle) * orbitalSpeed;
        
        // Random planet properties
        const colors = ['#4A90E2', '#CD5C5C', '#8C7853', '#FFC649', '#4FD0E7', '#4166F5'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const planet = {
            name: `Planet ${this.bodies.filter(b => !b.isStar && !b.isMoon).length + 1}`,
            x: planetX,
            y: planetY,
            vx: planetVx,
            vy: planetVy,
            mass: 1 + Math.random() * 10,
            radius: 4 + Math.random() * 8,
            color: color,
            trail: [],
            maxTrailLength: 80,
            orbitRadius: distance,
            isStar: false,
            isMoon: false,
            parent: null,
            forceVector: { fx: 0, fy: 0 },
            velocityVector: { vx: planetVx, vy: planetVy }
        };
        
        this.bodies.push(planet);
    }
    
    deleteBody(body) {
        // Find and remove the body
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            // Also remove any moons that belong to this body
            const moonsToRemove = this.bodies.filter(b => b.parent === body);
            moonsToRemove.forEach(moon => {
                const moonIndex = this.bodies.indexOf(moon);
                if (moonIndex !== -1) {
                    this.bodies.splice(moonIndex, 1);
                }
            });
            
            // Remove the body itself
            this.bodies.splice(index, 1);
            
            // Close editor if the deleted body was selected
            if (this.selectedBody === body) {
                this.closePropertyEditor();
            }
        }
    }
    
    createMoon(parentBody) {
        // Calculate moon position (offset from parent)
        const moonDistance = parentBody.radius * 3;
        const angle = Math.random() * Math.PI * 2;
        const moonX = parentBody.x + Math.cos(angle) * moonDistance;
        const moonY = parentBody.y + Math.sin(angle) * moonDistance;
        
        // Calculate orbital velocity for stable orbit
        const distance = moonDistance;
        const orbitalSpeed = Math.sqrt((this.gravity * parentBody.mass) / distance) * 0.8;
        const moonVx = parentBody.vx - Math.sin(angle) * orbitalSpeed;
        const moonVy = parentBody.vy + Math.cos(angle) * orbitalSpeed;
        
        // Create moon
        const moon = {
            name: `${parentBody.name} Moon ${this.bodies.filter(b => b.parent === parentBody).length + 1}`,
            x: moonX,
            y: moonY,
            vx: moonVx,
            vy: moonVy,
            mass: parentBody.mass * 0.01, // Moon is 1% of parent mass
            radius: Math.max(2, parentBody.radius * 0.3),
            color: '#888888',
            trail: [],
            maxTrailLength: 30,
            isStar: false,
            isMoon: true,
            parent: parentBody,
            forceVector: { fx: 0, fy: 0 },
            velocityVector: { vx: moonVx, vy: moonVy }
        };
        
        this.bodies.push(moon);
    }
    
    updateBodyProperties() {
        if (!this.selectedBody) return;
        
        const body = this.selectedBody;
        
        // Update properties
        body.mass = parseFloat(document.getElementById('editorMass').value);
        body.vx = parseFloat(document.getElementById('editorVx').value);
        body.vy = parseFloat(document.getElementById('editorVy').value);
        body.x = parseFloat(document.getElementById('editorX').value);
        body.y = parseFloat(document.getElementById('editorY').value);
        body.radius = parseFloat(document.getElementById('editorRadius').value);
        body.color = document.getElementById('editorColor').value;
        
        // Clear trail when properties change
        body.trail = [];
    }
    
    closePropertyEditor() {
        this.showEditor = false;
        this.selectedBody = null;
        const editor = document.getElementById('propertyEditor');
        editor.style.display = 'none';
    }
    
    reset() {
        // Reset bodies and camera position, but preserve settings
        this.bodies = this.createBodies();
        this.offsetX = 0;
        this.offsetY = 0;
        // Keep scale, gravity, and speed - don't reset them
        this.closePropertyEditor();
    }
    
    resetSettings() {
        // Reset all settings to defaults
        this.gravity = 0.62;
        this.speed = 1;
        this.scale = 1;
        
        // Update UI elements
        document.getElementById('zoomSlider').value = 1;
        document.getElementById('zoomValue').textContent = '1.0x';
        document.getElementById('gravitySlider').value = 0.62;
        document.getElementById('gravityValue').textContent = '0.62';
        document.getElementById('speedSlider').value = 1;
        document.getElementById('speedValue').textContent = '1.0x';
    }
    
    calculateGravitationalForce(body1, body2) {
        const dx = body2.x - body1.x;
        const dy = body2.y - body1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return { fx: 0, fy: 0 };
        
        const force = (this.gravity * body1.mass * body2.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        
        return {
            fx: force * Math.cos(angle),
            fy: force * Math.sin(angle)
        };
    }
    
    update() {
        if (!this.isPlaying) return;
        
        const dt = 0.1 * this.speed;
        
        // Store forces for all bodies (to apply simultaneously)
        const forces = [];
        for (let i = 0; i < this.bodies.length; i++) {
            forces.push({ fx: 0, fy: 0 });
        }
        
        // Calculate forces between all pairs of bodies
        if (this.physicsMode === 'n-body') {
            // N-body physics: all bodies attract all other bodies
            for (let i = 0; i < this.bodies.length; i++) {
                for (let j = i + 1; j < this.bodies.length; j++) {
                    const body1 = this.bodies[i];
                    const body2 = this.bodies[j];
                    
                    const force = this.calculateGravitationalForce(body1, body2);
                    
                    // Apply force to body1 (attracted by body2)
                    forces[i].fx += force.fx;
                    forces[i].fy += force.fy;
                    
                    // Apply opposite force to body2 (attracted by body1)
                    forces[j].fx -= force.fx;
                    forces[j].fy -= force.fy;
                }
            }
        } else {
            // Simplified physics: only first body (sun/star) attracts others
            const sun = this.bodies[0];
            if (sun) {
                for (let i = 1; i < this.bodies.length; i++) {
                    const body = this.bodies[i];
                    const force = this.calculateGravitationalForce(sun, body);
                    forces[i].fx = force.fx;
                    forces[i].fy = force.fy;
                }
            }
        }
        
        // Update velocities and positions
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            
            // Initialize force, acceleration and velocity vectors if they don't exist
            if (!body.forceVector) {
                body.forceVector = { fx: 0, fy: 0 };
            }
            if (!body.accelerationVector) {
                body.accelerationVector = { ax: 0, ay: 0 };
            }
            // Skip updating first body in simplified mode (stationary sun)
            if (this.physicsMode === 'simplified' && i === 0) {
                // Still update trail and vectors
                body.forceVector = { fx: 0, fy: 0 };
                body.accelerationVector = { ax: 0, ay: 0 };
                body.trail.push({ x: body.x, y: body.y });
                if (body.trail.length > body.maxTrailLength) {
                    body.trail.shift();
                }
                continue;
            }
            
            // Store force vector for visualization (always update, even if zero)
            body.forceVector = { fx: forces[i].fx, fy: forces[i].fy };
            
            // Calculate and store acceleration vector (force / mass) - independent of mass
            const ax = forces[i].fx / body.mass;
            const ay = forces[i].fy / body.mass;
            body.accelerationVector = { ax: ax, ay: ay };
            
            // Update velocity based on forces (acceleration * dt)
            body.vx += ax * dt;
            body.vy += ay * dt;
            
            
            // Update position
            body.x += body.vx * dt;
            body.y += body.vy * dt;
            
            // Add to trail
            body.trail.push({ x: body.x, y: body.y });
            if (body.trail.length > body.maxTrailLength) {
                body.trail.shift();
            }
        }
        
        // Check for collisions if enabled
        if (this.collisionsEnabled) {
            this.checkCollisions();
            // Clear cooldown at end of frame (cooldown lasts one frame)
            // This prevents bodies from colliding multiple times in the same frame
            this.collisionCooldown.clear();
        }
    }
    
    checkCollisions() {
        // Collect all collisions first to avoid index issues when bodies are removed
        const collisions = [];
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                // Skip if either body is on cooldown (just collided this frame)
                if (this.collisionCooldown.has(body1) || this.collisionCooldown.has(body2)) {
                    continue;
                }
                
                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = body1.radius + body2.radius;
                
                if (distance < minDistance && distance > 0) {
                    // Check if bodies are moving away from each other (relative velocity)
                    const relVx = body1.vx - body2.vx;
                    const relVy = body1.vy - body2.vy;
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    const relVelAlongNormal = relVx * normalX + relVy * normalY;
                    
                    // Only process collision if bodies are approaching (not separating)
                    if (relVelAlongNormal < 0) {
                        collisions.push({ body1, body2, index1: i, index2: j });
                    }
                }
            }
        }
        
        // Process collisions (only first one per frame to avoid issues)
        if (collisions.length > 0) {
            const collision = collisions[0]; // Process one collision per frame
            console.log('Collision detected:', collision.body1.name, 'and', collision.body2.name);
            this.handleCollision(collision.body1, collision.body2, collision.index1, collision.index2);
        }
    }
    
    handleCollision(body1, body2, index1, index2) {
        if (this.collisionMode === 'off') {
            return; // Collisions disabled
        }
        
        console.log('Handling collision:', this.collisionMode, 'between', body1.name, 'and', body2.name);
        
        if (this.collisionMode === 'merge') {
            // Merge bodies: combine masses, conserve momentum
            const totalMass = body1.mass + body2.mass;
            const newVx = (body1.mass * body1.vx + body2.mass * body2.vx) / totalMass;
            const newVy = (body1.mass * body1.vy + body2.mass * body2.vy) / totalMass;
            
            // Merge into body1 (keep the larger one, or body1 if equal)
            if (body2.mass > body1.mass) {
                // Swap: merge into body2 instead
                body2.mass = totalMass;
                body2.vx = newVx;
                body2.vy = newVy;
                body2.radius = Math.max(body1.radius, body2.radius) * 1.1; // Slightly larger
                body2.trail = []; // Clear trail
                
                // Remove body1
                console.log('Removing body1:', body1.name);
                this.bodies.splice(index1, 1);
                // Add cooldown to remaining body to prevent immediate re-collision
                this.collisionCooldown.add(body2);
            } else {
                body1.mass = totalMass;
                body1.vx = newVx;
                body1.vy = newVy;
                body1.radius = Math.max(body1.radius, body2.radius) * 1.1;
                body1.trail = [];
                
                // Remove body2
                console.log('Removing body2:', body2.name);
                this.bodies.splice(index2, 1);
                // Add cooldown to remaining body to prevent immediate re-collision
                this.collisionCooldown.add(body1);
            }
        } else if (this.collisionMode === 'elastic') {
            // Elastic collision: conserve momentum and kinetic energy
            const dx = body2.x - body1.x;
            const dy = body2.y - body1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) return;
            
            const normalX = dx / distance;
            const normalY = dy / distance;
            
            // Relative velocity
            const relVx = body1.vx - body2.vx;
            const relVy = body1.vy - body2.vy;
            
            // Relative velocity along collision normal
            const relVelAlongNormal = relVx * normalX + relVy * normalY;
            
            // Don't resolve if velocities are separating
            if (relVelAlongNormal > 0) return;
            
            // Calculate impulse scalar (elastic: restitution = 1)
            const restitution = 1.0;
            let impulseScalar = -(1 + restitution) * relVelAlongNormal;
            impulseScalar /= (1 / body1.mass + 1 / body2.mass);
            
            // Apply impulse
            const impulseX = impulseScalar * normalX;
            const impulseY = impulseScalar * normalY;
            
            body1.vx += impulseX / body1.mass;
            body1.vy += impulseY / body1.mass;
            body2.vx -= impulseX / body2.mass;
            body2.vy -= impulseY / body2.mass;
            
            // Add cooldown to both bodies to prevent immediate re-collision
            // The velocity check (relVelAlongNormal > 0) should prevent re-collision if bodies are separating
            this.collisionCooldown.add(body1);
            this.collisionCooldown.add(body2);
            console.log('Added cooldown to', body1.name, 'and', body2.name);
        } else if (this.collisionMode === 'inelastic') {
            // Inelastic collision: some energy loss
            const dx = body2.x - body1.x;
            const dy = body2.y - body1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) return;
            
            const normalX = dx / distance;
            const normalY = dy / distance;
            
            // Relative velocity
            const relVx = body1.vx - body2.vx;
            const relVy = body1.vy - body2.vy;
            
            // Relative velocity along collision normal
            const relVelAlongNormal = relVx * normalX + relVy * normalY;
            
            if (relVelAlongNormal > 0) return;
            
            // Inelastic: restitution < 1 (energy loss)
            const restitution = 0.5;
            let impulseScalar = -(1 + restitution) * relVelAlongNormal;
            impulseScalar /= (1 / body1.mass + 1 / body2.mass);
            
            // Apply impulse
            const impulseX = impulseScalar * normalX;
            const impulseY = impulseScalar * normalY;
            
            body1.vx += impulseX / body1.mass;
            body1.vy += impulseY / body1.mass;
            body2.vx -= impulseX / body2.mass;
            body2.vy -= impulseY / body2.mass;
            
            // Add cooldown to both bodies to prevent immediate re-collision
            // The velocity check (relVelAlongNormal > 0) should prevent re-collision if bodies are separating
            this.collisionCooldown.add(body1);
            this.collisionCooldown.add(body2);
            console.log('Added cooldown to', body1.name, 'and', body2.name);
        }
    }
    
    draw() {
        // Clear canvas completely
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Fill with background color
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(this.centerX + this.offsetX, this.centerY + this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw stars background
        this.drawStars();
        
        // Draw orbits (dotted lines)
        this.drawOrbits();
        
        // Draw trails
        this.drawTrails();
        
        // Draw moon connections
        if (this.showMoonConnections) {
            this.drawMoonConnections();
        }
        
        // Draw vectors
        if (this.showAccelerationVectors) {
            this.drawVectors();
        }
        
        // Draw bodies
        for (const body of this.bodies) {
            this.drawBody(body);
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (const star of this.stars) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawOrbits() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 1;
        
        for (const body of this.bodies) {
            if (body.orbitRadius && body !== this.bodies[0]) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, body.orbitRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawVectors() {
        for (const body of this.bodies) {
            // Skip if showing only for selected and this isn't selected
            if (this.showVectorsForSelectedOnly && this.selectedBody !== body) {
                continue;
            }
            
            // Ensure acceleration vector exists (initialize if missing)
            if (!body.accelerationVector) {
                body.accelerationVector = { ax: 0, ay: 0 };
            }
            
            if (this.showAccelerationVectors) {
                // Draw acceleration vector (red) - independent of mass
                // Use logarithmic scale to make both small and large accelerations visible
                const ax = body.accelerationVector.ax;
                const ay = body.accelerationVector.ay;
                const magnitude = Math.sqrt(ax * ax + ay * ay);
                
                if (magnitude > 0) {
                    // Logarithmic scaling: log(1 + magnitude) to handle small values
                    // Add 1 to avoid log(0), then scale appropriately
                    const logMagnitude = Math.log1p(magnitude * 1000); // Scale up small values before log
                    const logScale = this.vectorScale * 20; // Base scale factor
                    const scaledMagnitude = logMagnitude * logScale;
                    
                    // Normalize direction and apply scaled magnitude
                    const directionX = ax / magnitude;
                    const directionY = ay / magnitude;
                    const scaledAx = directionX * scaledMagnitude;
                    const scaledAy = directionY * scaledMagnitude;
                    
                    this.drawVector(body.x, body.y, scaledAx, scaledAy, 'rgba(255, 0, 0, 0.8)', 'Acceleration');
                } else {
                    // Draw a small dot for zero/very small acceleration to indicate it's being tracked
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    this.ctx.beginPath();
                    this.ctx.arc(body.x, body.y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    drawVector(x, y, dx, dy, color, label) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < 0.5) return; // Don't draw very small vectors (reduced threshold since we use log scale)
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + dx, y + dy);
        this.ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        const arrowLength = Math.min(10, length * 0.3);
        const arrowAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + dx, y + dy);
        this.ctx.lineTo(
            x + dx - arrowLength * Math.cos(angle - arrowAngle),
            y + dy - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(x + dx, y + dy);
        this.ctx.lineTo(
            x + dx - arrowLength * Math.cos(angle + arrowAngle),
            y + dy - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
    }
    
    drawMoonConnections() {
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 5]);
        
        for (const body of this.bodies) {
            if (body.isMoon && body.parent) {
                // Check if parent still exists
                if (this.bodies.includes(body.parent)) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(body.parent.x, body.parent.y);
                    this.ctx.lineTo(body.x, body.y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawTrails() {
        for (const body of this.bodies) {
            if (body.trail.length < 2) continue;
            
            this.ctx.strokeStyle = body.color;
            this.ctx.globalAlpha = 0.3;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < body.trail.length; i++) {
                const point = body.trail[i];
                const alpha = i / body.trail.length;
                this.ctx.globalAlpha = alpha * 0.3;
                
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawBody(body) {
        // Draw highlight for selected body
        if (this.selectedBody === body) {
            this.ctx.strokeStyle = 'rgba(79, 195, 247, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw rings for Saturn
        if (body.hasRings) {
            this.ctx.strokeStyle = 'rgba(250, 213, 165, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.ellipse(body.x, body.y, body.radius * 1.8, body.radius * 0.6, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw glow for stars
        if (body.isStar) {
            // Convert color to RGB for glow effect
            const color = body.color;
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            
            const gradient = this.ctx.createRadialGradient(
                body.x, body.y, 0,
                body.x, body.y, body.radius * 2
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw planet
        this.ctx.fillStyle = body.color;
        this.ctx.beginPath();
        this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw label
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(body.name, body.x, body.y - body.radius - 10);
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('solarSystemCanvas');
    new SolarSystem(canvas);
});

