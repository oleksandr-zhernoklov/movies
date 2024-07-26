document.addEventListener('DOMContentLoaded', () => {
    displayMoviesFromLocalStorage();
    displaySeriesFromLocalStorage();
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
        alert(`Error fetching movie data: ${error.message}`);
    }

    document.querySelector('#search').focus();
}

async function searchSeries() {
    let seriesName = document.querySelector('#search').value.trim();
    if (seriesName.startsWith('.')) {
        seriesName = seriesName.substring(1).trim();
        document.querySelector('#search').value = seriesName;
    }

    if (seriesName.length === 0) {
        alert('Please enter a series name.');
        return;
    }

    try {
        const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(seriesName)}`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const series = data.results[0];
            const seriesId = series.id;

            const detailsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${tmdbApiKey}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            const seriesData = {
                id: seriesId,
                poster: `https://image.tmdb.org/t/p/w200${series.poster_path}`,
                title: series.name,
                genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
                year: series.first_air_date ? series.first_air_date.split('-')[0] : 'N/A',
                seasons: detailsData.number_of_seasons || 'N/A',
                episodes: detailsData.number_of_episodes || 'N/A',
                rating: series.vote_average || 'N/A',
                description: series.overview || 'N/A',
                tmdbLink: `https://www.themoviedb.org/tv/${seriesId}`,
                imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : 'N/A',
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(series.name)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(series.name)}`
            };

            if (!isDuplicateSeries(seriesId)) {
                saveSeriesToLocalStorage(seriesData);
                displaySeriesFromLocalStorage();
                displaySummary(seriesData);
            } else {
                alert('Series already exists in the list.');
            }
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert(`Error fetching series data: ${error.message}`);
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

function saveSeriesToLocalStorage(seriesData) {
    const series = JSON.parse(localStorage.getItem('series')) || [];
    series.push(seriesData);
    localStorage.setItem('series', JSON.stringify(series));
}

function isDuplicateMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    return movies.some(movie => movie.id === parseInt(movieId));
}

function isDuplicateSeries(seriesId) {
    const series = JSON.parse(localStorage.getItem('series')) || [];
    return series.some(serie => serie.id === parseInt(seriesId));
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

function displaySeriesFromLocalStorage() {
    const series = JSON.parse(localStorage.getItem('series')) || [];
    const tbody = document.querySelector('#seriesTable tbody');
    tbody.innerHTML = '';

    series.forEach((serie, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${serie.poster}" alt="${serie.title}" class="poster"></td>
            <td>${serie.title}</td>
            <td>${serie.genre}</td>
            <td>${serie.year}</td>
            <td>${serie.seasons}</td>
            <td>${serie.episodes}</td>
            <td>${serie.rating}</td>
            <td class="collapsible">${serie.description}</td>
            <td><a href="${serie.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${serie.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${serie.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${serie.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><button class="button" onclick="removeSeries(${serie.id})">Remove</button></td>
        `;

        tbody.appendChild(row);
    });

    document.querySelector('#rowCountSeries').textContent = `Total Series: ${series.length}`;
}

function displaySummary(data) {
    const summaryDiv = document.querySelector('#summary');
    summaryDiv.innerHTML = `
        <h3>Summary</h3>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Genre:</strong> ${data.genre}</p>
        <p><strong>Year:</strong> ${data.year}</p>
        ${data.length ? `<p><strong>Length:</strong> ${data.length}</p>` : ''}
        ${data.seasons ? `<p><strong>Seasons:</strong> ${data.seasons}</p>` : ''}
        ${data.episodes ? `<p><strong>Episodes:</strong> ${data.episodes}</p>` : ''}
        <p><strong>Rating:</strong> ${data.rating}</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Director:</strong> ${data.director}</p>
        <p><strong>Actors:</strong> ${data.actors}</p>
        <p><strong>Review:</strong> ${data.review}</p>
        <p><strong>Trailer:</strong> <a href="${data.trailer}" target="_blank">Watch Trailer</a></p>
        <p><strong>TMDB:</strong> <a href="${data.tmdbLink}" target="_blank">TMDB Link</a></p>
        <p><strong>IMDb:</strong> <a href="${data.imdbLink}" target="_blank">IMDb Link</a></p>
        <p><strong>Toloka:</strong> <a href="${data.tolokaLink}" target="_blank">Toloka Link</a></p>
        <p><strong>Rutracker:</strong> <a href="${data.rutrackerLink}" target="_blank">Rutracker Link</a></p>
    `;
}

function removeMovie(id) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const updatedMovies = movies.filter(movie => movie.id !== id);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    displayMoviesFromLocalStorage();
}

function removeSeries(id) {
    const series = JSON.parse(localStorage.getItem('series')) || [];
    const updatedSeries = series.filter(serie => serie.id !== id);
    localStorage.setItem('series', JSON.stringify(updatedSeries));
    displaySeriesFromLocalStorage();
}

document.querySelector('#searchMovie').addEventListener('click', searchMovie);
document.querySelector('#searchSeries').addEventListener('click', searchSeries);

document.querySelector('#search').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchMovie();
    }
});

function exportToJsonFile(jsonData, filename = 'data.json') {
    const dataStr = JSON.stringify(jsonData, null, 4);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const importedData = JSON.parse(event.target.result);
        if (importedData.movies) {
            localStorage.setItem('movies', JSON.stringify(importedData.movies));
        }
        if (importedData.series) {
            localStorage.setItem('series', JSON.stringify(importedData.series));
        }
        displayMoviesFromLocalStorage();
        displaySeriesFromLocalStorage();
    };
    reader.readAsText(file);
}

document.querySelector('#export').addEventListener('click', () => {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const series = JSON.parse(localStorage.getItem('series')) || [];
    exportToJsonFile({ movies, series });
});

document.querySelector('#import').addEventListener('change', importFromJsonFile);

document.querySelector('#toggleReviewColumn').addEventListener('click', toggleReviewColumn);
