document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
});

function searchMovie() {
    let movieName = document.querySelector('#search').value.trim();
    if (movieName.startsWith('.')) {
        movieName = movieName.substring(1).trim();
        document.querySelector('#search').value = movieName;
    }

    if (movieName) {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(data => {
                const movies = data.results;
                if (movies.length > 0) {
                    const movieId = movies[0].id;
                    fetchMovieDetails(movieId);
                } else {
                    alert('No movies found.');
                }
            })
            .catch(error => alert('Error searching for movies.'));
    } else {
        alert('Please enter a movie name.');
    }
}

function fetchMovieDetails(movieId) {
    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&append_to_response=videos,credits`;

    fetch(movieUrl)
        .then(response => response.json())
        .then(movieData => {
            const movie = {
                id: movieData.id,
                poster: `https://image.tmdb.org/t/p/w200${movieData.poster_path}`,
                title: movieData.title,
                genre: movieData.genres.map(g => g.name).join(', '),
                year: new Date(movieData.release_date).getFullYear(),
                length: movieData.runtime || 'N/A',
                rating: movieData.vote_average || 'N/A',
                description: movieData.overview || 'N/A',
                director: movieData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
                actors: movieData.credits.cast.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A',
                review: 'N/A', // Placeholder
                tmdbLink: `https://www.themoviedb.org/movie/${movieData.id}`,
                imdbLink: `https://www.imdb.com/title/${movieData.imdb_id}`,
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(movieData.title)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(movieData.title)}`,
                trailer: getTrailer(movieData.videos.results)
            };

            if (!isDuplicateMovie(movie.id)) {
                addMovieToLocalStorage(movie);
                displayMoviesFromLocalStorage();
                displaySummary(movie);
                alert('Movie added successfully.');
            } else {
                alert('Movie already exists in the list.');
            }
        })
        .catch(error => alert('Error fetching movie details.'));
}

function getTrailer(videos) {
    const trailer = videos.find(video => video.type === 'Trailer');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';
}

function toggleReviewColumn() {
    const reviewColumn = document.querySelector('#movieTable th.collapsible');
    const reviewCells = document.querySelectorAll('#movieTable td.collapsible');
    reviewColumn.classList.toggle('expanded');
    reviewCells.forEach(td => td.classList.toggle('expanded'));
}

function addMovieToLocalStorage(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    if (!isDuplicateMovie(movieData.id)) {
        movies.push(movieData);
        localStorage.setItem('movies', JSON.stringify(movies));
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
            <td class="collapsible">${movie.description || 'N/A'}</td>
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

function sortTable(columnIndex) {
    const table = document.querySelector('#movieTable');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = table.querySelectorAll('th')[columnIndex].classList.contains('asc');
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[columnIndex].textContent.trim();
        const cellB = rowB.children[columnIndex].textContent.trim();
        return (cellA > cellB ? 1 : -1) * (isAscending ? 1 : -1);
    });
    rows.forEach(row => table.querySelector('tbody').appendChild(row));
    table.querySelectorAll('th').forEach(th => th.classList.remove('asc', 'desc'));
    table.querySelectorAll('th')[columnIndex].classList.add(isAscending ? 'desc' : 'asc');
}

function backfillMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const moviesToUpdate = movies.filter(movie => movie.length === 'N/A' || movie.director === 'N/A' || movie.actors === 'N/A' || movie.review === 'N/A');
    
    moviesToUpdate.forEach(movie => {
        const movieUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&append_to_response=videos,credits`;
        
        fetch(movieUrl)
            .then(response => response.json())
            .then(movieData => {
                movie.length = movieData.runtime || 'N/A';
                movie.director = movieData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A';
                movie.actors = movieData.credits.cast.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
                movie.review = 'N/A'; // Placeholder for review backfill
                movie.trailer = getTrailer(movieData.videos.results);
                addMovieToLocalStorage(movie);
                displayMoviesFromLocalStorage();
                alert('Movies backfilled successfully.');
            })
            .catch(error => alert('Error backfilling movie details.'));
    });
}

function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === movieId);
}
