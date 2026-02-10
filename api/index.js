const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

class KlikXXIScraper {
  constructor() {
    this.baseURL = 'https://klikxxi.me';
    this.client = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile Safari/537.36) AppleWebKit/537.36 Chrome/114.0.0.0',
      }
    });
  }

  // Fungsi baru untuk mengambil film di halaman Home (Rekomendasi/Baru)
  async getHome() {
    try {
      const response = await this.client.get(`${this.baseURL}/`);
      const $ = cheerio.load(response.data);
      const results = [];

      $('#gmr-main-load .item-infinite').each((index, element) => {
        const item = $(element);
        const title = item.find('.entry-title a').text().trim();
        const url = item.find('.entry-title a').attr('href');
        let thumbnail = item.find('img').attr('data-lazy-src') || item.find('img').attr('src');
        if (thumbnail && !thumbnail.startsWith('http')) thumbnail = this.baseURL + thumbnail;
        
        const rating = item.find('.gmr-rating-item').text().replace('icon_star', '').trim();
        const quality = item.find('.gmr-quality-item').text().trim();

        if(title && url) {
            results.push({ title, url, thumbnail, rating, quality });
        }
      });
      return { success: true, results: results.slice(0, 20) }; // Ambil 20 teratas
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async search(query) {
    try {
      const params = new URLSearchParams();
      params.append('s', query);
      params.append('post_type[]', 'post');
      params.append('post_type[]', 'tv');

      const response = await this.client.get(`${this.baseURL}/`, { params });
      const $ = cheerio.load(response.data);
      const results = [];

      $('#gmr-main-load .item-infinite').each((index, element) => {
        const item = $(element);
        const title = item.find('.entry-title a').text().trim();
        const url = item.find('.entry-title a').attr('href');
        let thumbnail = item.find('img').attr('data-lazy-src') || item.find('img').attr('src');
        if (thumbnail && !thumbnail.startsWith('http')) thumbnail = this.baseURL + thumbnail;

        const rating = item.find('.gmr-rating-item').text().replace('icon_star', '').trim();
        const quality = item.find('.gmr-quality-item').text().trim();

        results.push({ title, url, thumbnail, rating, quality });
      });
      return { success: true, query, total_results: results.length, results };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getDetail(url) {
    try {
      const response = await this.client.get(url);
      const $ = cheerio.load(response.data);
      
      let thumbnail = $('.gmr-movie-data figure img').attr('data-lazy-src') || $('.gmr-movie-data figure img').attr('src');
      if (thumbnail && !thumbnail.startsWith('http')) thumbnail = this.baseURL + thumbnail;

      const detail = {
        title: $('.entry-title').text().trim(),
        thumbnail: thumbnail,
        description: $('.entry-content p').first().text().trim(),
        servers: []
      };

      // Mengambil iframe server
      $('.muvipro-player-tabs li a').each((i, el) => {
        detail.servers.push({
          name: $(el).text().trim(),
          id: $(el).attr('id')
        });
      });

      return { success: true, url, detail };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

const scraper = new KlikXXIScraper();

// Routes
app.get('/api/home', async (req, res) => {
  const data = await scraper.getHome();
  res.json(data);
});

app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });
  const data = await scraper.search(q);
  res.json(data);
});

app.get('/api/detail', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Query parameter "url" is required' });
  const data = await scraper.getDetail(url);
  res.json(data);
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app;
