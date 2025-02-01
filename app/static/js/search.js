import { debounce } from './utils.js';

export class StockSearch {
    constructor(options) {
        this.searchInput = document.getElementById(options.searchInputId);
        this.symbolInput = document.getElementById(options.symbolInputId);
        this.resultsDiv = document.getElementById(options.resultsDivId);
        this.submitBtn = document.getElementById(options.submitBtnId);
        this.clearBtn = document.getElementById(options.clearBtnId);
        this.resultsSection = document.getElementById(options.resultsSectionId);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', debounce(e => this.handleSearch(e), 300));
        this.clearBtn.addEventListener('click', () => this.clearSearch());
        document.addEventListener('click', e => this.handleClickOutside(e));
    }

    async handleSearch(event) {
        const query = event.target.value.trim();
        
        this.symbolInput.value = '';
        this.submitBtn.disabled = true;
        
        if (query.length < 2) {
            this.resultsDiv.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.displayResults(data);
        } catch (error) {
            console.error('Search error:', error);
            this.resultsDiv.style.display = 'none';
        }
    }

    displayResults(data) {
        this.resultsDiv.innerHTML = '';
        
        if (data.length === 0) {
            this.resultsDiv.style.display = 'none';
            return;
        }
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <span class="symbol">${item.symbol}</span>
                <span class="name">${item.name}</span>
            `;
            
            div.addEventListener('click', () => this.selectResult(item));
            this.resultsDiv.appendChild(div);
        });
        
        this.resultsDiv.style.display = 'block';
    }

    selectResult(item) {
        this.searchInput.value = `${item.name} (${item.symbol})`;
        this.symbolInput.value = item.symbol;
        this.resultsDiv.style.display = 'none';
        this.submitBtn.disabled = false;
    }

    clearSearch() {
        this.searchInput.value = '';
        this.symbolInput.value = '';
        this.submitBtn.disabled = true;
        this.resultsDiv.style.display = 'none';
        
        if (this.resultsSection) {
            this.resultsSection.classList.add('hidden');
        }
    }

    handleClickOutside(event) {
        if (!this.searchInput.contains(event.target) && !this.resultsDiv.contains(event.target)) {
            this.resultsDiv.style.display = 'none';
        }
    }
}