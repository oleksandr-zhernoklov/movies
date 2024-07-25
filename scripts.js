document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    document.querySelector('#search').focus();
});

const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';
const tmdbGenres = { /* Populate this with your genre mappings */ };

// Function to handle movie search
async function searchMovie() {
    let movieTitle = document.querySelector('#search').value.trim();
    if (movieTitle.startsWith('.')) {
        movieTitle = movieTitle.substring(1).trim();
        document.querySelector('#search').value = movieTitle;
    }

    if (!movieTitle) {
        displayLog('Please enter a movie title.');
        return;
    }

    const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieTitle)}`;

    try {
        const searchResponse = await fetch(tmdbSearchUrl);
        if (!searchResponse.ok) {
            throw new Error('Failed to fetch data from TMDB');
        }

        const searchData = await searchResponse.json();
        if (searchData.results.length > 0) {
            const movie = searchData.results[0]; // Use the first result for simplicity
            const movieId = movie.id;
            const movieData = {
                id: movie.id,
                poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`, // Correct poster URL
                title: movie.title,
                genre: movie.genre_ids.map(id => tmdbGenres[id] || 'Unknown').join(', '),
                year: movie.release_date.split('-')[0],
                length: 'N/A', // TMDB does not provide movie length in the search API
                rating: movie.vote_average,
                description: movie.overview,
                director: 'N/A', // Need to fetch additional details for this
                actors: 'N/A', // Need to fetch additional details for this
                review: 'N/A', // Review data is not available in the search response
                tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                imdbLink: `https://www.imdb.com/title/tt${movie.id}`,
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                trailer: 'N/A' // Initialize trailer link
            };

            // Fetching the movie videos to get the trailer
            const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`;
            const videosResponse = await fetch(videosUrl);
            const videosData = await videosResponse.json();
            const trailer = videosData.results.find(video => video.type === 'Trailer');
            movieData.trailer = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';

            if (!isDuplicateMovie(movieData.id)) {
                saveMovieToLocalStorage(movieData);
                displayMoviesFromLocalStorage();
                displaySummary(movieData);
            } else {
                displayLog('Movie already exists in the list.');
            }
        } else {
            displayLog('No results found.');
        }
    } catch (error) {
        displayLog(`Error: ${error.message}`);
    }
}

// Function to check for duplicate movies
function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === parseInt(movieId));
}

// Function to save a movie to local storage
function saveMovieToLocalStorage(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies.push(movieData);
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Function to display movies from local storage in the table
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
            <td><a href="${movie.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${movie.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${movie.trailer}" target="_blank">${movie.trailer === 'N/A' ? 'N/A' : 'Watch Trailer'}</a></td>
            <td><button class="button" onclick="removeMovie(${movie.id})">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    document.querySelector('#rowCount').textContent = `Total Movies: ${movies.length}`;
}

// Function to remove a movie from local storage
function removeMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
}

// Function to remove all movies from local storage
function removeAllMovies() {
    if (confirm('Are you sure you want to remove all movies?')) {
        localStorage.removeItem('movies');
        displayMoviesFromLocalStorage();
    }
}

// Function to display the summary of a movie
function displaySummary(movieData) {
    const summaryDiv = document.querySelector('#summary');
    summaryDiv.innerHTML = `
        <h2>Added Movie</h2>
        <img src="${movieData.poster}" class="poster" alt="${movieData.title} poster">
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
        <p><strong>Trailer Link:</strong> <a href="${movieData.trailer}" target="_blank">${movieData.trailer === 'N/A' ? 'N/A' : 'Watch Trailer'}</a></p>
    `;
}

// Function to export movies to JSON
function exportMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const blob = new Blob([JSON.stringify(movies, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to export movies to CSV
function exportMoviesCSV() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const csvRows = [
        ['#', 'Poster', 'Title', 'Genre', 'Year', 'Length', 'Rating', 'Description', 'Director', 'Actors', 'Review', 'TMDB', 'IMDb', 'Toloka', 'Rutracker', 'Trailer']
    ];

    movies.forEach((movie, index) => {
        csvRows.push([
            index + 1,
            movie.poster,
            movie.title,
            movie.genre,
            movie.year,
            movie.length,
            movie.rating,
            movie.description,
            movie.director,
            movie.actors,
            movie.review,
            movie.tmdbLink,
            movie.imdbLink,
            movie.tolokaLink,
            movie.rutrackerLink,
            movie.trailer
        ]);
    });

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to import movies from JSON
function importMovies(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const movies = JSON.parse(e.target.result);
                if (Array.isArray(movies)) {
                    localStorage.setItem('movies', JSON.stringify(movies));
                    displayMoviesFromLocalStorage();
                } else {
                    displayLog('Invalid JSON format.');
                }
            } catch (error) {
                displayLog('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    } else {
        displayLog('Please upload a valid JSON file.');
    }
}

// Function to display log messages
function displayLog(message) {
    const logDiv = document.querySelector('#logs');
    logDiv.innerHTML += `<p>${message}</p>`;
}

// Toggle review functionality
function toggleReview() {
    const collapsibleElements = document.querySelectorAll('.collapsible');
    collapsibleElements.forEach(el => el.classList.toggle('hidden'));
}

// Event listener for the toggle review button
document.querySelector('#toggleReview').addEventListener('click', toggleReview);
