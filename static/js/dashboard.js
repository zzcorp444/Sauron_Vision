// static/js/dashboard.js
class SauronDashboard {
    constructor() {
        this.activeSection = 'overview';
        this.websocket = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSidebarToggle();
        this.setupWebSocket();
        this.startDataUpdates();
        this.setupEventListeners();
        this.startNoticeRotation();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
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
        const newsBar = document.getElementById('news-bar');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('retracted');
                
                // Toggle news bar visibility
                if (sidebar.classList.contains('retracted')) {
                    newsBar.classList.add('visible');
                } else {
                    newsBar.classList.remove('visible');
                }
            });
        }
    }

    setupWebSocket() {
        try {
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
        } catch (error) {
            console.log('WebSocket not available, using polling instead');
        }
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
            if (alertEl.parentNode) {
                alertEl.remove();
            }
        }, 5000);
        
        // Manual close
        const closeBtn = alertEl.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alertEl.remove();
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 5px;
            z-index: 10000;
            font-family: var(--font-mono);
            font-size: 14px;
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = 'rgba(0, 255, 65, 0.1)';
                notification.style.border = '1px solid var(--primary-text)';
                notification.style.color = 'var(--primary-text)';
                break;
            case 'error':
                notification.style.background = 'rgba(255, 51, 51, 0.1)';
                notification.style.border = '1px solid var(--error-text)';
                notification.style.color = 'var(--error-text)';
                break;
            default:
                notification.style.background = 'rgba(0, 204, 51, 0.1)';
                notification.style.border = '1px solid var(--secondary-text)';
                notification.style.color = 'var(--secondary-text)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
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
        fetch('/api/market/scanner/')
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
        // Update market data every 3 seconds
        setInterval(() => {
            this.fetchMarketData();
        }, 3000);
        
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

    startNoticeRotation() {
        // Rotate notice content every 30 seconds
        setInterval(() => {
            this.rotateNotices();
        }, 30000);
    }

    rotateNotices() {
        const noticeContent = document.querySelector('.notice-content');
        if (noticeContent) {
            // Generate new notices
            const notices = [
                { type: 'success', icon: 'fas fa-eye', text: 'Sauron Vision: Actively monitoring 2,847 global markets' },
                { type: 'warning', icon: 'fas fa-exclamation-triangle', text: 'Market Alert: High volatility detected in crypto sector' },
                { type: '', icon: 'fas fa-robot', text: 'AI Engine: Processing 156,234 data points per second' },
                { type: 'critical', icon: 'fas fa-satellite', text: 'Breaking: Major economic announcement expected in 2 hours' },
                { type: '', icon: 'fas fa-chart-line', text: 'Strategy Engine: 12 new opportunities identified' },
                { type: 'success', icon: 'fas fa-shield-alt', text: 'Risk Management: All systems operational' },
                { type: 'warning', icon: 'fas fa-globe', text: 'Global Markets: Monitoring geopolitical developments' },
                { type: '', icon: 'fas fa-microchip', text: 'Pattern Recognition: 7 bullish patterns forming' }
            ];
            
            // Randomly select and display notices
            const randomNotices = notices.sort(() => 0.5 - Math.random()).slice(0, 6);
            noticeContent.innerHTML = randomNotices.map(notice => 
                `<div class="notice-item ${notice.type}">
                    <i class="${notice.icon}"></i>
                    <span>${notice.text}</span>
                </div>`
            ).join('');
        }
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

        // News filter functionality
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.news-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                document.querySelectorAll('.news-item').forEach(item => {
                    if (filter === 'all' || item.dataset.type === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Make news items clickable
        document.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', function() {
                console.log('Opening article...');
            });
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
}

// Global functions for templates
window.toggleChart = function(button) {
    const container = button.parentElement.querySelector('.mini-chart-container');
    const icon = button.querySelector('i');
    
    button.classList.toggle('locked');
    container.classList.toggle('show');
    
    if (button.classList.contains('locked')) {
        icon.className = 'fas fa-chevron-up';
    } else {
        icon.className = 'fas fa-chevron-down';
    }
};

window.toggleCardExpand = function(button) {
    const card = button.parentElement;
    const icon = button.querySelector('i');
    
    card.classList.toggle('expanded');
    
    if (card.classList.contains('expanded')) {
        icon.className = 'fas fa-chevron-up';
    } else {
        icon.className = 'fas fa-chevron-down';
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sauronDashboard = new SauronDashboard();
});