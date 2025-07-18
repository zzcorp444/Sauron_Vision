// static/js/dashboard.js
class SauronDashboard {
    constructor() {
        this.activeSection = 'overview';
        this.websocket = null;
        this.notificationCount = 0;
        this.alertCount = 0;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSidebarToggle();
        this.setupWebSocket();
        this.startDataUpdates();
        this.setupEventListeners();
        this.setupBinaryMatrix();
        this.setupTickerFilters();
        this.setupBlinkingIcons();
        this.setupCardExpansion();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const contentSections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Show corresponding content section
                const sectionId = item.dataset.section;
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');
                    this.activeSection = sectionId;
                    this.loadSectionData(sectionId);
                }
            });
        });
    }

    setupSidebarToggle() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('retracted');
            });
        }
    }

    setupWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/dashboard/`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('🔗 Sauron Vision connected');
            this.showNotification('Connected to Sauron Vision', 'success');
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 Connection closed. Reconnecting...');
            setTimeout(() => this.setupWebSocket(), 5000);
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showNotification('Connection error', 'error');
        };
    }

    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'market_data':
                this.updateMarketData(data.data);
                break;
            case 'alert':
                this.showAlert(data.data);
                break;
            case 'signal':
                this.updateSignals(data.data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    updateMarketData(data) {
        Object.entries(data).forEach(([symbol, info]) => {
            const elements = document.querySelectorAll(`[data-symbol="${symbol}"]`);
            elements.forEach(el => {
                const priceEl = el.querySelector('.price');
                const changeEl = el.querySelector('.change');
                
                if (priceEl) priceEl.textContent = `$${info.price}`;
                if (changeEl) {
                    changeEl.textContent = `${info.change > 0 ? '+' : ''}${info.change}%`;
                    changeEl.className = `change ${info.change > 0 ? 'positive' : 'negative'}`;
                }
            });
        });
    }

    updateSignals(signals) {
        const signalList = document.querySelector('.signal-list');
        if (!signalList) return;
        
        signalList.innerHTML = '';
        signals.forEach(signal => {
            const signalEl = document.createElement('div');
            signalEl.className = 'signal-item';
            signalEl.innerHTML = `
                <span class="signal-type ${signal.type.toLowerCase()}">${signal.type}</span>
                <span class="signal-symbol">${signal.symbol}</span>
                <span class="signal-time">${signal.time}</span>
            `;
            signalList.appendChild(signalEl);
        });
    }

    showAlert(alert) {
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${alert.priority}`;
        alertEl.innerHTML = `
            <div class="alert-content">
                <strong>${alert.title}</strong>
                <p>${alert.message}</p>
            </div>
            <button class="alert-close">×</button>
        `;
        
        document.body.appendChild(alertEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertEl.remove();
        }, 5000);
        
        // Manual close
        alertEl.querySelector('.alert-close').addEventListener('click', () => {
            alertEl.remove();
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'market-scanner':
                this.loadMarketScanner();
                break;
            case 'strategy-builder':
                this.loadStrategyBuilder();
                break;
            case 'risk-monitor':
                this.loadRiskMonitor();
                break;
            case 'terminal':
                this.loadTerminal();
                break;
        }
    }

    loadMarketScanner() {
        fetch('/api/market-scanner/')
            .then(response => response.json())
            .then(data => {
                console.log('Market scanner data:', data);
                // Update market scanner UI
            })
            .catch(error => console.error('Error loading market scanner:', error));
    }

    loadStrategyBuilder() {
        // Load strategy builder components
        console.log('Loading strategy builder...');
    }

    loadRiskMonitor() {
        // Load risk monitoring data
        console.log('Loading risk monitor...');
    }

    loadTerminal() {
        // Initialize terminal if not already done
        if (!window.sauronTerminal) {
            window.sauronTerminal = new SauronTerminal();
        }
    }

    startDataUpdates() {
        // Update market data every 1 second
        setInterval(() => {
            this.fetchMarketData();
        }, 1000);
        
        // Update other data every 10 seconds
        setInterval(() => {
            this.fetchDashboardData();
        }, 10000);
    }

    fetchMarketData() {
        fetch('/api/market-data/')
            .then(response => response.json())
            .then(data => {
                this.updateMarketData(data);
            })
            .catch(error => console.error('Error fetching market data:', error));
    }

    fetchDashboardData() {
        fetch('/api/dashboard-data/')
            .then(response => response.json())
            .then(data => {
                // Update dashboard components
                console.log('Dashboard data updated:', data);
            })
            .catch(error => console.error('Error fetching dashboard data:', error));
    }

    setupEventListeners() {
        // Refresh button
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.refreshCurrentSection();
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchToSection('overview');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToSection('market-scanner');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToSection('strategy-builder');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToSection('risk-monitor');
                        break;
                    case '`':
                        e.preventDefault();
                        this.switchToSection('terminal');
                        break;
                }
            }
        });
    }

    switchToSection(sectionId) {
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (navItem) {
            navItem.click();
        }
    }

    refreshCurrentSection() {
        this.loadSectionData(this.activeSection);
        this.showNotification('Section refreshed', 'success');
    }

    setupBinaryMatrix() {
        const matrixEl = document.querySelector('.binary-matrix');
        if (matrixEl) {
            setInterval(() => {
                let binary = '';
                for (let i = 0; i < 200; i++) {
                    binary += Math.random() < 0.5 ? '0' : '1';
                    if (i % 20 === 19) binary += '\n';
                }
                matrixEl.textContent = binary;
            }, 1000);
        }
    }

    setupTickerFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const action = btn.dataset.action;
                const items = document.querySelectorAll('.ticker-item');
                
                items.forEach(item => {
                    if (action === 'all' || item.dataset.action === action) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    setupBlinkingIcons() {
        const notificationIcon = document.querySelector('.notifications');
        const alertIcon = document.querySelector('.alerts');
        
        setInterval(() => {
            if (this.notificationCount > 0) {
                notificationIcon.classList.toggle('blink');
            }
            if (this.alertCount > 0) {
                alertIcon.classList.toggle('blink');
            }
        }, 1000);
    }

    setupCardExpansion() {
        document.querySelectorAll('.expand-arrow').forEach(arrow => {
            arrow.addEventListener('click', () => {
                const card = arrow.closest('.overview-card');
                card.classList.toggle('expanded');
                
                const graphs = card.querySelector('.portfolio-graphs');
                if (graphs) {
                    graphs.classList.toggle('hidden');
                }
            });
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sauronDashboard = new SauronDashboard();
});