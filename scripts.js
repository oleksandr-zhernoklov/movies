document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('search').focus();
    displayMoviesFromLocalStorage();
    makeTableSortable();
});

function searchMovie() {
    const movieName = document.getElementById('search').value.trim();
    if (!movieName) {
        logMessage('Please enter a movie name.');
        return;
    }
    fetchMovieData(movieName);
    document.getElementById('search').value = ''; // Clear the input field after search
}

function logMessage(message) {
    const logs = document.getElementById('logs');
    logs.innerHTML += `<p>${message}</p>`;
}

function displayMoviesFromLocalStorage() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const tbody = document.querySelector('#movieTable tbody');
    tbody.innerHTML = '';

    movies.forEach((movie, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${movie.poster}" class="poster" alt="${movie.title}"></td>
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.year}</td>
            <td>${movie.length}</td>
            <td>${movie.rating}</td>
            <td>${movie.description}</td>
            <td>${movie.director}</td>
            <td>${movie.actors}</td>
            <td>${movie.review}</td>
            <td><a href="${movie.tmdbLink}" target="_blank">${movie.tmdbLink}</a></td>
            <td><a href="${movie.imdbLink}" target="_blank">${movie.imdbLink}</a></td>
            <td><a href="${movie.tolokaLink}" target="_blank">${movie.tolokaLink}</a></td>
            <td><a href="${movie.rutrackerLink}" target="_blank">${movie.rutrackerLink}</a></td>
            <td><a href="${movie.trailer}" target="_blank">${movie.trailer}</a></td>
            <td><button class="button" onclick="removeMovie(${movie.id})">Remove</button></td>
        `;

        tbody.appendChild(row);
    });

    updateRowCount(movies.length);
}

function updateRowCount(count) {
    const rowCount = document.getElementById('rowCount');
    rowCount.innerHTML = `Total Movies: ${count}`;
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
        logMessage('All movies have been removed.');
    }
}

function fetchMovieData(movieName) {
    const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${movieName}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}`;

                fetch(movieDetailsUrl)
                    .then(detailsResponse => detailsResponse.json())
                    .then(detailsData => {
                        const movieData = {
                            id: movie.id,
                            poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
                            title: movie.title,
                            genre: getGenreValues(movie.genre_ids),
                            year: new Date(movie.release_date).getFullYear(),
                            length: detailsData.runtime ? `${detailsData.runtime} mins` : 'N/A',
                            rating: detailsData.vote_average,
                            description: detailsData.overview,
                            director: getDirector(detailsData.credits.crew),
                            actors: getActors(detailsData.credits.cast),
                            review: getReviews(detailsData.reviews.results),
                            tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                            imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : '',
                            tolokaLink: `https://toloka.to/tracker.php?nm=${movie.title}`,
                            rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${movie.title}`,
                            trailer: getTrailerLink(detailsData.videos.results)
                        };

                        saveMovieData(movieData);
                        displayMoviesFromLocalStorage();
                    })
                    .catch(error => logMessage(`Error fetching movie details: ${error.message}`));
            } else {
                logMessage(`No results found for "${movieName}".`);
            }
        })
        .catch(error => logMessage(`Error fetching movie data: ${error.message}`));
}

function getGenreValues(genreIds) {
    const genreMapping = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
         36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    };
    return genreIds.map(id => genreMapping[id]).join(', ');
}

function getDirector(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'N/A';
}

function getActors(cast) {
    return cast.slice(0, 5).map(actor => actor.name).join(', ');
}

function getReviews(reviews) {
    return reviews.length > 0 ? reviews[0].content : 'No reviews available.';
}

function getTrailerLink(videos) {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
}

function saveMovieData(movieData) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    if (!movies.find(movie => movie.id === movieData.id)) {
        movies.push(movieData);
        localStorage.setItem('movies', JSON.stringify(movies));
        logMessage(`Movie "${movieData.title}" has been added.`);
    } else {
        logMessage(`Movie "${movieData.title}" is already in the list.`);
    }
}

function exportMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const json = JSON.stringify(movies, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importMovies(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const importedMovies = JSON.parse(content);
            const existingMovies = JSON.parse(localStorage.getItem('movies')) || [];

            const updatedMovies = [...existingMovies, ...importedMovies];
            localStorage.setItem('movies', JSON.stringify(updatedMovies));
            displayMoviesFromLocalStorage();
            logMessage('Movies have been imported.');
        };
        reader.readAsText(file);
    }
}

function makeTableSortable() {
    const table = document.getElementById('movieTable');
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const index = Array.prototype.indexOf.call(headers, header);
            sortTableByColumn(table, index);
        });
    });
}

function sortTableByColumn(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isAsc = table.getAttribute('data-sort') === 'asc';
    table.setAttribute('data-sort', isAsc ? 'desc' : 'asc');

    rows.sort((a, b) => {
        const aText = a.children[column].textContent.trim();
        const bText = b.children[column].textContent.trim();

        return isAsc
            ? aText.localeCompare(bText, undefined, { numeric: true })
            : bText.localeCompare(aText, undefined, { numeric: true });
    });

    rows.forEach(row => tbody.appendChild(row));
}
