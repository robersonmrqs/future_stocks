export class MarketDataManager {
    constructor() {
        this.marketData = [
            { symbol: '^IXIC', element: 'nasdaq', name: 'NASDAQ', link: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ' },
            { symbol: '^DJI', element: 'dow', name: 'DOW JONES', link: 'https://www.google.com/finance/quote/.DJI:INDEXDJX' },
            { symbol: '^GSPC', element: 'sp500', name: 'S&P 500', link: 'https://www.google.com/finance/quote/.INX:INDEXSP' },
            { symbol: '^BVSP', element: 'bovespa', name: 'BOVESPA', link: 'https://www.google.com/finance/quote/^BVSP:INDEXBVMF' },
            { symbol: 'BRL=X', element: 'usd', name: 'USD/BRL', link: 'https://www.google.com/finance/quote/USD-BRL' },
            { symbol: 'EUR=X', element: 'eur', name: 'EUR/BRL', link: 'https://www.google.com/finance/quote/EUR-BRL' },
            { symbol: 'CL=F', element: 'oil', name: 'OIL WTI', link: 'https://www.google.com/finance/quote/CL%3ANYMEX' }
        ];
    }

    async updateMarketData() {
        for (const item of this.marketData) {
            try {
                const response = await fetch(`/api/market_data?symbol=${item.symbol}`);
                const data = await response.json();
                this.updateMarketItem(item, data);
            } catch (error) {
                console.error(`Error fetching ${item.symbol} data:`, error);
            }
        }
    }

    updateMarketItem(item, data) {
        const element = document.getElementById(item.element);
        if (element) {
            element.innerHTML = this.createMarketItemHTML(item, data);
        }
    }

    createMarketItemHTML(item, data) {
        return `
            <a href="${item.link}" target="_blank" class="market-link">
                <div class="market-card">
                    <span class="market-name">${item.name}</span>
                    <span class="market-value">${data.price.toFixed(2)}</span>
                    <span class="market-change ${data.change >= 0 ? 'positive' : 'negative'}">
                        ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%
                    </span>
                </div>
            </a>
        `;
    }

    startUpdating(interval = 60000) {
        this.updateMarketData();
        setInterval(() => this.updateMarketData(), interval);
    }
}