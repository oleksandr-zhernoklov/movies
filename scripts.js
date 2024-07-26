document.addEventListener('DOMContentLoaded', () => {
    displayMoviesAndSeriesFromLocalStorage();
    displayWatchlistFromLocalStorage();
    document.querySelector('#search').focus();
});

// Add a button to add items to the watchlist
async function searchMovieOrSeries() {
    let searchTerm = document.querySelector('#search').value.trim();
    const isSeries = document.querySelector('#searchType').value === 'series';

    if (searchTerm.startsWith('.')) {
        searchTerm = searchTerm.substring(1).trim();
        document.querySelector('#search').value = searchTerm;
    }

    if (searchTerm.length === 0) {
        alert('Please enter a name.');
        return;
    }

    try {
        const searchUrl = isSeries 
            ? `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchTerm)}`
            : `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(searchTerm)}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const item = data.results[0];
            const itemId = item.id;
            const detailsUrl = isSeries 
                ? `https://api.themoviedb.org/3/tv/${itemId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`
                : `https://api.themoviedb.org/3/movie/${itemId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;

            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            const videosUrl = isSeries 
                ? `https://api.themoviedb.org/3/tv/${itemId}/videos?api_key=${tmdbApiKey}`
                : `https://api.themoviedb.org/3/movie/${itemId}/videos?api_key=${tmdbApiKey}`;
                
            const videosResponse = await fetch(videosUrl);
            const videosData = await videosResponse.json();
            const trailer = videosData.results.find(video => video.type === 'Trailer');
            const trailerLink = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';

            const itemData = {
                id: itemId,
                poster: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
                title: item.name || item.title,
                genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
                year: (item.release_date || item.first_air_date)?.split('-')[0] || 'N/A',
                length: detailsData.runtime ? `${detailsData.runtime} min` : 'N/A',
                rating: item.vote_average || 'N/A',
                description: item.overview || 'N/A',
                director: detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
                actors: detailsData.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A',
                review: detailsData.reviews.results[0]?.content || 'N/A',
                tmdbLink: `https://www.themoviedb.org/${isSeries ? 'tv' : 'movie'}/${itemId}`,
                imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : 'N/A',
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(item.title || item.name)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(item.title || item.name)}`,
                trailer: trailerLink,
                type: isSeries ? 'Series' : 'Movie'
            };

            if (!isDuplicateItem(itemId, isSeries)) {
                saveItemToLocalStorage(itemData);
                displayMoviesAndSeriesFromLocalStorage();
                displaySummary(itemData);
            } else {
                alert('Item already exists in the list.');
            }
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert('Error fetching data.');
    }

    document.querySelector('#search').focus();
}

// Save item to local storage
function saveItemToLocalStorage(itemData) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(itemData);
    localStorage.setItem('items', JSON.stringify(items));
}

// Check for duplicates
function isDuplicateItem(itemId, isSeries) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    return items.some(item => item.id === parseInt(itemId) && item.type === (isSeries ? 'Series' : 'Movie'));
}

// Display items from local storage
function displayMoviesAndSeriesFromLocalStorage() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const tbody = document.querySelector('#itemTable tbody');
    tbody.innerHTML = '';

    items.forEach((item, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${item.poster}" alt="${item.title}" class="poster"></td>
            <td>${item.title}</td>
            <td>${item.genre}</td>
            <td>${item.year}</td>
            <td>${item.length}</td>
            <td>${item.rating}</td>
            <td class="collapsible">${item.description}</td>
            <td>${item.director}</td>
            <td class="collapsible">${item.actors}</td>
            <td class="collapsible">${item.review}</td>
            <td><a href="${item.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${item.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${item.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${item.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${item.trailer}" target="_blank">Trailer</a></td>
            <td>
                <button class="button" onclick="addToWatchlist(${item.id})">Add to Watchlist</button>
                <button class="button" onclick="removeItem(${item.id})">Remove</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    document.querySelector('#rowCount').textContent = `Total Items: ${items.length}`;
}

// Display watchlist from local storage
function displayWatchlistFromLocalStorage() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const tbody = document.querySelector('#watchlistTable tbody');
    tbody.innerHTML = '';

    watchlist.forEach((item, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${item.poster}" alt="${item.title}" class="poster"></td>
            <td>${item.title}</td>
            <td>${item.genre}</td>
            <td>${item.year}</td>
            <td>${item.length}</td>
            <td>${item.rating}</td>
            <td class="collapsible">${item.description}</td>
            <td>${item.director}</td>
            <td class="collapsible">${item.actors}</td>
            <td class="collapsible">${item.review}</td>
            <td><a href="${item.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${item.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${item.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${item.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${item.trailer}" target="_blank">Trailer</a></td>
            <td>
                <button class="button" onclick="removeFromWatchlist(${item.id})">Remove from Watchlist</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    document.querySelector('#watchlistCount').textContent = `Watchlist Items: ${watchlist.length}`;
}

// Add item to watchlist
function addToWatchlist(itemId) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    const item = items.find(item => item.id === itemId);
    if (item && !watchlist.some(wlItem => wlItem.id === itemId)) {
        watchlist.push(item);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlistFromLocalStorage();
    } else {
        alert('Item is already in the watchlist or not found.');
    }
}

// Remove item from watch
