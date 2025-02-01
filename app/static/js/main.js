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
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');

    if (!symbol) return;

    try {
        // Show loading indicator if it exists
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        
        // First, get the updated HTML content
        const htmlResponse = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `symbol=${encodeURIComponent(symbol)}`
        });
        
        if (!htmlResponse.ok) {
            throw new Error('Failed to fetch updated HTML');
        }

        const htmlText = await htmlResponse.text();
        
        // Parse the HTML to get the new results section
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const newResultsSection = doc.getElementById('results-section');

        if (!newResultsSection) {
            throw new Error('Could not find results section in response');
        }

        // Update the results section content
        resultsSection.innerHTML = newResultsSection.innerHTML;
        resultsSection.classList.remove('hidden');

        // Now get the data for the chart
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `symbol=${encodeURIComponent(symbol)}`
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data) {
            await new Promise(resolve => setTimeout(resolve, 100));
        
            stockChart.setSymbol(symbol);  // Define o símbolo ANTES de inicializar o gráfico
            await stockChart.initializeChart({
                prices: data.data.historical_values,
                dates: data.data.dates || []
            });
        }
    } catch (error) {
        console.error('Error analyzing stock:', error);
        alert('An error occurred while analyzing the stock. Please try again.');
    } finally {
        // Hide loading indicator
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
});