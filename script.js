const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const loader = document.getElementById('loader');
const modal = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-btn');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        loader.classList.add('hidden');
        if (data.results && data.results.length > 0) {
            renderMovies(data.results);
        } else {
            resultsContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">Film tidak ditemukan.</p>';
        }
    } catch (err) {
        loader.classList.add('hidden');
        alert('Terjadi kesalahan saat mencari.');
    }
});

function renderMovies(movies) {
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${movie.thumbnail || 'https://via.placeholder.com/150x210?text=No+Image'}" alt="${movie.title}" loading="lazy">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">
                    <span>⭐ ${movie.rating || '-'}</span>
                    <span class="quality-badge">${movie.quality}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => fetchDetail(movie.url));
        resultsContainer.appendChild(card);
    });
}

async function fetchDetail(url) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<p style="text-align:center;">Memuat detail...</p>';

    try {
        const res = await fetch(`/api/detail?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        
        if(data.success) {
            const detail = data.detail;
            
            // Generate Server Links
            const serversHTML = detail.servers.map(server => 
                `<a href="${server.tabId}" target="_blank" class="server-btn">▶ Tonton di ${server.name}</a>`
            ).join('');

            // Generate Download Links
            const downloadsHTML = detail.downloadLinks.map(dl => 
                `<a href="${dl.url}" target="_blank" class="dl-btn">⬇ Download ${dl.quality} (${dl.title})</a>`
            ).join('');

            modalBody.innerHTML = `
                <div class="detail-header">
                    <img src="${detail.thumbnail}" alt="Thumbnail">
                    <div>
                        <h2 class="detail-title">${detail.title}</h2>
                        <div style="font-size:0.8rem; color:#a0a0a0; margin-bottom:5px;">
                            ⭐ ${detail.rating.value} | ⏱ ${detail.metadata.duration || '?'} | 📅 ${detail.metadata.year || '?'}
                        </div>
                        <div class="quality-badge" style="display:inline-block;">${detail.metadata.quality || 'HD'}</div>
                    </div>
                </div>
                <p class="desc">${detail.description}</p>
                
                <h3 style="margin: 15px 0 10px; font-size:1rem;">Pilih Server Nonton:</h3>
                <div class="links-container">
                    ${serversHTML || '<p>Tidak ada server streaming tersedia.</p>'}
                </div>

                <h3 style="margin: 15px 0 10px; font-size:1rem;">Link Download:</h3>
                <div class="links-container">
                    ${downloadsHTML || '<p>Tidak ada link download tersedia.</p>'}
                </div>
            `;
        }
    } catch (err) {
        modalBody.innerHTML = '<p>Gagal memuat detail film.</p>';
    }
}

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
});
