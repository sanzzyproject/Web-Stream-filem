const KlikXXIScraper = require('./scraper');

module.exports = async (req, res) => {
    // Mengambil query 'q' dari URL (contoh: /api/search?q=moving)
    const { q } = req.query; 
    
    if (!q) {
        return res.status(400).json({ success: false, message: 'Query pencarian kosong' });
    }

    try {
        const scraper = new KlikXXIScraper();
        const result = await scraper.search(q);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
