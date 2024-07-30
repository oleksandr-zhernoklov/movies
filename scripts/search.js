const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';
async function searchMedia() {
    const mediaName = document.querySelector('#search').value.trim();
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
            if (movieData.results && movieData.results.length > 0) {
                const movie = movieData.results[0];
                await handleMediaData(movie, 'movie');
            }

            if (seriesData.results && seriesData.results.length > 0) {
                const series = seriesData.results[0];
                await handleMediaData(series, 'series');
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

async function handleMediaData(media, type) {
    const mediaId = media.id;
    const detailsUrl = type === 'movie' 
        ? `https://api.themoviedb.org/3/movie/${mediaId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews` 
        : `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const videosUrl = type === 'movie' 
        ? `https://api.themoviedb.org/3/movie/${mediaId}/videos?api_key=${tmdbApiKey}`
        : `https://api.themoviedb.org/3/tv/${mediaId}/videos?api_key=${tmdbApiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    const trailer = videosData.results.find(video => video.type === 'Trailer');
    const trailerLink = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';
// Inside handleMediaData function

const mediaData = {
    id: mediaId,
    poster: `https://image.tmdb.org/t/p/w200${media.poster_path}`,
    title: type === 'movie' ? media.title : media.name,
    originalTitle: type === 'movie' ? media.original_title : media.original_name, // Add this line
    genre: detailsData.genres.map(g => g.name).join(', ') || 'N/A',
    year: type === 'movie' ? media.release_date.split('-')[0] : media.first_air_date.split('-')[0],
    length: type === 'movie' ? `${detailsData.runtime} min` : `${detailsData.number_of_seasons} seasons, ${detailsData.number_of_episodes} episodes`,
    rating: media.vote_average || 'N/A',
    description: media.overview || 'N/A',
    director: detailsData.credits.crew.find(member => member.job === 'Director')?.name || 'N/A',
    actors: detailsData.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A',
    review: detailsData.reviews.results[0]?.content || 'N/A',
    tmdbLink: type === 'movie' ? `https://www.themoviedb.org/movie/${mediaId}` : `https://www.themoviedb.org/tv/${mediaId}`,
    imdbLink: detailsData.imdb_id ? `https://www.imdb.com/title/${detailsData.imdb_id}` : 'N/A',
    tolokaLink: `https://toloka.to/tracker.php?nm=${encodeURIComponent(type === 'movie' ? media.title : media.name)}`,
    rutrackerLink: `https://rutracker.org/forum/tracker.php?nm=${encodeURIComponent(type === 'movie' ? media.title : media.name)}`,
    trailer: trailerLink,
    type: type.toLowerCase()
};

console.log('Constructed media data:', mediaData);

saveMediaToLocalStorage(mediaData, type);
displayMediaFromLocalStorage();
displaySummary(mediaData);

}

function saveMediaToLocalStorage(mediaData, type) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    const index = movies.findIndex(item => item.id === mediaData.id && item.type === type);

    if (index !== -1) {
        movies[index] = mediaData;
    } else {
        movies.push(mediaData);
    }

    localStorage.setItem('movies/', JSON.stringify(movies));
}

async function updateMedia(index, title, type) {
    const searchUrl = type === 'movie' 
        ? `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`
        : `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
        const media = data.results[0];
        await handleMediaData(media, type);
    } else {
        alert('No updated information found.');
    }
}


function saveMediaToLocalStorage(mediaData, type) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    movies.push(mediaData);
    localStorage.setItem('movies/', JSON.stringify(movies));
}


async function searchAndUpdate() {
    const mediaName = document.querySelector('#search').value.trim();
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
            if (movieData.results && movieData.results.length > 0) {
                const movie = movieData.results[0];
                await handleMediaData(movie, 'movie');
            }

            if (seriesData.results && seriesData.results.length > 0) {
                const series = seriesData.results[0];
                await handleMediaData(series, 'series');
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
