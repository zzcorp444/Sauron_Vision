// static/js/vision3d.js
class SauronVision3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.priceData = [];
        this.aiData = null;
        this.meshes = {
            priceLine: null,
            predictions: null,
            probabilityClouds: [],
            volumeBars: [],
            correlationLines: []
        };
        
        this.settings = {
            showPredictions: true,
            showProbability: true,
            showCorrelations: true,
            showVolume: true,
            timeDepth: 3
        };
        
        this.init();
        this.animate();
        this.loadData('AAPL');
    }
    
    init() {
        // Get container
        const container = document.getElementById('vision-container');
        const canvas = document.getElementById('three-canvas');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 300);
        
        // Camera setup
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 30, 60);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Lights
        this.setupLights();
        
        // Grid and axes
        this.setupGrid();
        
        // Event listeners
        this.setupEventListeners();
        
        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x00ff41, 0.2);
        this.scene.add(ambientLight);
        
        // Directional light
        const dirLight = new THREE.DirectionalLight(0x00ff41, 0.5);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        this.scene.add(dirLight);
        
        // Point lights for glow effects
        const pointLight1 = new THREE.PointLight(0x00ff41, 0.5, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x00cc33, 0.3, 100);
        pointLight2.position.set(-20, 20, -20);
        this.scene.add(pointLight2);
    }
    
    setupGrid() {
        // Grid
        const gridHelper = new THREE.GridHelper(200, 50, 0x00ff41, 0x003311);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
        
        // Axes
        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);
        
        // Add axis labels
        this.addAxisLabels();
    }
    
    addAxisLabels() {
        // This would add 3D text labels for axes
        // For now, we'll use sprites or HTML overlays
    }
    
    setupEventListeners() {
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Control buttons
        document.getElementById('load-symbol').addEventListener('click', () => {
            const symbol = document.getElementById('symbol-input').value;
            this.loadData(symbol);
        });
        
        document.getElementById('toggle-ai').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            document.getElementById('ai-overlay').style.display = 
                e.target.classList.contains('active') ? 'block' : 'none';
        });
        
        document.getElementById('toggle-3d').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.toggle3DMode(e.target.classList.contains('active'));
        });
        
        // Setting checkboxes
        document.getElementById('show-predictions').addEventListener('change', (e) => {
            this.settings.showPredictions = e.target.checked;
            this.updateVisualization();
        });
        
        document.getElementById('show-probability').addEventListener('change', (e) => {
            this.settings.showProbability = e.target.checked;
            this.updateVisualization();
        });
        
        document.getElementById('show-correlations').addEventListener('change', (e) => {
            this.settings.showCorrelations = e.target.checked;
            this.updateVisualization();
        });
        
        document.getElementById('show-volume').addEventListener('change', (e) => {
            this.settings.showVolume = e.target.checked;
            this.updateVisualization();
        });
        
        document.getElementById('time-depth').addEventListener('input', (e) => {
            this.settings.timeDepth = parseInt(e.target.value);
            this.updateVisualization();
        });
    }
    
    loadData(symbol) {
        document.getElementById('loading-indicator').style.display = 'block';
        
        fetch(`/api/vision-data/${symbol}/`)
            .then(response => response.json())
            .then(data => {
                this.priceData = data.price_data;
                this.aiData = data.ai_insights;
                this.probabilityClouds = data.probability_clouds;
                
                this.clearScene();
                this.createVisualization();
                this.updateAIOverlay();
                
                document.getElementById('loading-indicator').style.display = 'none';
            })
            .catch(error => {
                console.error('Error loading data:', error);
                document.getElementById('loading-indicator').style.display = 'none';
            });
    }
    
    clearScene() {
        // Remove all mesh objects
        Object.values(this.meshes).forEach(mesh => {
            if (Array.isArray(mesh)) {
                mesh.forEach(m => this.scene.remove(m));
            } else if (mesh) {
                this.scene.remove(mesh);
            }
        });
        
        this.meshes = {
            priceLine: null,
            predictions: null,
            probabilityClouds: [],
            volumeBars: [],
            correlationLines: []
        };
    }
    
    createVisualization() {
        // Create price line
        this.createPriceLine();
        
        // Create prediction line
        if (this.settings.showPredictions) {
            this.createPredictionLine();
        }
        
        // Create probability clouds
        if (this.settings.showProbability) {
            this.createProbabilityClouds();
        }
        
        // Create volume bars
        if (this.settings.showVolume) {
            this.createVolumeBars();
        }
        
        // Create correlation lines
        if (this.settings.showCorrelations) {
            this.createCorrelationLines();
        }
        
        // Add patterns and anomalies
        this.addPatternMarkers();
        this.addAnomalyMarkers();
    }
    
    createPriceLine() {
        const points = [];
        const colors = [];
        
        this.priceData.forEach((data, index) => {
            const x = index - this.priceData.length / 2;
            const y = (data.price - 150) * 2; // Scale for visibility
            const z = 0;
            
            points.push(new THREE.Vector3(x, y, z));
            
            // Color based on price movement
            const color = index > 0 && data.price > this.priceData[index - 1].price
                ? new THREE.Color(0x00ff41)
                : new THREE.Color(0xff3333);
            colors.push(color.r, color.g, color.b);
        });
        
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            linewidth: 2
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.meshes.priceLine = line;
        
        // Add glow effect
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff41,
            linewidth: 5,
            transparent: true,
            opacity: 0.3
        });
        const glowLine = new THREE.Line(geometry, glowMaterial);
        this.scene.add(glowLine);
    }
    
    createPredictionLine() {
        const points = [];
        
        this.priceData.forEach((data, index) => {
            if (data.prediction) {
                const x = index - this.priceData.length / 2;
                const y = (data.prediction - 150) * 2;
                const z = 5; // Offset in Z axis
                
                points.push(new THREE.Vector3(x, y, z));
            }
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: 0x00ccff,
            dashSize: 3,
            gapSize: 1,
            transparent: true,
            opacity: 0.8
        });
        
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        this.scene.add(line);
        this.meshes.predictions = line;
    }
    
    createProbabilityClouds() {
        this.probabilityClouds.forEach((cloud, index) => {
            cloud.ranges.forEach((range, rangeIndex) => {
                const geometry = new THREE.BoxGeometry(5, 
                    (range.high - range.low) * 2, 
                    10 - rangeIndex * 3
                );
                
                const material = new THREE.MeshBasicMaterial({
                    color: rangeIndex === 0 ? 0x00ff41 : 0x00cc33,
                    transparent: true,
                    opacity: 0.1 + range.probability * 0.2,
                    side: THREE.DoubleSide
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                const x = this.priceData.length / 2 + index * 5;
                const y = ((range.high + range.low) / 2 - 150) * 2;
                mesh.position.set(x, y, 10);
                
                this.scene.add(mesh);
                this.meshes.probabilityClouds.push(mesh);
            });
        });
    }
    
    createVolumeBars() {
        this.priceData.forEach((data, index) => {
            const height = data.volume / 1000000; // Scale volume
            const geometry = new THREE.BoxGeometry(0.8, height, 2);
            
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff41,
                transparent: true,
                opacity: 0.6
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            const x = index - this.priceData.length / 2;
            mesh.position.set(x, -height / 2, -10);
            
            this.scene.add(mesh);
            this.meshes.volumeBars.push(mesh);
        });
    }
    
    createCorrelationLines() {
        // Create lines showing correlations with other assets
        if (this.aiData && this.aiData.correlations) {
            this.aiData.correlations.forEach((corr, index) => {
                const strength = Math.abs(corr.correlation);
                const points = [];
                
                // Create a curved line representing correlation
                for (let i = 0; i < 50; i++) {
                    const t = i / 49;
                    const x = (t - 0.5) * 100;
                    const y = Math.sin(t * Math.PI * 2) * strength * 20;
                    const z = -20 - index * 10;
                    
                    points.push(new THREE.Vector3(x, y, z));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: corr.correlation > 0 ? 0x00ff41 : 0xff3333,
                    transparent: true,
                    opacity: strength
                });
                
                const line = new THREE.Line(geometry, material);
                this.scene.add(line);
                this.meshes.correlationLines.push(line);
            });
        }
    }
    
    addPatternMarkers() {
        if (this.aiData && this.aiData.patterns) {
            this.aiData.patterns.forEach(pattern => {
                const geometry = new THREE.ConeGeometry(2, 5, 4);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xffff00,
                    emissive: 0xffff00,
                    emissiveIntensity: 0.5
                });
                
                const marker = new THREE.Mesh(geometry, material);
                marker.position.set(0, 20, 0); // Position based on pattern location
                marker.userData = { pattern: pattern };
                
                this.scene.add(marker);
            });
        }
    }
    
    addAnomalyMarkers() {
        if (this.aiData && this.aiData.anomalies) {
            this.aiData.anomalies.forEach(anomaly => {
                const geometry = new THREE.SphereGeometry(2, 16, 16);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: anomaly.severity,
                    transparent: true,
                    opacity: 0.8
                });
                
                const marker = new THREE.Mesh(geometry, material);
                marker.position.set(30, 10, 0); // Position based on anomaly time
                marker.userData = { anomaly: anomaly };
                
                // Add pulsing animation
                marker.scale.set(1, 1, 1);
                
                this.scene.add(marker);
            });
        }
    }
    
    updateAIOverlay() {
        if (this.aiData) {
            // Update sentiment
            document.getElementById('sentiment-bar').style.width = 
                `${this.aiData.sentiment.overall * 100}%`;
            document.getElementById('sentiment-value').textContent = 
                `${Math.round(this.aiData.sentiment.overall * 100)}%`;
            
            // Update patterns
            const patternList = document.getElementById('pattern-list');
            patternList.innerHTML = '';
            this.aiData.patterns.forEach(pattern => {
                const div = document.createElement('div');
                div.className = 'pattern-item';
                div.innerHTML = `
                    <i class="fas fa-chart-line"></i> ${pattern.type}
                    <span class="confidence">${Math.round(pattern.confidence * 100)}%</span>
                `;
                patternList.appendChild(div);
            });
            
            // Update anomalies
            const anomalyStatus = document.getElementById('anomaly-status');
            if (this.aiData.anomalies.length > 0) {
                anomalyStatus.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="color: var(--warning-text)"></i>
                    ${this.aiData.anomalies.length} Anomalies Detected
                `;
            } else {
                anomalyStatus.innerHTML = `
                    <i class="fas fa-check-circle" style="color: var(--glow-color)"></i>
                    Normal Market Conditions
                `;
            }
            
            // Update risk metrics
            document.getElementById('var-value').textContent = 
                `${this.aiData.risk_metrics.var_1d}%`;
            document.getElementById('vol-value').textContent = 
                `${(this.aiData.risk_metrics.volatility * 100).toFixed(1)}%`;
        }
    }
    
    toggle3DMode(enabled) {
        if (enabled) {
            this.camera.position.set(30, 30, 60);
            this.controls.enabled = true;
        } else {
            this.camera.position.set(0, 0, 100);
            this.camera.lookAt(0, 0, 0);
            this.controls.enabled = false;
        }
    }
    
    updateVisualization() {
        // Clear and recreate visualization with new settings
        this.clearScene();
        this.setupGrid();
        this.createVisualization();
    }
    
    onMouseMove(event) {
        const container = document.getElementById('vision-container');
        const rect = container.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // Raycast for hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.pattern || object.userData.anomaly) {
                this.showTooltip(event, object.userData);
            }
        }
    }
    
    onMouseClick(event) {
        // Handle click interactions
    }
    
    showTooltip(event, data) {
        // Create and show tooltip
        let tooltip = document.querySelector('.vision-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'vision-tooltip';
            document.body.appendChild(tooltip);
        }
        
        if (data.pattern) {
            tooltip.innerHTML = `
                <strong>Pattern: ${data.pattern.type}</strong>
                Confidence: ${Math.round(data.pattern.confidence * 100)}%<br>
                Target: $${data.pattern.target}
            `;
        } else if (data.anomaly) {
            tooltip.innerHTML = `
                <strong>Anomaly: ${data.anomaly.type}</strong>
                Severity: ${Math.round(data.anomaly.severity * 100)}%<br>
                Time: ${new Date(data.anomaly.time).toLocaleTimeString()}
            `;
        }
        
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
        tooltip.style.display = 'block';
        
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 3000);
    }
    
    onWindowResize() {
        const container = document.getElementById('vision-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Animate anomaly markers
        this.scene.traverse((child) => {
            if (child.userData.anomaly) {
                child.scale.x = child.scale.y = child.scale.z = 
                    1 + Math.sin(Date.now() * 0.003) * 0.2;
            }
        });
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.sauronVision3D = new SauronVision3D();
});