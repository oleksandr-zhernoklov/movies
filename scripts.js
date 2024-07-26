document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    displaySeriesFromLocalStorage();
    displayWatchlistFromLocalStorage();
});

function searchMovie() {
    const query = document.getElementById('search').value.trim();
    if (query === "") return alert("Please enter a search query.");

    fetch(`https://api.themoviedb.org/3/search/movie?api_key=fb70d4fb95572e0ddd9bc99f90734e46&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                genre: movie.genre_ids.join(", "), // Adjust according to your genre handling
                year: movie.release_date.split('-')[0],
                length: movie.runtime ? `${movie.runtime} minutes` : "N/A",
                rating: movie.vote_average ? `${movie.vote_average}/10` : "N/A",
                description: movie.overview,
                director: getMovieCredits(movie.id).director || "N/A",
                actors: getMovieCredits(movie.id).actors.join(", ") || "N/A",
                review: "N/A", // Reviews to be fetched separately if needed
                trailer: getMovieVideos(movie.id).trailer || "N/A", // Trailer URL
                tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                imdbLink: `https://www.imdb.com/title/${movie.id}`, // Adjust according to your handling
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(movie.title)}`
            }));

            localStorage.setItem('movies', JSON.stringify(movies));
            displayMoviesFromLocalStorage();
        })
        .catch(error => console.error('Error fetching movie data:', error));
}

function searchSeries() {
    const query = document.getElementById('search').value.trim();
    if (query === "") return alert("Please enter a search query.");

    fetch(`https://api.themoviedb.org/3/search/tv?api_key=fb70d4fb95572e0ddd9bc99f90734e46&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const series = data.results.map(seriesItem => ({
                id: seriesItem.id,
                title: seriesItem.name,
                genre: seriesItem.genre_ids.join(", "), // Adjust according to your genre handling
                year: seriesItem.first_air_date.split('-')[0],
                length: "N/A", // Series length handling can be more complex
                rating: seriesItem.vote_average ? `${seriesItem.vote_average}/10` : "N/A",
                description: seriesItem.overview,
                director: getSeriesCredits(seriesItem.id).director || "N/A",
                actors: getSeriesCredits(seriesItem.id).actors.join(", ") || "N/A",
                review: "N/A", // Reviews to be fetched separately if needed
                trailer: getSeriesVideos(seriesItem.id).trailer || "N/A", // Trailer URL
                tmdbLink: `https://www.themoviedb.org/tv/${seriesItem.id}`,
                imdbLink: `https://www.imdb.com/title/${seriesItem.id}`, // Adjust according to your handling
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(seriesItem.name)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(seriesItem.name)}`
            }));

            localStorage.setItem('series', JSON.stringify(series));
            displaySeriesFromLocalStorage();
        })
        .catch(error => console.error('Error fetching series data:', error));
}

function getMovieCredits(movieId) {
    return fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=fb70d4fb95572e0ddd9bc99f90734e46`)
        .then(response => response.json())
        .then(data => ({
            director: data.crew.find(person => person.job === 'Director')?.name || "N/A",
            actors: data.cast.slice(0, 5).map(person => person.name) // First 5 actors
        }))
        .catch(error => console.error('Error fetching movie credits:', error));
}

function getSeriesCredits(seriesId) {
    return fetch(`https://api.themoviedb.org/3/tv/${seriesId}/credits?api_key=fb70d4fb95572e0ddd9bc99f90734e46`)
        .then(response => response.json())
        .then(data => ({
            director: data.crew.find(person => person.job === 'Director')?.name || "N/A",
            actors: data.cast.slice(0, 5).map(person => person.name) // First 5 actors
        }))
        .catch(error => console.error('Error fetching series credits:', error));
}

function getMovieVideos(movieId) {
    return fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=fb70d4fb95572e0ddd9bc99f90734e46`)
        .then(response => response.json())
        .then(data => ({
            trailer: data.results.find(video => video.type === 'Trailer') ? `https://www.youtube.com/watch?v=${data.results.find(video => video.type === 'Trailer').key}` : "N/A"
        }))
        .catch(error => console.error('Error fetching movie videos:', error));
}

function getSeriesVideos(seriesId) {
    return fetch(`https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=fb70d4fb95572e0ddd9bc99f90734e46`)
        .then(response => response.json())
        .then(data => ({
            trailer: data.results.find(video => video.type === 'Trailer') ? `https://www.youtube.com/watch?v=${data.results.find(video => video.type === 'Trailer').key}` : "N/A"
        }))
        .catch(error => console.error('Error fetching series videos:', error));
}

function displayMoviesFromLocalStorage() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const tbody = document.querySelector('#movieTable tbody');
    tbody.innerHTML = '';

    movies.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${movie.poster}" alt="${movie.title}" class="poster"></td>
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.year}</td>
            <td>${movie.length}</td>
            <td>${movie.rating}</td>
            <td class="collapsible">${movie.description}</td>
            <td>${movie.director}</td>
            <td class="collapsible">${movie.actors}</td>
            <td class="collapsible">${movie.review}</td>
            <td><a href="${movie.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${movie.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${movie.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${movie.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${movie.trailer}" target="_blank">Trailer</a></td>
            <td><button class="button" onclick="removeItem('${movie.id}', 'movie')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelector('#movieCount').textContent = `Total Movies: ${movies.length}`;
}

function displaySeriesFromLocalStorage() {
    const series = JSON.parse(localStorage.getItem('series')) || [];
    const tbody = document.querySelector('#seriesTable tbody');
    tbody.innerHTML = '';

    series.forEach((seriesItem, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${seriesItem.poster}" alt="${seriesItem.title}" class="poster"></td>
            <td>${seriesItem.title}</td>
            <td>${seriesItem.genre}</td>
            <td>${seriesItem.year}</td>
            <td>${seriesItem.length}</td>
            <td>${seriesItem.rating}</td>
            <td class="collapsible">${seriesItem.description}</td>
            <td>${seriesItem.director}</td>
            <td class="collapsible">${seriesItem.actors}</td>
            <td class="collapsible">${seriesItem.review}</td>
            <td><a href="${seriesItem.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${seriesItem.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${seriesItem.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${seriesItem.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${seriesItem.trailer}" target="_blank">Trailer</a></td>
            <td><button class="button" onclick="removeItem('${seriesItem.id}', 'series')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelector('#seriesCount').textContent = `Total Series: ${series.length}`;
}

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
            <td><button class="button" onclick="removeItem('${item.id}', 'watchlist')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelector('#watchlistCount').textContent = `Total Watchlist Items: ${watchlist.length}`;
}

function removeItem(id, type) {
    const items = JSON.parse(localStorage.getItem(type)) || [];
    const updatedItems = items.filter(item => item.id !== id);

    localStorage.setItem(type, JSON.stringify(updatedItems));

    if (type === 'movies') displayMoviesFromLocalStorage();
    else if (type === 'series') displaySeriesFromLocalStorage();
    else if (type === 'watchlist') displayWatchlistFromLocalStorage();
}
