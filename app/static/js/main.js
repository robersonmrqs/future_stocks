import { MarketDataManager } from './market.js';
import { StockSearch } from './search.js';
import stockChart from './chart.js';

// Initialize Market Data Manager
const marketManager = new MarketDataManager();
marketManager.startUpdating();

// Initialize Stock Search
const searchOptions = {
    searchInputId: 'stock-search',
    symbolInputId: 'symbol',
    resultsDivId: 'search-results',
    submitBtnId: 'submit-btn',
    clearBtnId: 'clear-btn',
    resultsSectionId: 'results-section'
};
const stockSearch = new StockSearch(searchOptions);

// Setup form submission handler
const stockForm = document.getElementById('stock-form');
stockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const symbolInput = document.getElementById('symbol');
    const symbol = symbolInput.value;
    
    if (!symbol) return;

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `symbol=${encodeURIComponent(symbol)}`
        });

        if (response.ok) {
            const resultsSection = document.getElementById('results-section');
            resultsSection.classList.remove('hidden');
            
            // Update the chart with the new symbol
            stockChart.setSymbol(symbol);
            await stockChart.fetchAndUpdateData();
        }
    } catch (error) {
        console.error('Error analyzing stock:', error);
    }
});