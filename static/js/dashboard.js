// static/js/dashboard.js

class SauronDashboard {
    constructor() {
        this.activeSection = 'vision';
        this.websocket = null;
        this.selectedFilters = new Set();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSidebarToggle();
        this.setupNewsBarToggle();
        this.setupWebSocket();
        this.startDataUpdates();
        this.setupEventListeners();
        this.setupScrollHandler();
        this.setupPriceFilters();
        this.setupAIChatInterface();
        this.setupScrollNavigation();
    }

    setupScrollHandler() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const header = document.getElementById('dashboard-header');
            const activityBar = document.getElementById('activity-ticker-bar');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 50) {
                // User scrolled down - hide activity bar
                header.classList.add('scrolled');
                activityBar.classList.add('scrolled');
            } else {
                // User at top - show activity bar
                header.classList.remove('scrolled');
                activityBar.classList.remove('scrolled');
            }
            
            // Update scroll navigation buttons
            this.updateScrollButtons();
            
            lastScrollTop = scrollTop;
        });
    }

    updateScrollButtons() {
        const scrollUp = document.getElementById('scroll-up');
        const scrollDown = document.getElementById('scroll-down');
        
        if (!scrollUp || !scrollDown) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Enable/disable scroll up button
        if (scrollTop > 100) {
            scrollUp.disabled = false;
        } else {
            scrollUp.disabled = true;
        }
        
        // Enable/disable scroll down button
        if (scrollTop + windowHeight < documentHeight - 100) {
            scrollDown.disabled = false;
        } else {
            scrollDown.disabled = true;
        }
    }

    setupScrollNavigation() {
        const scrollUp = document.getElementById('scroll-up');
        const scrollDown = document.getElementById('scroll-down');
        
        if (scrollUp && scrollDown) {
            scrollUp.addEventListener('click', () => {
                if (!scrollUp.disabled) {
                    const viewportHeight = window.innerHeight;
                    window.scrollBy({
                        top: -viewportHeight,
                        behavior: 'smooth'
                    });
                }
            });
            
            scrollDown.addEventListener('click', () => {
                if (!scrollDown.disabled) {
                    const viewportHeight = window.innerHeight;
                    window.scrollBy({
                        top: viewportHeight,
                        behavior: 'smooth'
                    });
                }
            });
            
            // Initial state
            this.updateScrollButtons();
        }
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
        const sidebar = document.getElementById('sidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                sidebar.classList.toggle('retracted');
                
                // Update content area margin with transition
                setTimeout(() => {
                    this.updateContentAreaMargin();
                }, 50);
            });
        }
    }

    updateContentAreaMargin() {
        const sidebar = document.getElementById('sidebar');
        const newsBar = document.getElementById('news-bar');
        const contentArea = document.querySelector('.content-area');
        
        if (!contentArea) return;
        
        let leftMargin = 250; // Default sidebar width
        
        if (sidebar && sidebar.classList.contains('retracted')) {
            leftMargin = 60;
        }
        
        if (newsBar && newsBar.classList.contains('visible')) {
            leftMargin += 300; // Add news bar width
        }
        
        contentArea.style.marginLeft = leftMargin + 'px';
        
        // Also update section header positioning
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.style.left = leftMargin + 'px';
        });
    }

    setupNewsBarToggle() {
        window.toggleNewsBar = () => {
            const newsBar = document.getElementById('news-bar');
            if (newsBar) {
                newsBar.classList.toggle('visible');
                
                // Update content area margin
                setTimeout(() => {
                    this.updateContentAreaMargin();
                }, 50);
            }
        };
    }

    setupPriceFilters() {
        const filterButtons = document.querySelectorAll('.action-filter');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                
                // Toggle selection
                if (this.selectedFilters.has(action)) {
                    this.selectedFilters.delete(action);
                    btn.classList.remove('active');
                } else {
                    this.selectedFilters.add(action);
                    btn.classList.add('active');
                }
                
                // Apply filters
                this.applyPriceFilters();
            });
        });
    }

    applyPriceFilters() {
        const tickerItems = document.querySelectorAll('.ticker-item');
        
        tickerItems.forEach(item => {
            const itemActions = item.dataset.action ? item.dataset.action.split(' ') : [];
            
            if (this.selectedFilters.size === 0) {
                // No filters selected, show all
                item.classList.remove('hidden');
            } else {
                // Check if item matches any selected filter
                const hasMatch = itemActions.some(action => this.selectedFilters.has(action));
                
                if (hasMatch) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            }
        });
    }

    setupAIChatInterface() {
        const chatInterface = document.getElementById('ai-chat-interface');
        const chatButton = document.getElementById('ai-chat-button');
        const chatClose = document.getElementById('ai-chat-close');
        const eyeText = document.getElementById('ai-eye-text');
        const sizeButtons = document.querySelectorAll('.ai-size-btn');
        const chatInput = document.getElementById('ai-chat-input');
        
        if (!chatInterface || !chatButton) return;
        
        // Handle size buttons - open chat directly
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = btn.dataset.size;
                
                // Remove all size classes
                chatInterface.classList.remove('size-1', 'size-2', 'size-3');
                
                // Add selected size and expand
                chatInterface.classList.add('expanded', `size-${size}`);
                eyeText.textContent = '×';
                if (chatInput) chatInput.focus();
            });
        });
        
        // Handle close button
        if (chatClose) {
            chatClose.addEventListener('click', () => {
                chatInterface.classList.remove('expanded', 'size-1', 'size-2', 'size-3');
                eyeText.textContent = '<0>';
            });
        }
        
        // Handle chat input
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.sendAIMessage(e.target.value);
                    e.target.value = '';
                }
            });
        }
        
        // Simulate thinking state
        this.simulateAIThinking();
    }

    sendAIMessage(message) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const chatInterface = document.getElementById('ai-chat-interface');
        
        if (!messagesContainer) return;
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(userMsg);
        
        // Show thinking state
        if (chatInterface) {
            chatInterface.classList.add('thinking');
        }
        
        // Simulate AI response
        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-message ai';
            aiMsg.innerHTML = `
                <div class="message-content">I'm analyzing your request: "${message}". The market patterns suggest interesting opportunities...</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(aiMsg);
            
            if (chatInterface) {
                chatInterface.classList.remove('thinking');
            }
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    }

    simulateAIThinking() {
        setInterval(() => {
            const chatInterface = document.getElementById('ai-chat-interface');
            if (chatInterface && !chatInterface.classList.contains('expanded')) {
                chatInterface.classList.add('thinking');
                setTimeout(() => {
                    chatInterface.classList.remove('thinking');
                }, 2000);
            }
        }, 10000);
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
        this.updateMarketScannerData();
        this.showNotification('Market Scanner data loaded', 'success');
    }

    updateMarketScannerData() {
        const moversData = [
            { symbol: 'NVDA', price: 450.30, change: 5.2, volume: '25M' },
            { symbol: 'AMD', price: 120.45, change: 3.8, volume: '18M' },
            { symbol: 'AAPL', price: 150.25, change: 2.1, volume: '15M' },
            { symbol: 'MSFT', price: 300.40, change: 1.8, volume: '10M' },
            { symbol: 'GOOGL', price: 2750.50, change: -0.5, volume: '8M' }
        ];

        const moversList = document.querySelector('#top-movers-list');
        if (moversList) {
            moversList.innerHTML = moversData.map(stock => `
                <div class="scanner-item">
                    <div class="scanner-symbol">
                        <span class="symbol">${stock.symbol}</span>
                        <span class="price">$${stock.price}</span>
                    </div>
                    <div class="scanner-metrics">
                        <span class="change ${stock.change > 0 ? 'positive' : 'negative'}">
                            ${stock.change > 0 ? '+' : ''}${stock.change}%
                        </span>
                        <span class="volume">Vol: ${stock.volume}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    loadStrategyBuilder() {
        console.log('Loading Strategy Builder...');
        this.initializeStrategyDragDrop();
        this.showNotification('Strategy Builder initialized', 'success');
    }

    initializeStrategyDragDrop() {
        const components = document.querySelectorAll('.component-item');
        const dropZone = document.querySelector('.strategy-drop-zone');
        
        if (!components.length || !dropZone) return;

        components.forEach(component => {
            component.draggable = true;
            
            component.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', component.dataset.component);
                component.classList.add('dragging');
            });
            
            component.addEventListener('dragend', () => {
                component.classList.remove('dragging');
            });
        });

        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const componentType = e.dataTransfer.getData('text/plain');
                this.addStrategyComponent(componentType);
            });
        }
    }

    addStrategyComponent(type) {
        console.log(`Adding strategy component: ${type}`);
        this.showNotification(`Added ${type} to strategy`, 'success');
    }

    loadRiskMonitor() {
        console.log('Loading Risk Monitor...');
        this.updateRiskMetrics();
        this.showNotification('Risk Monitor active', 'success');
    }

    updateRiskMetrics() {
        const varElement = document.querySelector('#var-metric');
        if (varElement) {
            varElement.textContent = '-$2,845.32';
        }

        const betaElement = document.querySelector('#beta-metric');
        if (betaElement) {
            betaElement.textContent = '1.15';
        }

        const sharpeElement = document.querySelector('#sharpe-metric');
        if (sharpeElement) {
            sharpeElement.textContent = '1.67';
        }
    }

    loadTerminal() {
        console.log('Loading Terminal...');
        if (!window.sauronTerminal) {
            window.sauronTerminal = new SauronTerminal();
        }
        this.showNotification('Terminal ready', 'success');
    }

    loadSentimentAnalysis() {
        console.log('Loading Sentiment Analysis...');
        this.updateSentimentData();
        this.showNotification('Sentiment Analysis loaded', 'success');
    }

    updateSentimentData() {
        const overallSentiment = document.querySelector('#overall-sentiment');
        if (overallSentiment) {
            overallSentiment.textContent = '72%';
            overallSentiment.classList.add('positive');
        }

        const fearGreed = document.querySelector('#fear-greed-index');
        if (fearGreed) {
            fearGreed.textContent = '68';
            fearGreed.classList.add('greed');
        }
    }

    loadExecutionInterface() {
        console.log('Loading Execution Interface...');
        this.updateExecutionStatus();
        this.showNotification('Execution Interface ready', 'success');
    }

    updateExecutionStatus() {
        const activeOrders = document.querySelector('#active-orders-count');
        if (activeOrders) {
            activeOrders.textContent = '5';
        }

        const executedToday = document.querySelector('#executed-today');
        if (executedToday) {
            executedToday.textContent = '12';
        }
    }

    loadAnomalyDetection() {
        console.log('Loading Anomaly Detection...');
        this.updateAnomalyData();
        this.showNotification('Anomaly Detection active', 'success');
    }

    updateAnomalyData() {
        const anomalyList = document.querySelector('#anomaly-list');
        if (anomalyList) {
            const anomalies = [
                { type: 'Volume Spike', symbol: 'TSLA', severity: 'high', time: '2 min ago' },
                { type: 'Price Gap', symbol: 'NVDA', severity: 'medium', time: '15 min ago' },
                { type: 'Order Flow', symbol: 'AAPL', severity: 'low', time: '1 hour ago' }
            ];

            anomalyList.innerHTML = anomalies.map(anomaly => `
                <div class="anomaly-item ${anomaly.severity}">
                    <div class="anomaly-header">
                        <span class="anomaly-type">${anomaly.type}</span>
                        <span class="anomaly-symbol">${anomaly.symbol}</span>
                    </div>
                    <div class="anomaly-meta">
                        <span class="severity">${anomaly.severity}</span>
                        <span class="time">${anomaly.time}</span>
                    </div>
                </div>
            `).join('');
        }
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
        console.log('Updating dashboard data...');
    }

    updateTimeDisplays() {
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

    filterNews(filter) {
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
        
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
        if (card.id === 'portfolio-card') {
            const charts = card.querySelector('.portfolio-charts');
            if (charts) {
                charts.style.display = 'grid';
            }
        }
    } else {
        icon.className = 'fas fa-expand';
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
    
    console.log('🚀 Sauron Vision Dashboard initialized');
    
    setTimeout(() => {
        if (window.sauronDashboard) {
            window.sauronDashboard.showNotification('Market data synchronized', 'success');
        }
    }, 2000);
    
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

window.addEventListener('resize', () => {
    console.log('📐 Window resized, adjusting layouts');
    if (window.sauronDashboard) {
        window.sauronDashboard.updateScrollButtons();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SauronDashboard;
}