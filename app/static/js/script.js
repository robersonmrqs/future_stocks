function initializeChart(historicalData) {
    // Clear any existing chart
    const chartElement = document.getElementById('stock-chart');
    if (window.stockChart) {
        window.stockChart.destroy();
    }
    
    const ctx = chartElement.getContext('2d');
    
    // Parse the data if it's a string
    const data = typeof historicalData === 'string' ? JSON.parse(historicalData) : historicalData;
    
    // Calculate min and max for better scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const padding = (maxValue - minValue) * 0.1;
    
    const labels = Array.from({length: data.length}, (_, i) => `Dia ${i + 1}`);
    
    window.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Preço de Fechamento (últimos 30 dias)',
                data: data,
                backgroundColor: 'rgba(75, 192, 75, 0.2)',
                borderColor: 'rgba(75, 192, 75, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(75, 192, 75, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75, 192, 75, 1)',
                pointHoverBorderWidth: 2
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
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `Preço: R$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: Math.max(0, minValue - padding),
                    max: maxValue + padding,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}