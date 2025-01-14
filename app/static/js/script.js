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

function updateMarketData() {
    const marketData = [
        // Indices
        { symbol: '^IXIC', element: 'nasdaq', name: 'NASDAQ', link: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ' },
        { symbol: '^DJI', element: 'dow', name: 'DOW JONES', link: 'https://www.google.com/finance/quote/.DJI:INDEXDJX' },
        { symbol: '^GSPC', element: 'sp500', name: 'S&P 500', link: 'https://www.google.com/finance/quote/.INX:INDEXSP' },
        { symbol: '^BVSP', element: 'bovespa', name: 'BOVESPA', link: 'https://www.google.com/finance/quote/^BVSP:INDEXBVMF' },
        
        // Currencies
        { symbol: 'BRL=X', element: 'usd', name: 'USD/BRL', link: 'https://www.google.com/finance/quote/USD-BRL' },
        { symbol: 'EUR=X', element: 'eur', name: 'EUR/BRL', link: 'https://www.google.com/finance/quote/EUR-BRL' },
        
        // Commodities
        { symbol: 'CL=F', element: 'oil', name: 'OIL WTI', link: 'https://www.google.com/finance/quote/CL%3ANYMEX' }
    ];

    marketData.forEach(item => {
        fetch(`/market_data?symbol=${item.symbol}`)
            .then(response => response.json())
            .then(data => {
                const element = document.getElementById(item.element);
                if (element) {
                    // Update the HTML of the market item
                    element.innerHTML = `
                        <a href="${item.link}" target="_blank" class="market-link">
                            <span class="market-name">${item.name}</span>
                            <span class="market-value">${data.price.toFixed(2)}</span>
                            <span class="market-change ${data.change >= 0 ? 'positive' : 'negative'}">
                                ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%
                            </span>
                        </a>
                    `;
                }
            })
            .catch(error => console.error(`Error fetching ${item.symbol} data:`, error));
    });
}

// Start updating market data when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateMarketData();
    // Update market data every 30 seconds
    setInterval(updateMarketData, 30000);
});

// Time range selection handling
document.addEventListener('DOMContentLoaded', function() {
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the selected time range
            const range = this.dataset.range;
            const symbol = document.getElementById('symbol').value;
            
            if (symbol) {
                // Fetch new data for the selected time range
                fetch(`/historical_data?symbol=${symbol}&range=${range}`)
                    .then(response => response.json())
                    .then(data => {
                        // Update the chart with new data
                        updateChart(data);
                    })
                    .catch(error => console.error('Error fetching historical data:', error));
            }
        });
    });
});

// Start updating market data
updateMarketData();
// Update market data every 60 seconds
setInterval(updateMarketData, 60000);