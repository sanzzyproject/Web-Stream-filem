document.addEventListener('DOMContentLoaded', () => {
  const movieGrid = document.getElementById('movieGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const modal = document.getElementById('movieModal');
  const closeBtn = document.querySelector('.close-btn');
  const modalBody = document.getElementById('modalBody');

  // Load Home Movies
  fetchMovies('/api/home');

  // Search Logic
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    document.querySelector('.section-title').textContent = `Hasil Pencarian: ${query}`;
    fetchMovies(`/api/search?q=${encodeURIComponent(query)}`);
  }

  async function fetchMovies(endpoint) {
    movieGrid.innerHTML = '<div class="loader"></div>';
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        renderMovies(data.results);
      } else {
        movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Tidak ada film ditemukan.</p>';
      }
    } catch (error) {
      movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:red;">Gagal memuat data.</p>';
    }
  }

  function renderMovies(movies) {
    movieGrid.innerHTML = '';
    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.onclick = () => openDetail(movie.url);
      
      const thumb = movie.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image';
      
      card.innerHTML = `
        <img src="${thumb}" alt="${movie.title}" loading="lazy">
        <div class="movie-info">
          <div class="movie-title">${movie.title}</div>
          <div class="movie-meta">
            <span>⭐ ${movie.rating || 'N/A'}</span>
            <span class="quality-badge">${movie.quality || 'HD'}</span>
          </div>
        </div>
      `;
      movieGrid.appendChild(card);
    });
  }

  async function openDetail(url) {
    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="loader" style="margin-top: 50vh;"></div>';
    
    try {
      const response = await fetch(`/api/detail?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if(data.success) {
        const detail = data.detail;
        let serversHTML = detail.servers.map(s => `<button class="server-btn">${s.name}</button>`).join('');
        
        modalBody.innerHTML = `
          <div class="detail-header">
            <img src="${detail.thumbnail}" alt="Banner">
          </div>
          <div class="detail-info">
            <h1 class="detail-title">${detail.title}</h1>
            <p class="detail-desc">${detail.description || 'Tidak ada deskripsi tersedia.'}</p>
            
            <h3>Pilih Server Nonton:</h3>
            <div class="server-list">
              ${serversHTML || '<p>Server tidak tersedia.</p>'}
            </div>
          </div>
        `;
      }
    } catch (error) {
      modalBody.innerHTML = '<p style="text-align:center; margin-top: 50vh;">Gagal memuat detail film.</p>';
    }
  }

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };
});
