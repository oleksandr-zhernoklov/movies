document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    document.querySelector('#search').addEventListener('input', () => searchMovie());
});

function searchMovie() {
    let movieName = document.querySelector('#search').value.trim();
    if (movieName.startsWith('.')) {
        movieName = movieName.substring(1).trim();
        document.querySelector('#search').value = movieName;
    }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const results = data.results;
            results.forEach(result => {
                if (result.media_type === 'movie' || result.media_type === 'tv') {
                    const movieData = {
                        id: result.id,
                        title: result.title || result.name,
                        genre: result.genre_ids ? result.genre_ids.join(', ') : 'N/A',
                        year: result.release_date ? result.release_date.split('-')[0] : 'N/A',
                        length: result.runtime ? `${result.runtime} min` : 'N/A',
                        rating: result.vote_average || 'N/A',
                        description: result.overview || 'N/A',
                        director: 'N/A', // To be backfilled
                        actors: 'N/A', // To be backfilled
                        review: 'N/A', // To be backfilled
                        type: result.media_type === 'movie' ? 'Movie' : 'Series',
                        poster: result.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : 'N/A',
                        tmdbLink: `https://www.themoviedb.org/${result.media_type}/${result.id}`,
                        imdbLink: `https://www.imdb.com/title/${result.imdb_id || 'N/A'}`,
                        tolokaLink: `https://toloka.to/tracker.php?nm=${result.title || result.name}`,
                        rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${result.title || result.name}`,
                        trailer: 'N/A'
                    };

                    if (!isDuplicateMovie(movieData.id)) {
                        addMovieToLocalStorage(movieData);
                        displayMoviesFromLocalStorage();
                    } else {
                        alert('Movie or Series already exists in the list.');
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching movie data:', error));
}

function filterByType() {
    const type = document.querySelector('#typeFilter').value;
    displayMoviesFromLocalStorage(type);
}

function displayMoviesFromLocalStorage(filterType = 'all') {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const tbody = document.querySelector('#movieTable tbody');
    tbody.innerHTML = '';

    movies
        .filter(movie => filterType === 'all' || movie.type.toLowerCase() === filterType)
        .forEach((movie, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${movie.poster}" class="poster" alt="${movie.title} poster"></td>
                <td>${movie.title}</td>
                <td>${movie.genre}</td>
                <td>${movie.year}</td>
                <td>${movie.length}</td>
                <td>${movie.rating}</td>
                <td class="collapsible">${movie.description}</td>
                <td>${movie.director}</td>
                <td class="collapsible">${movie.actors}</td>
                <td class="collapsible">${movie.review}</td>
                <td>${movie.type}</td>
                <td><a href="${movie.tmdbLink}" target="_blank">TMDB</a></td>
                <td><a href="${movie.imdbLink}" target="_blank">IMDb</a></td>
                <td><a href="${movie.tolokaLink}" target="_blank">Toloka</a></td>
                <td><a href="${movie.rutrackerLink}" target="_blank">Rutracker</a></td>
                <td><a href="${movie.trailer}" target="_blank">Trailer</a></td>
                <td><button class="button" onclick="removeMovie(${movie.id})">Remove</button></td>
            `;
            tbody.appendChild(row);
        });

    document.querySelector('#rowCount').textContent = `Total Movies: ${movies.length}`;
}

function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === parseInt(movieId));
}
