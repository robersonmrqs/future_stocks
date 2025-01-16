export class StockChart {
    constructor() {
        this.chart = null;
        this.currentRange = '30'; // Default to 30 days
        this.currentSymbol = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(button => {
            button.addEventListener('click', () => this.handleTimeRangeChange(button));
        });
    }

    async handleTimeRangeChange(button) {
        if (!this.currentSymbol) return;

        // Update active button
        document.querySelectorAll('.time-btn').forEach(btn => 
            btn.classList.remove('active'));
        button.classList.add('active');

        // Update chart data
        const range = button.dataset.range;
        this.currentRange = range;
        await this.fetchAndUpdateData();
    }

    async fetchAndUpdateData() {
        try {
            const response = await fetch(
                `/historical_data?symbol=${this.currentSymbol}&range=${this.currentRange}`
            );
            const data = await response.json();
            this.updateChart(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }

    updateChart(historicalData) {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = this.createTimeLabels(historicalData.length);
        this.chart = new Chart(ctx, this.createChartConfig(labels, historicalData));
    }

    createTimeLabels(length) {
        return Array.from({length}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (length - 1 - i));
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        });
    }

    createChartConfig(labels, data) {
        return {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Stock Price',
                    data,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(35, 134, 54, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: { color: 'var(--text-color)' }
                    },
                    tooltip: {
                        backgroundColor: 'var(--surface-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        titleColor: 'var(--text-color)',
                        bodyColor: 'var(--text-color)',
                        displayColors: false,
                        callbacks: {
                            label: (context) => `$ ${context.raw.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: { color: 'var(--text-secondary)' }
                    },
                    y: {
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            callback: value => `$ ${value}`
                        }
                    }
                }
            }
        };
    }

    setSymbol(symbol) {
        this.currentSymbol = symbol;
    }
}

// Initialize chart instance
const stockChart = new StockChart();
export default stockChart;