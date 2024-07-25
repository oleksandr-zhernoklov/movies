document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    document.querySelector('#search').focus();
});

async function searchMovie() {
    let movieName = document.querySelector('#search').value.trim();
    if (movieName.startsWith('.')) {
        movieName = movieName.substring(1).trim();
        document.querySelector('#search').value = movieName;
    }

    if (movieName) {
        console.log(`Searching for movie: ${movieName}`);
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=YOUR_API_KEY&query=${encodeURIComponent(movieName)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('TMDB search results:', data);

            // Clear previous movies and add new ones
            localStorage.setItem('movies', JSON.stringify(data.results));
            displayMoviesFromLocalStorage();
        } catch (error) {
            console.error('Error during TMDB search:', error);
            alert('Error searching for movie. Please check the console for details.');
        }
    } else {
        console.log('No search query provided.');
    }

    document.querySelector('#search').focus();
}

function toggleReviewColumn() {
    const reviewColumn = document.querySelector('#movieTable th.collapsible');
    const reviewCells = document.querySelectorAll('#movieTable td.collapsible');
    reviewColumn.classList.toggle('expanded');
    reviewCells.forEach(td => td.classList.toggle('expanded'));
}

function addMovieToLocalStorage(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const movieExists = movies.some(movie => movie.id === movieData.id);
    if (!movieExists) {
        movies.push(movieData);
        localStorage.setItem('movies', JSON.stringify(movies));
        console.log('Movie added to local storage:', movieData);
    }
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
    console.log('Movies displayed from local storage.');
}

function removeMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
    console.log(`Movie removed with ID: ${movieId}`);
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
    console.log('Movie summary displayed:', movieData);
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
    console.log('Movies exported as JSON.');
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

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.csv';
    a.click();
    URL.revokeObjectURL(url);
    console.log('Movies exported as CSV.');
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
                console.error('Error importing JSON file:', e);
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
                        id: cols[0],
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
