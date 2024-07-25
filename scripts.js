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

    if (movieName.length === 0) {
        alert('Please enter a movie name.');
        return;
    }

    try {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movieName)}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            const movieId = movie.id;

            const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            const videosUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`;
            const videosResponse = await fetch(videosUrl);
            const videosData = await videosResponse.json();
            const trailer = videosData.results.find(video => video.type === 'Trailer');
            const trailerLink = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';

            const movieData = {
                id: movieId,
                poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
                title: movie.title,
                genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
                year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                length: detailsData.runtime ? `${detailsData.runtime} min` : 'N/A',
                rating: movie.vote_average || 'N/A',
                description: movie.overview || 'N/A',
                director: detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
                actors: detailsData.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A',
                review: detailsData.reviews.results[0]?.content || 'N/A',
                tmdbLink: `https://www.themoviedb.org/movie/${movieId}`,
                imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : 'N/A',
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(movie.title)}`,
                trailer: trailerLink
            };

            if (!isDuplicateMovie(movieId)) {
                saveMovieToLocalStorage(movieData);
                displayMoviesFromLocalStorage();
                displaySummary(movieData);
            } else {
                alert('Movie already exists in the list.');
            }
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert('Error fetching movie data.');
    }

    document.querySelector('#search').focus();
}

function toggleReviewColumn() {
    const reviewColumn = document.querySelector('#movieTable th.collapsible');
    const reviewCells = document.querySelectorAll('#movieTable td.collapsible');
    reviewColumn.classList.toggle('expanded');
    reviewCells.forEach(td => td.classList.toggle('expanded'));
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
            <td><button class="button" onclick="removeMovie(${movie.id})">Remove</button></td>
        `;

        tbody.appendChild(row);
    });

    document.querySelector('#rowCount').textContent = `Total Movies: ${movies.length}`;
}

function displaySummary(movieData) {
    const summaryDiv = document.querySelector('#summary');
    summaryDiv.innerHTML = `
        <h2>Added Movie</h2>
        <img src="${movieData.poster}" alt="${movieData.title}" class="poster">
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

function removeMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
    alert('Movie removed.');
}

function removeAllMovies() {
    localStorage.removeItem('movies');
    displayMoviesFromLocalStorage();
    alert('All movies removed.');
}

function sortTable(n) {
    const table = document.getElementById('movieTable');
    let switching = true;
    let dir = 'asc';
    let switchcount = 0;

    while (switching) {
        switching = false;
        const rows = table.rows;
        let shouldSwitch;
        for (let i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            const x = rows[i].getElementsByTagName('TD')[n];
            const y = rows[i + 1].getElementsByTagName('TD')[n];
            if (dir === 'asc') {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === 'desc') {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === 'asc') {
                dir = 'desc';
                switching = true;
            }
        }
    }
}

function exportMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(movies))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'movies.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function exportMoviesCSV() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const csvContent = [
        ['#', 'Poster', 'Title', 'Genre', 'Year', 'Length', 'Rating', 'Description', 'Director', 'Actors', 'Review', 'TMDB', 'IMDb', 'Toloka', 'Rutracker', 'Trailer']
    ];

    movies.forEach((movie, index) => {
        csvContent.push([
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

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const dataStr = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'movies.csv');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importMoviesJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedMovies = JSON.parse(e.target.result);
            const currentMovies = JSON.parse(localStorage.getItem('movies')) || [];
            const mergedMovies = [...currentMovies, ...importedMovies];
            localStorage.setItem('movies', JSON.stringify(mergedMovies));
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
            const rows = csvContent.split('\n');
            const importedMovies = rows.slice(1).map(row => {
                const cells = row.split(',');
                return {
                    id: cells[0],
                    poster: cells[1],
                    title: cells[2],
                    genre: cells[3],
                    year: cells[4],
                    length: cells[5],
                    rating: cells[6],
                    description: cells[7],
                    director: cells[8],
                    actors: cells[9],
                    review: cells[10],
                    tmdbLink: cells[11],
                    imdbLink: cells[12],
                    tolokaLink: cells[13],
                    rutrackerLink: cells[14],
                    trailer: cells[15]
                };
            });
            const currentMovies = JSON.parse(localStorage.getItem('movies')) || [];
            const mergedMovies = [...currentMovies, ...importedMovies];
            localStorage.setItem('movies', JSON.stringify(mergedMovies));
            displayMoviesFromLocalStorage();
        };
        reader.readAsText(file);
    }
}

async function backfillMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];

    for (const movie of movies) {
        if (movie.length === 'N/A' || movie.director === 'N/A' || movie.actors === 'N/A' || movie.review === 'N/A') {
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            if (movie.length === 'N/A') {
                movie.length = detailsData.runtime ? `${detailsData.runtime} min` : 'N/A';
            }
            if (movie.director === 'N/A') {
                movie.director = detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A';
            }
            if (movie.actors === 'N/A') {
                movie.actors = detailsData.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A';
            }
            if (movie.review === 'N/A') {
                movie.review = detailsData.reviews.results[0]?.content || 'N/A';
            }
        }
    }

    localStorage.setItem('movies', JSON.stringify(movies));
    displayMoviesFromLocalStorage();
    alert('Movies backfilled with missing data.');
}
