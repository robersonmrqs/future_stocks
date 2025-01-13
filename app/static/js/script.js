let searchTimeout = null;
let stockChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('stock-search');
    const symbolInput = document.getElementById('symbol');
    const resultsDiv = document.getElementById('search-results');
    const submitBtn = document.getElementById('submit-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultsSection = document.getElementById('results-section');

    // Initialize chart if historical data exists
    const historicalDataElement = document.getElementById('historical-data');
    if (historicalDataElement && historicalDataElement.dataset.values) {
        try {
            const historicalData = JSON.parse(historicalDataElement.dataset.values);
            initializeChart(historicalData);
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }

    function clearSearch() {
        searchInput.value = '';
        symbolInput.value = '';
        submitBtn.disabled = true;
        resultsDiv.style.display = 'none';
        
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
        
        if (stockChart) {
            stockChart.destroy();
            stockChart = null;
        }
        
        // Clear form
        const form = document.getElementById('stock-form');
        if (form) form.reset();
    }

    clearBtn.addEventListener('click', clearSearch);
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        symbolInput.value = '';
        submitBtn.disabled = true;
        
        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            fetch(`/search?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    resultsDiv.innerHTML = '';
                    
                    if (data.length === 0) {
                        resultsDiv.style.display = 'none';
                        return;
                    }
                    
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        div.innerHTML = `
                            <span class="symbol">${item.symbol}</span>
                            <span class="name">${item.name}</span>
                        `;
                        
                        div.addEventListener('click', () => {
                            searchInput.value = `${item.name} (${item.symbol})`;
                            symbolInput.value = item.symbol;
                            resultsDiv.style.display = 'none';
                            submitBtn.disabled = false;
                        });
                        
                        resultsDiv.appendChild(div);
                    });
                    
                    resultsDiv.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error:', error);
                    resultsDiv.style.display = 'none';
                });
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });
});

function initializeChart(historicalData) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    
    // Create dates for x-axis (last 30 days)
    const labels = Array.from({length: historicalData.length}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (historicalData.length - 1 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Destroy existing chart if it exists
    if (stockChart) {
        stockChart.destroy();
    }
    
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price (Last 30 days)',
                data: historicalData,
                borderColor: '#238636',
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
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#30363d',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e'
                    }
                },
                y: {
                    grid: {
                        color: '#30363d',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e',
                        callback: function(value) {
                            return '$ ' + value;
                        }
                    }
                }
            }
        }
    });
}