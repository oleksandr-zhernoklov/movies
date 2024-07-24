document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    
    const searchInput = document.querySelector('#search');

    // Handle enter key press
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchMovie();
        }
    });

    searchInput.focus();
});

function searchMovie() {
    let movieName = document.querySelector('#search').value.trim();
    if (movieName.startsWith('.')) {
        movieName = movieName.substring(1).trim();
        document.querySelector('#search').value = movieName;
    }
    if (movieName) {
        fetchMovieData(movieName);
    }
    document.querySelector('#search').value = ''; // Clear input after search
    document.querySelector('#search').focus();
}

function fetchMovieData(movieName) {
    const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${movieName}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&append_to_response=credits,videos`;
                
                fetch(movieDetailsUrl)
                    .then(detailsResponse => detailsResponse.json())
                    .then(detailsData => {
                        const movieData = {
                            poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
                            title: movie.title,
                            genre: mapGenreIdsToNames(movie.genre_ids),
                            year: new Date(movie.release_date).getFullYear(),
                            length: detailsData.runtime ? `${detailsData.runtime} mins` : 'N/A',
                            rating: movie.vote_average,
                            description: movie.overview,
                            director: detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
                            actors: detailsData.credits.cast.slice(0, 5).map(actor => actor.name).join(', '),
                            review: 'N/A', // Assuming you don't have reviews in your API response
                            tmdbLink: `https://www.themoviedb.org/movie/${movie.id}`,
                            imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}/` : 'N/A',
                            tolokaLink: `https://toloka.to/tracker.php?nm=${movie.title}`,
                            rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${movie.title}`,
                            trailer: detailsData.videos.results.find(video => video.type === 'Trailer') ? `https://www.youtube.com/watch?v=${detailsData.videos.results.find(video => video.type === 'Trailer').key}` : 'N/A',
                            id: movie.id
                        };
                        
                        addMovieToLocalStorage(movieData);
                        displayMoviesFromLocalStorage();
                        displaySummary(movieData);
                    });
            } else {
                alert('No movie found.');
            }
        });
}

function mapGenreIdsToNames(genreIds) {
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
    makeTableSortable();
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

    const csvContent = csvRows.map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function importMoviesJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const movies = JSON.parse(e.target.result);
            localStorage.setItem('movies', JSON.stringify(movies));
            displayMoviesFromLocalStorage();
        };
        reader.readAsText(file);
    }
}

function importMoviesCSV(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            const movies = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.replace(/(^"|"$)/g, ''));
                return {
                    poster: values[1],
                    title: values[2],
                    genre: values[3],
                    year: parseInt(values[4]),
                    length: values[5],
                    rating: parseFloat(values[6]),
                    description: values[7],
                    director: values[8],
                    actors: values[9],
                    review: values[10],
                    tmdbLink: values[11],
                    imdbLink: values[12],
                    tolokaLink: values[13],
                    rutrackerLink: values[14],
                    trailer: values[15],
                    id: parseInt(values[11].split('/').pop())
                };
            });
            localStorage.setItem('movies', JSON.stringify(movies));
            displayMoviesFromLocalStorage();
        };
        reader.readAsText(file);
    }
}

function makeTableSortable() {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    document.querySelectorAll('#movieTable th').forEach(th => th.addEventListener('click', () => {
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
    }));
}
