export class StockChart {
    constructor() {
        this.chart = null;
        this.currentRange = '1d';
        this.currentSymbol = null;
        this.chartConfig = {
            type: 'line',
            options: this.getChartOptions()
        };
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#161b22',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    displayColors: false,
                    padding: 12,
                    callbacks: {
                        label: (context) => `$ ${context.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#30363d',
                        drawBorder: false,
                        display: false
                    },
                    ticks: {
                        color: '#8b949e',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: '#30363d',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e',
                        callback: value => `$ ${value.toFixed(2)}`
                    }
                }
            }
        };
    }

    async initializeChart(data) {
        try {
            const canvas = document.getElementById('stock-chart');
            if (!canvas) throw new Error('Canvas element not found');
            
            this.setupEventListeners();
            await this.updateChart(data);
        } catch (error) {
            console.error('Error initializing chart:', error);
            throw error;
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.time-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const range = button.dataset.range;
                if (range && this.currentSymbol) {
                    await this.updateTimeRange(range, button);
                }
            });
        });
    }

    async updateTimeRange(range, button) {
        try {
            document.querySelectorAll('.time-btn').forEach(btn => 
                btn.classList.remove('active'));
            button.classList.add('active');
            
            this.currentRange = range;
            const data = await this.fetchHistoricalData();
            await this.updateChart(data);
        } catch (error) {
            console.error('Error updating time range:', error);
        }
    }

    async fetchHistoricalData() {
        const response = await fetch(
            `/api/historical_data?symbol=${encodeURIComponent(this.currentSymbol)}&range=${this.currentRange}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    async updateChart(data) {
        if (!data || !data.prices) return;

        const canvas = document.getElementById('stock-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = {
            labels: data.dates || this.createTimeLabels(data.prices.length),
            datasets: [{
                label: 'Stock Price',
                data: data.prices,
                borderColor: '#6e40c9',
                backgroundColor: 'rgba(110, 64, 201, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHitRadius: 20,
                tension: 0.4,
                fill: true
            }]
        };

        this.chart = new Chart(ctx, {
            ...this.chartConfig,
            data: chartData
        });
    }

    setSymbol(symbol) {
        this.currentSymbol = symbol;
    }
}

export default new StockChart();