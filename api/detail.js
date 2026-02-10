const KlikXXIScraper = require('./scraper');

module.exports = async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL film kosong' });

    try {
        const scraper = new KlikXXIScraper();
        const result = await scraper.getDetail(url);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
