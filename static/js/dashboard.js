// static/js/dashboard.js

class SauronDashboard {
    constructor() {
        this.activeSection = 'vision';
        this.websocket = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSidebarToggle();
        this.setupWebSocket();
        this.startDataUpdates();
        this.setupEventListeners();
        this.setupScrollHandler();
    }

    setupScrollHandler() {
        // Handle header transparency on scroll
        window.addEventListener('scroll', () => {
            const header = document.getElementById('dashboard-header');
            const activityBar = document.getElementById('activity-ticker-bar');
            
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                activityBar.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
                activityBar.classList.remove('scrolled');
            }
        });
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
        
        try {
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
            console.log('WebSocket not available, running in demo mode');
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
        alertEl.querySelector('.alert-close').addEventListener('click', () => {
            alertEl.remove();
        });
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
            background: var(--secondary-bg);
            border: 1px solid var(--glow-color);
            border-radius: 5px;
            color: var(--primary-text);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'market':
                this.loadMarketScanner();
                break;
            case 'strategy':
                this.loadStrategyBuilder();
                break;
            case 'risk':
                this.loadRiskMonitor();
                break;
            case 'terminal':
                this.loadTerminal();
                break;
            case 'sentiment':
                this.loadSentimentAnalysis();
                break;
            case 'execution':
                this.loadExecutionInterface();
                break;
            case 'anomaly':
                this.loadAnomalyDetection();
                break;
        }
    }

    loadMarketScanner() {
        console.log('Loading Market Scanner...');
        // Simulate API call
        setTimeout(() => {
            this.showNotification('Market Scanner data loaded', 'success');
        }, 1000);
    }

    loadStrategyBuilder() {
        console.log('Loading Strategy Builder...');
        // Simulate API call
        setTimeout(() => {
            this.showNotification('Strategy Builder initialized', 'success');
        }, 1000);
    }

    loadRiskMonitor() {
        console.log('Loading Risk Monitor...');
        // Simulate API call
        setTimeout(() => {
            this.showNotification('Risk Monitor active', 'success');
        }, 1000);
    }

    loadTerminal() {
        console.log('Loading Terminal...');
        // Initialize terminal if not already done
        if (!window.sauronTerminal) {
            window.sauronTerminal = new SauronTerminal();
        }
        this.showNotification('Terminal ready', 'success');
    }

    loadSentimentAnalysis() {
        console.log('Loading Sentiment Analysis...');
        setTimeout(() => {
            this.showNotification('Sentiment Analysis loaded', 'success');
        }, 1000);
    }

    loadExecutionInterface() {
        console.log('Loading Execution Interface...');
        setTimeout(() => {
            this.showNotification('Execution Interface ready', 'success');
        }, 1000);
    }

    loadAnomalyDetection() {
        console.log('Loading Anomaly Detection...');
        setTimeout(() => {
            this.showNotification('Anomaly Detection active', 'success');
        }, 1000);
    }

    startDataUpdates() {
        // Update market data every 5 seconds
        setInterval(() => {
            this.fetchMarketData();
        }, 5000);
        
        // Update other data every 30 seconds
        setInterval(() => {
            this.fetchDashboardData();
        }, 30000);
        
        // Update time displays every second
        setInterval(() => {
            this.updateTimeDisplays();
        }, 1000);
    }

    fetchMarketData() {
        // Simulate market data updates
        const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'NVDA', 'META'];
        const sampleData = {};
        
        symbols.forEach(symbol => {
            const basePrice = Math.random() * 1000 + 100;
            const change = (Math.random() - 0.5) * 10;
            sampleData[symbol] = {
                price: basePrice.toFixed(2),
                change: change.toFixed(2),
                volume: Math.floor(Math.random() * 10000000) + 1000000
            };
        });
        
        this.updateMarketData(sampleData);
    }

    fetchDashboardData() {
        // Simulate fetching additional dashboard data
        console.log('Updating dashboard data...');
    }

    updateTimeDisplays() {
        // Update any time displays on the page
        const timeElements = document.querySelectorAll('.time-display');
        const now = new Date();
        
        timeElements.forEach(element => {
            element.textContent = now.toLocaleTimeString();
        });
    }

    setupEventListeners() {
        // Refresh button
        document.querySelectorAll('.control-btn').forEach(btn => {
            if (btn.textContent.includes('Refresh')) {
                btn.addEventListener('click', () => {
                    this.refreshCurrentSection();
                });
            }
        });
        
        // News bar toggle
        const newsBarToggle = document.querySelector('.news-bar-toggle');
        if (newsBarToggle) {
            newsBarToggle.addEventListener('click', () => {
                this.toggleNewsBar();
            });
        }
        
        // News filter buttons
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterNews(btn.dataset.filter);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchToSection('vision');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToSection('market');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToSection('strategy');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToSection('risk');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchToSection('sentiment');
                        break;
                    case '6':
                        e.preventDefault();
                        this.switchToSection('execution');
                        break;
                    case '7':
                        e.preventDefault();
                        this.switchToSection('anomaly');
                        break;
                    case '`':
                        e.preventDefault();
                        this.switchToSection('terminal');
                        break;
                }
            }
        });
    }

    toggleNewsBar() {
        const newsBar = document.getElementById('news-bar');
        if (newsBar) {
            newsBar.classList.toggle('visible');
        }
    }

    filterNews(filter) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Filter news items
        document.querySelectorAll('.news-item').forEach(item => {
            if (filter === 'all' || item.dataset.type === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
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

    // Card management functions
    expandAllCards() {
        document.querySelectorAll('.overview-card').forEach(card => {
            card.classList.add('expanded');
            const btn = card.querySelector('.card-control-btn i');
            if (btn) btn.className = 'fas fa-compress';
        });
        this.showNotification('All cards expanded', 'info');
    }

    collapseAllCards() {
        document.querySelectorAll('.overview-card').forEach(card => {
            card.classList.remove('expanded');
            const btn = card.querySelector('.card-control-btn i');
            if (btn) btn.className = 'fas fa-expand';
        });
        this.showNotification('All cards collapsed', 'info');
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    calculatePercentageChange(current, previous) {
        return ((current - previous) / previous * 100).toFixed(2);
    }
}

// Global functions for HTML onclick events
function goToDashboard() {
    window.location.href = window.location.origin + '/dashboard/';
}

function toggleNewsBar() {
    const newsBar = document.getElementById('news-bar');
    if (newsBar) {
        newsBar.classList.toggle('visible');
    }
}

function toggleCardSize(button) {
    const card = button.closest('.overview-card');
    const icon = button.querySelector('i');
    
    card.classList.toggle('expanded');
    
    if (card.classList.contains('expanded')) {
        icon.className = 'fas fa-compress';
        // Show additional content if portfolio card
        if (card.id === 'portfolio-card') {
            const charts = card.querySelector('.portfolio-charts');
            if (charts) {
                charts.style.display = 'grid';
            }
        }
    } else {
        icon.className = 'fas fa-expand';
        // Hide additional content if portfolio card
        if (card.id === 'portfolio-card') {
            const charts = card.querySelector('.portfolio-charts');
            if (charts) {
                charts.style.display = 'none';
            }
        }
    }
}

function expandAllCards() {
    if (window.sauronDashboard) {
        window.sauronDashboard.expandAllCards();
    }
}

function collapseAllCards() {
    if (window.sauronDashboard) {
        window.sauronDashboard.collapseAllCards();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sauronDashboard = new SauronDashboard();
    
    // Initialize any other components
    console.log('🚀 Sauron Vision Dashboard initialized');
    
    // Add some demo data updates
    setTimeout(() => {
        if (window.sauronDashboard) {
            window.sauronDashboard.showNotification('Market data synchronized', 'success');
        }
    }, 2000);
    
    // Simulate some alerts
    setTimeout(() => {
        if (window.sauronDashboard) {
            window.sauronDashboard.showAlert({
                title: 'Price Alert',
                message: 'AAPL reached your target price of $150',
                priority: 'medium'
            });
        }
    }, 5000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👁️ Sauron Vision going into background mode');
    } else {
        console.log('👁️ Sauron Vision back in focus');
        if (window.sauronDashboard) {
            window.sauronDashboard.fetchMarketData();
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust layouts if needed
    console.log('📐 Window resized, adjusting layouts');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SauronDashboard;
}