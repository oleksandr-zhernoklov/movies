document.addEventListener('DOMContentLoaded', () => {
    displayMediaFromLocalStorage();
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
                trailer: trailerLink,
                type: 'movie'
            };

            if (!isDuplicateMedia(movieId)) {
                saveMediaToLocalStorage(movieData);
                displayMediaFromLocalStorage();
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

            const detailsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${tmdbApiKey}&append_to_response=credits`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            const seriesData = {
                id: seriesId,
                poster: `https://image.tmdb.org/t/p/w200${series.poster_path}`,
                title: series.name,
                genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
                year: series.first_air_date ? series.first_air_date.split('-')[0] : 'N/A',
                seasons: detailsData.seasons.length || 'N/A',
                episodes: detailsData.number_of_episodes || 'N/A',
                rating: series.vote_average || 'N/A',
                description: series.overview || 'N/A',
                tmdbLink: `https://www.themoviedb.org/tv/${seriesId}`,
                imdbLink: detailsData.external_ids.imdb_id ? `https://www.imdb.com/title/${detailsData.external_ids.imdb_id}` : 'N/A',
                tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(series.name)}`,
                rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(series.name)}`,
                type: 'series'
            };

            if (!isDuplicateMedia(seriesId)) {
                saveMediaToLocalStorage(seriesData);
                displayMediaFromLocalStorage();
                displaySummary(seriesData);
            } else {
                alert('Series already exists in the list.');
            }
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert('Error fetching series data.');
    }

    document.querySelector('#search').focus();
}

function saveMediaToLocalStorage(mediaData) {
    const media = JSON.parse(localStorage.getItem('media')) || [];
    media.push(mediaData);
    localStorage.setItem('media', JSON.stringify(media));
}

function isDuplicateMedia(mediaId) {
    const media = JSON.parse(localStorage.getItem('media')) || [];
    return media.some(mediaItem => mediaItem.id === parseInt(mediaId));
}

function displayMediaFromLocalStorage() {
    const media = JSON.parse(localStorage.getItem('media')) || [];
    const tableBody = document.querySelector('#mediaTable tbody');
    tableBody.innerHTML = '';

    media.forEach((mediaItem, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${mediaItem.poster}" alt="${mediaItem.title} Poster" class="poster"></td>
            <td>${mediaItem.title}</td>
            <td>${mediaItem.genre}</td>
            <td>${mediaItem.year}</td>
            <td>${mediaItem.length || mediaItem.seasons || 'N/A'}</td>
            <td>${mediaItem.rating}</td>
            <td class="collapsible">${mediaItem.description}</td>
            <td>${mediaItem.director || 'N/A'}</td>
            <td class="collapsible">${mediaItem.actors || 'N/A'}</td>
            <td class="collapsible">${mediaItem.review || 'N/A'}</td>
            <td><a href="${mediaItem.tmdbLink}" target="_blank">TMDB</a></td>
            <td><a href="${mediaItem.imdbLink}" target="_blank">IMDb</a></td>
            <td><a href="${mediaItem.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${mediaItem.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td><a href="${mediaItem.trailer}" target="_blank">Trailer</a></td>
            <td><button class="button remove-button" data-id="${mediaItem.id}">Remove</button></td>
        `;

        tableBody.appendChild(row);
    });

    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const mediaId = e.target.getAttribute('data-id');
            removeMedia(mediaId);
        });
    });

    updateRowCount();
}

function removeMedia(mediaId) {
    let media = JSON.parse(localStorage.getItem('media')) || [];
    media = media.filter(mediaItem => mediaItem.id !== parseInt(mediaId));
    localStorage.setItem('media', JSON.stringify(media));
    displayMediaFromLocalStorage();
}

function updateRowCount() {
    const rowCount = document.querySelectorAll('#mediaTable tbody tr').length;
    document.querySelector('#rowCount').textContent = `Total Media: ${rowCount}`;
}

function displaySummary(mediaItem) {
    const summary = document.querySelector('#summary');
    summary.innerHTML = `
        <h2>${mediaItem.title}</h2>
        <p><strong>Genre:</strong> ${mediaItem.genre}</p>
        <p><strong>Year:</strong> ${mediaItem.year}</p>
        <p><strong>Length/Seasons:</strong> ${mediaItem.length || mediaItem.seasons}</p>
        <p><strong>Rating:</strong> ${mediaItem.rating}</p>
        <p><strong>Description:</strong> ${mediaItem.description}</p>
        <p><strong>Director:</strong> ${mediaItem.director || 'N/A'}</p>
        <p><strong>Actors:</strong> ${mediaItem.actors || 'N/A'}</p>
        <p><strong>Review:</strong> ${mediaItem.review || 'N/A'}</p>
        <p><strong>Trailer:</strong> <a href="${mediaItem.trailer}" target="_blank">Watch</a></p>
    `;
}
