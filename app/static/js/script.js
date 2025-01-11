let searchTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('stock-search');
    const symbolInput = document.getElementById('symbol');
    const resultsDiv = document.getElementById('search-results');
    const submitBtn = document.getElementById('submit-btn');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Clear symbol and disable button when input changes
        symbolInput.value = '';
        submitBtn.disabled = true;
        
        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        // Set new timeout for search
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
        }, 300); // Wait 300ms after user stops typing
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });

    // Initialize chart function
    window.initializeChart = function(historicalData) {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        const labels = Array.from({length: historicalData.length}, (_, i) => i + 1);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Preço nos últimos 30 dias',
                    data: historicalData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    };
});