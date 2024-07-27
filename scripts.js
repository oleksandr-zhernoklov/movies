document.addEventListener('DOMContentLoaded', () => {
    displayMediaFromLocalStorage();
    document.querySelector('#search').focus();
});

const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';

async function searchMedia() {
    let mediaName = document.querySelector('#search').value.trim();
    if (mediaName.startsWith('.')) {
        mediaName = mediaName.substring(1).trim();
        document.querySelector('#search').value = mediaName;
    }

    if (mediaName.length === 0) {
        alert('Please enter a movie or series name.');
        return;
    }

    try {
        const movieSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(mediaName)}`;
        const seriesSearchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(mediaName)}`;

        const [movieResponse, seriesResponse] = await Promise.all([fetch(movieSearchUrl), fetch(seriesSearchUrl)]);
        const movieData = await movieResponse.json();
        const seriesData = await seriesResponse.json();

        if ((movieData.results && movieData.results.length > 0) || (seriesData.results && seriesData.results.length > 0)) {
            const movie = movieData.results[0];
            const series = seriesData.results[0];

            if (movie) {
                await handleMovieData(movie);
            }

            if (series) {
                await handleSeriesData(series);
            }
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert('Error fetching data.');
        console.error(error);
    }

    document.querySelector('#search').focus();
}

async function handleMovieData(movie) {
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

    if (!isDuplicateMedia(movieId)) {
        saveMediaToLocalStorage(movieData, 'movie');
        displayMediaFromLocalStorage();
        displaySummary(movieData);
    } else {
        alert('Movie already exists in the list.');
    }
}

async function handleSeriesData(series) {
    const seriesId = series.id;
    const detailsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const videosUrl = `https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=${tmdbApiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    const trailer = videosData.results.find(video => video.type === 'Trailer');
    const trailerLink = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';

    const seriesData = {
        id: seriesId,
        poster: `https://image.tmdb.org/t/p/w200${series.poster_path}`,
        title: series.name,
        genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
        year: series.first_air_date ? series.first_air_date.split('-')[0] : 'N/A',
        length: `${detailsData.number_of_seasons} seasons, ${detailsData.number_of_episodes} episodes`,
        rating: series.vote_average || 'N/A',
        description: series.overview || 'N/A',
        director: detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
        actors: detailsData.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A',
        review: detailsData.reviews.results[0]?.content || 'N/A',
        tmdbLink: `https://www.themoviedb.org/tv/${seriesId}`,
        imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : 'N/A',
        tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(series.name)}`,
        rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(series.name)}`,
        trailer: trailerLink
    };

    if (!isDuplicateMedia(seriesId)) {
        saveMediaToLocalStorage(seriesData, 'series');
        displayMediaFromLocalStorage();
        displaySummary(seriesData);
    } else {
        alert('Series already exists in the list.');
    }
}

function toggleReviewColumn() {
    const reviewColumn = document.querySelector('#mediaTable th.collapsible');
    const reviewCells = document.querySelectorAll('#mediaTable td.collapsible');
    reviewColumn.classList.toggle('expanded');
    reviewCells.forEach(cell => cell.classList.toggle('expanded'));
}

function isDuplicateMedia(id) {
    const storedMedia = JSON.parse(localStorage.getItem('mediaList')) || [];
    return storedMedia.some(media => media.id === id);
}

function saveMediaToLocalStorage(mediaData, type) {
    const storedMedia = JSON.parse(localStorage.getItem('mediaList')) || [];
    mediaData.type = type;
    storedMedia.push(mediaData);
    localStorage.setItem('mediaList', JSON.stringify(storedMedia));
}

function displayMediaFromLocalStorage() {
    const storedMedia = JSON.parse(localStorage.getItem('mediaList')) || [];
    const mediaTableBody = document.querySelector('#mediaTableBody');
    if (!mediaTableBody) {
        console.error('Error: #mediaTableBody element not found.');
        return;
    }

    mediaTableBody.innerHTML = '';
    storedMedia.forEach((media, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${media.poster}" alt="${media.title} Poster"></td>
            <td>${media.title}</td>
            <td>${media.genre}</td>
            <td>${media.year}</td>
            <td>${media.length}</td>
            <td>${media.rating}</td>
            <td>${media.description}</td>
            <td>${media.director}</td>
            <td>${media.actors}</td>
            <td class="collapsible">${media.review}</td>
            <td><a href="${media.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${media.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${media.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${media.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${media.trailer}" target="_blank">Trailer</a></td>
            <td><button onclick="removeMedia(${media.id})">Remove</button></td>
        `;
        mediaTableBody.appendChild(row);
    });
}

function removeMedia(id) {
    let storedMedia = JSON.parse(localStorage.getItem('mediaList')) || [];
    storedMedia = storedMedia.filter(media => media.id !== id);
    localStorage.setItem('mediaList', JSON.stringify(storedMedia));
    displayMediaFromLocalStorage();
}

function exportMedia() {
    const storedMedia = localStorage.getItem('mediaList');
    if (!storedMedia) {
        alert('No data to export.');
        return;
    }

    const blob = new Blob([storedMedia], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mediaList.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importMedia() {
    const fileInput = document.querySelector('#fileInput');
    fileInput.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const importedMedia = JSON.parse(e.target.result);
        if (Array.isArray(importedMedia)) {
            localStorage.setItem('mediaList', JSON.stringify(importedMedia));
            displayMediaFromLocalStorage();
        } else {
            alert('Invalid data format.');
        }
    };
    reader.readAsText(file);
}

function displaySummary(mediaData) {
    const summarySection = document.querySelector('#summary');
    summarySection.innerHTML = `
        <h2>Summary</h2>
        <p>Title: ${mediaData.title}</p>
        <p>Year: ${mediaData.year}</p>
        <p>Length: ${mediaData.length}</p>
        <p>Rating: ${mediaData.rating}</p>
        <p>Director: ${mediaData.director}</p>
        <p>Actors: ${mediaData.actors}</p>
        <p>Description: ${mediaData.description}</p>
        <p>Review: ${mediaData.review}</p>
        <p>Trailer: <a href="${mediaData.trailer}" target="_blank">Watch</a></p>
    `;
}
