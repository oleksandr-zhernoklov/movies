document.addEventListener('DOMContentLoaded', () => {
    try {
        displayMediaFromLocalStorage();
        const collapsibleHeader = document.querySelector('.collapsible');
        if (collapsibleHeader) {
            collapsibleHeader.addEventListener('click', toggleReviewColumn);
        }
    } catch (error) {
        console.error("Error loading media from local storage:", error);
    }
});

function toggleReviewColumn() {
    const reviewCells = document.querySelectorAll('.collapsible');
    reviewCells.forEach(cell => {
        cell.classList.toggle('expanded');
    });
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


