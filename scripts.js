document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    document.querySelector('#search').focus();
});

const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';

async function searchMovie() {
    let movieName = document.querySelector('#search').value.trim();
    if (movieName.startsWith('.')) {
        movieName = movieName.substring(1).trim();
        document.querySelector('#search').value = movieName;
    }

    if (movieName === '') {
        console.log('Search query is empty.');
        return;
    }

    try {
        console.log(`Searching for movie: ${movieName}`);
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`);
        const data = await response.json();
        console.log(`Search results received: ${JSON.stringify(data)}`);

        if (data.results.length > 0) {
            const movie = data.results[0]; // Assuming we are interested in the first result
            const movieData = {
                id: movie.id,
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                title: movie.title,
                genre: movie.genre_ids.join(', '), // Assuming genre IDs will be mapped to names
                year: new Date(movie.release_date).getFullYear(),
                length: 'N/A', // Length is not available in search results
                rating: movie.vote_average,
                description: movie.overview,
                director: 'N/A', // Director info is not available in search results
                actors: 'N/A', // Actors info is not available in search results
                review: 'N/A', // Review info is not available in search results
                tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                imdbLink: `https://www.imdb.com/title/${movie.imdb_id}`,
                tolokaLink: 'N/A', // Assuming Toloka info is not available
                rutrackerLink: 'N/A', // Assuming Rutracker info is not available
                trailer: 'N/A' // Trailer info is not available in search results
            };

            if (!isDuplicateMovie(movieData.id)) {
                addMovieToLocalStorage(movieData);
                displayMoviesFromLocalStorage();
                displaySummary(movieData);
            } else {
                alert('Movie already exists in the list.');
                console.log('Attempted to add duplicate movie with ID:', movieData.id);
            }
        } else {
            console.log('No movies found.');
        }
    } catch (error) {
        console.error('Error fetching movie data from TMDB:', error);
    }
}

function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === parseInt(movieId));
}

function addMovieToLocalStorage(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies.push(movieData);
    localStorage.setItem('movies', JSON.stringify(movies));
    console.log('Movie added to local storage:', movieData);
}

function displayMoviesFromLocalStorage() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const tbody = document.querySelector('#movieTable tbody');
    tbody.innerHTML = '';

    movies.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${movie.poster}" class="poster" alt="${movie.title} poster"></td>
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.year}</td>
            <td>${movie.length}</td>
            <td>${movie.rating}</td>
            <td class="collapsible">${movie.description || 'N/A'}</td>
            <td>${movie.director || 'N/A'}</td>
            <td class="collapsible">${movie.actors || 'N/A'}</td>
            <td class="collapsible">${movie.review || 'N/A'}</td>
            <td><a href="${movie.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${movie.imdbLink}" target="_blank">IMDb</a></td>
            <td>${movie.tolokaLink || 'N/A'}</td>
            <td>${movie.rutrackerLink || 'N/A'}</td>
            <td><a href="${movie.trailer}" target="_blank">Trailer</a></td>
            <td><button class="button" onclick="removeMovie(${movie.id})">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelector('#rowCount').textContent = `Total Movies: ${movies.length}`;
    console.log(`Total movies displayed: ${movies.length}`);
}

function removeMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
    console.log(`Removed movie with ID: ${movieId}`);
}

function removeAllMovies() {
    if (confirm('Are you sure you want to remove all movies?')) {
        localStorage.removeItem('movies');
        displayMoviesFromLocalStorage();
        console.log('All movies removed from local storage.');
    }
}

function displaySummary(movieData) {
    const summaryDiv = document.querySelector('#summary');
    summaryDiv.innerHTML = `
        <h2>Added Movie</h2>
        <p><strong>Title:</strong> ${movieData.title}</p>
        <p><strong>Genre:</strong> ${movieData.genre}</p>
        <p><strong>Year:</strong> ${movieData.year}</p>
        <p><strong>Length:</strong> ${movieData.length}</p>
        <p><strong>Rating:</strong> ${movieData.rating}</p>
        <p><strong>Description:</strong> ${movieData.description || 'N/A'}</p>
        <p><strong>Director:</strong> ${movieData.director || 'N/A'}</p>
        <p><strong>Actors:</strong> ${movieData.actors || 'N/A'}</p>
        <p><strong>Review:</strong> ${movieData.review || 'N/A'}</p>
        <p><strong>TMDB Link:</strong> <a href="${movieData.tmdbLink}" target="_blank">${movieData.tmdbLink}</a></p>
        <p><strong>IMDb Link:</strong> <a href="${movieData.imdbLink}" target="_blank">${movieData.imdbLink}</a></p>
        <p><strong>Toloka Link:</strong> <a href="${movieData.tolokaLink}" target="_blank">${movieData.tolokaLink}</a></p>
        <p><strong>Rutracker Link:</strong> <a href="${movieData.rutrackerLink}" target="_blank">${movieData.rutrackerLink}</a></p>
        <p><strong>Trailer Link:</strong> <a href="${movieData.trailer}" target="_blank">${movieData.trailer}</a></p>
    `;
    console.log('Summary displayed for movie:', movieData.title);
}

function exportMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const blob = new Blob([JSON.stringify(movies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('Movies exported to JSON.');
}

function importMoviesJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const movies = JSON.parse(reader.result);
                localStorage.setItem('movies', JSON.stringify(movies));
                displayMoviesFromLocalStorage();
                console.log('Movies imported from JSON file.');
            } catch (e) {
                alert('Invalid JSON file.');
                console.error('Error parsing JSON file:', e);
            }
        };
        reader.readAsText(file);
    }
}

function importMoviesCSV(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const lines = reader.result.split('\n');
            const movies = [];
            lines.slice(1).forEach(line => {
                const cols = line.split(',');
                if (cols.length > 1) {
                    movies.push({
                        id: parseInt(cols[0], 10),
                        poster: cols[1],
                        title: cols[2],
                        genre: cols[3],
                        year: cols[4],
                        length: cols[5],
                        rating: cols[6],
                        description: cols[7],
                        director: cols[8],
                        actors: cols[9],
                        review: cols[10],
                        tmdbLink: cols[11],
                        imdbLink: cols[12],
                        tolokaLink: cols[13],
                        rutrackerLink: cols[14],
                        trailer: cols[15]
                    });
                }
            });
            localStorage.setItem('movies', JSON.stringify(movies));
            displayMoviesFromLocalStorage();
            console.log('Movies imported from CSV file.');
        };
        reader.readAsText(file);
    }
}
