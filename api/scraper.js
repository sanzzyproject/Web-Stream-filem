const axios = require('axios');
const cheerio = require('cheerio');

class KlikXXIScraper {
    constructor() {
        this.baseURL = 'https://klikxxi.me';
        this.client = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
    }

    // ... [Masukkan seluruh fungsi async search(), async getDetail(), extractYear(), extractQualityFromText() dari kodemu di sini] ...
    // HAPUS bagian (async () => { ... })(); di paling bawah karena kita akan memanggilnya lewat API.
}

module.exports = KlikXXIScraper;
``` *(Catatan: Masukkan *methods* dari kodemu ke dalam *class* di atas).*

**`api/search.js`** (Endpoint untuk mencari film)
```javascript
const KlikXXIScraper = require('./scraper');

module.exports = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query pencarian kosong' });

    try {
        const scraper = new KlikXXIScraper();
        const result = await scraper.search(q);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
