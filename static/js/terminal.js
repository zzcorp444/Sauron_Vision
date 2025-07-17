// static/js/terminal.js
class SauronTerminal {
    constructor() {
        this.commands = {
            help: this.showHelp.bind(this),
            clear: this.clearTerminal.bind(this),
            status: this.showStatus.bind(this),
            scan: this.scanMarket.bind(this),
            portfolio: this.showPortfolio.bind(this),
            alerts: this.showAlerts.bind(this),
            strategy: this.strategyCommand.bind(this),
            risk: this.riskCommand.bind(this),
            news: this.newsCommand.bind(this),
            price: this.priceCommand.bind(this),
            analyze: this.analyzeCommand.bind(this),
            exit: this.exitCommand.bind(this),
        };
        
        this.commandHistory = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        this.outputEl = document.getElementById('terminal-output');
        this.inputEl = document.getElementById('terminal-input');
        
        if (this.inputEl) {
            this.inputEl.addEventListener('keydown', this.handleKeydown.bind(this));
            this.inputEl.focus();
        }
        
        // Terminal control buttons
        const clearBtn = document.getElementById('clear-terminal');
        const helpBtn = document.getElementById('terminal-help');
        
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearTerminal());
        if (helpBtn) helpBtn.addEventListener('click', () => this.showHelp());
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                this.autocomplete();
                break;
        }
    }

    executeCommand() {
        const input = this.inputEl.value.trim();
        if (!input) return;
        
        // Add to history
        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;
        
        // Display command
        this.addOutput(`${this.getPrompt()} ${input}`, 'command');
        
        // Parse and execute command
        const [command, ...args] = input.split(' ');
        const cmd = command.toLowerCase();
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
        }
        
        // Clear input
        this.inputEl.value = '';
        this.scrollToBottom();
    }

    navigateHistory(direction) {
        const newIndex = this.historyIndex + direction;
        if (newIndex >= 0 && newIndex < this.commandHistory.length) {
            this.historyIndex = newIndex;
            this.inputEl.value = this.commandHistory[this.historyIndex];
        } else if (newIndex === this.commandHistory.length) {
            this.historyIndex = newIndex;
            this.inputEl.value = '';
        }
    }

    autocomplete() {
        const input = this.inputEl.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            this.inputEl.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutput(`Available commands: ${matches.join(', ')}`, 'info');
        }
    }

    addOutput(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;
        
        const system = document.createElement('span');
        system.className = 'system';
        system.textContent = type.toUpperCase();
        
        const messageEl = document.createElement('span');
        messageEl.className = 'message';
        messageEl.innerHTML = message;
        
        line.appendChild(timestamp);
        line.appendChild(system);
        line.appendChild(messageEl);
        
        this.outputEl.appendChild(line);
        this.scrollToBottom();
    }

    getPrompt() {
        return `${document.querySelector('.terminal-prompt').textContent}`;
    }

    scrollToBottom() {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    // Command implementations
    showHelp() {
        const helpText = `
            <div style="margin-bottom: 1rem;">
                <strong>SAURON VISION TERMINAL COMMANDS</strong>
            </div>
            <div style="margin-left: 1rem;">
                <div><strong>help</strong> - Show this help message</div>
                <div><strong>clear</strong> - Clear terminal output</div>
                <div><strong>status</strong> - Show system status</div>
                <div><strong>scan [symbol]</strong> - Scan market or specific symbol</div>
                <div><strong>portfolio</strong> - Show portfolio information</div>
                <div><strong>alerts</strong> - Show active alerts</div>
                <div><strong>strategy [list|create|run]</strong> - Strategy management</div>
                <div><strong>risk</strong> - Show risk metrics</div>
                <div><strong>news [symbol]</strong> - Get latest news</div>
                <div><strong>price [symbol]</strong> - Get current price</div>
                <div><strong>analyze [symbol]</strong> - Analyze symbol</div>
                <div><strong>exit</strong> - Exit terminal</div>
            </div>
        `;
        this.addOutput(helpText, 'info');
    }

    clearTerminal() {
        this.outputEl.innerHTML = '';
        this.addOutput('Terminal cleared. The eye sees with clarity.', 'success');
    }

    showStatus() {
        const statusText = `
            <div style="color: var(--primary-text);">
                <strong>SAURON VISION STATUS</strong><br>
                System: <span style="color: var(--primary-text);">ONLINE</span><br>
                Market Connection: <span style="color: var(--primary-text);">ACTIVE</span><br>
                Strategies Running: <span style="color: var(--secondary-text);">3</span><br>
                Alerts Active: <span style="color: var(--warning-text);">2</span><br>
                Last Update: <span style="color: var(--tertiary-text);">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        this.addOutput(statusText, 'success');
    }

    scanMarket(args) {
        const symbol = args[0];
        if (symbol) {
            this.addOutput(`Scanning ${symbol.toUpperCase()}...`, 'info');
            // Simulate API call
            setTimeout(() => {
                this.addOutput(`
                    <div style="color: var(--primary-text);">
                        <strong>${symbol.toUpperCase()} SCAN RESULTS</strong><br>
                        Price: $150.25 (+1.25%)<br>
                        Volume: 1,234,567<br>
                        RSI: 68.5<br>
                        Signal: <span style="color: var(--primary-text);">BUY</span>
                    </div>
                `, 'success');
            }, 1500);
        } else {
            this.addOutput('Scanning market...', 'info');
            setTimeout(() => {
                this.addOutput(`
                    <div style="color: var(--primary-text);">
                        <strong>MARKET SCAN RESULTS</strong><br>
                        Winners: AAPL (+2.1%), MSFT (+1.8%), GOOGL (+1.2%)<br>
                        Losers: TSLA (-1.5%), AMZN (-0.8%), NVDA (-0.5%)<br>
                        Volume Leaders: AAPL, TSLA, SPY<br>
                        Active Alerts: 5 signals detected
                    </div>
                `, 'success');
            }, 2000);
        }
    }

    showPortfolio() {
        this.addOutput('Loading portfolio...', 'info');
        setTimeout(() => {
            this.addOutput(`
                <div style="color: var(--primary-text);">
                    <strong>PORTFOLIO OVERVIEW</strong><br>
                    Total Value: $125,847.32<br>
                    Today's P&L: <span style="color: var(--primary-text);">+$2,156.78 (+1.74%)</span><br>
                    Positions: 8 active<br>
                    Cash: $15,234.56<br>
                    Margin Used: 45.2%
                </div>
            `, 'success');
        }, 1000);
    }

    showAlerts() {
        this.addOutput(`
            <div style="color: var(--primary-text);">
                <strong>ACTIVE ALERTS</strong><br>
                <span style="color: var(--warning-text);">⚠️ TSLA RSI oversold (28.5)</span><br>
                <span style="color: var(--primary-text);">🔔 AAPL breakout above resistance</span><br>
                <span style="color: var(--error-text);">⚠️ Portfolio risk limit reached</span>
            </div>
        `, 'info');
    }

    strategyCommand(args) {
        const action = args[0];
        switch(action) {
            case 'list':
                this.addOutput(`
                    <div style="color: var(--primary-text);">
                        <strong>ACTIVE STRATEGIES</strong><br>
                        1. Mean Reversion - Running<br>
                        2. Momentum Breakout - Paused<br>
                        3. Pairs Trading - Running<br>
                        4. RSI Divergence - Running
                    </div>
                `, 'info');
                break;
            case 'create':
                this.addOutput('Strategy builder launched. Check Strategy Builder tab.', 'success');
                break;
            case 'run':
                this.addOutput('All strategies activated. The eye watches all.', 'success');
                break;
            default:
                this.addOutput('Usage: strategy [list|create|run]', 'error');
        }
    }

    riskCommand() {
        this.addOutput(`
            <div style="color: var(--primary-text);">
                <strong>RISK METRICS</strong><br>
                Portfolio Beta: 1.15<br>
                VaR (1 day): -$2,845.32<br>
                Sharpe Ratio: 1.67<br>
                Max Drawdown: -8.5%<br>
                Risk Score: <span style="color: var(--warning-text);">Medium</span>
            </div>
        `, 'info');
    }

    newsCommand(args) {
        const symbol = args[0] || 'market';
        this.addOutput(`Fetching latest news for ${symbol}...`, 'info');
        setTimeout(() => {
            this.addOutput(`
                <div style="color: var(--primary-text);">
                    <strong>LATEST NEWS</strong><br>
                    • Fed announces rate decision - 2m ago<br>
                    • Tech stocks surge on AI optimism - 15m ago<br>
                    • Oil prices climb on supply concerns - 1h ago<br>
                    • Earnings season kicks off next week - 2h ago
                </div>
            `, 'success');
        }, 1000);
    }

    priceCommand(args) {
        const symbol = args[0];
        if (!symbol) {
            this.addOutput('Usage: price [symbol]', 'error');
            return;
        }
        
        this.addOutput(`Fetching price for ${symbol.toUpperCase()}...`, 'info');
        setTimeout(() => {
            this.addOutput(`
                <div style="color: var(--primary-text);">
                    <strong>${symbol.toUpperCase()}</strong><br>
                    Current: $150.25<br>
                    Change: <span style="color: var(--primary-text);">+$1.25 (+0.84%)</span><br>
                    Volume: 1,234,567<br>
                    Last Update: ${new Date().toLocaleTimeString()}
                </div>
            `, 'success');
        }, 800);
    }

    analyzeCommand(args) {
        const symbol = args[0];
        if (!symbol) {
            this.addOutput('Usage: analyze [symbol]', 'error');
            return;
        }
        
        this.addOutput(`Running deep analysis on ${symbol.toUpperCase()}...`, 'info');
        setTimeout(() => {
            this.addOutput(`
                <div style="color: var(--primary-text);">
                    <strong>${symbol.toUpperCase()} ANALYSIS</strong><br>
                    Technical: <span style="color: var(--primary-text);">BULLISH</span><br>
                    Sentiment: <span style="color: var(--primary-text);">POSITIVE (0.72)</span><br>
                    Support: $148.50<br>
                    Resistance: $152.80<br>
                    Recommendation: <span style="color: var(--primary-text);">BUY</span><br>
                    Target: $165.00
                </div>
            `, 'success');
        }, 2000);
    }

    exitCommand() {
        this.addOutput('Exiting terminal... The eye never closes.', 'info');
        setTimeout(() => {
            document.querySelector('[data-section="overview"]').click();
        }, 1000);
    }
}

// Initialize terminal when loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('terminal-input')) {
        window.sauronTerminal = new SauronTerminal();
    }
});