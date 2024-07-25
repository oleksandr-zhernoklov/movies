document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    document.querySelector('#search').addEventListener('input', (event) => {
        searchMovie();
    });
});

const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';

async function searchMovie() {
    const movieName = document.querySelector('#search').value.trim();
    if (!movieName) return;
    const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.results.length) {
            const movie = data.results[0]; // Take the first result
            const movieId = movie.id;
            const movieDetails = await fetchMovieDetails(movieId);
            const movieData = {
                id: movie.id,
                title: movie.title,
                genre: movie.genre_ids[0], // Assuming single genre for simplicity
                year: movie.release_date.split('-')[0],
                length: 'N/A', // To be backfilled
                rating: movie.vote_average,
                description: movie.overview,
                director: 'N/A', // To be backfilled
                actors: 'N/A', // To be backfilled
                review: 'N/A', // To be backfilled
                tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                imdbLink: `https://www.imdb.com/title/tt${movie.imdb_id}`,
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                trailer: await fetchTrailer(movieId),
                poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            };
            if (!isDuplicateMovie(movieId)) {
                saveMovieToLocalStorage(movieData);
                displayMoviesFromLocalStorage();
                displaySummary(movieData);
            } else {
                alert('Movie already exists in the list.');
            }
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

async function fetchMovieDetails(movieId) {
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`;
    try {
        const response = await fetch(detailsUrl);
        const movie = await response.json();
        return movie;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return {};
    }
}

async function fetchTrailer(movieId) {
    const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`;
    try {
        const response = await fetch(videosUrl);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer');
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';
    } catch (error) {
        console.error('Error fetching movie trailers:', error);
        return 'N/A';
    }
}

function saveMovieToLocalStorage(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies.push(movieData);
    localStorage.setItem('movies', JSON.stringify(movies));
}

function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === parseInt(movieId));
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
            <td>${movie.description || 'N/A'}</td>
            <td>${movie.director || 'N/A'}</td>
            <td class="collapsible">${movie.actors || 'N/A'}</td>
            <td class="collapsible">${movie.review || 'N/A'}</td>
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

function removeMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
}

function removeAllMovies() {
    if (confirm('Are you sure you want to remove all movies?')) {
        localStorage.removeItem('movies');
        displayMoviesFromLocalStorage();
    }
}

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
        <p><strong>Trailer Link:</strong> <a href="${movieData.trailer}" target="_blank">${movieData.trailer}</a></p>
    `;
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
}

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
            movie.description || 'N/A',
            movie.director || 'N/A',
            movie.actors || 'N/A',
            movie.review || 'N/A',
            movie.tmdbLink,
            movie.imdbLink,
            movie.tolokaLink,
            movie.rutrackerLink,
            movie.trailer
        ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function importMovies(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const movies = JSON.parse(e.target.result);
                localStorage.setItem('movies', JSON.stringify(movies));
                displayMoviesFromLocalStorage();
            } catch (error) {
                console.error('Error importing movies:', error);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a valid JSON file.');
    }
}

async function backfillMissingAttributes() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    for (let movie of movies) {
        if (movie.length === 'N/A' || movie.director === 'N/A' || movie.actors === 'N/A' || movie.review === 'N/A') {
            const movieDetails = await fetchMovieDetails(movie.id);
            if (movie.length === 'N/A') movie.length = movieDetails.runtime ? `${movieDetails.runtime} min` : 'N/A';
            if (movie.director === 'N/A') {
                const creditsUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${tmdbApiKey}`;
                const creditsResponse = await fetch(creditsUrl);
                const creditsData = await creditsResponse.json();
                const director = creditsData.crew.find(person => person.job === 'Director');
                movie.director = director ? director.name : 'N/A';
            }
            if (movie.actors === 'N/A') {
                const actors = movieDetails.cast.slice(0, 5).map(actor => actor.name).join(', ');
                movie.actors = actors || 'N/A';
            }
            if (movie.review === 'N/A') {
                // Placeholder for review fetching logic, if available
                movie.review = 'N/A';
            }
            saveMovieToLocalStorage(movie);
        }
    }
    displayMoviesFromLocalStorage();
}

document.querySelector('#backfillButton').addEventListener('click', backfillMissingAttributes);
