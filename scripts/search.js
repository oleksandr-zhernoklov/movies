const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';
let movieDataGlobal = null;
let seriesDataGlobal = null;

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

        movieDataGlobal = movieData.results[0];
        seriesDataGlobal = seriesData.results[0];

        if (movieDataGlobal && seriesDataGlobal) {
            // Display the prompt and buttons for user selection
            document.querySelector('#choicePrompt').style.display = 'block';
            document.querySelector('#choiceText').innerHTML =
                `Both a movie and a series found with the name "${mediaName}".<br>` +
                `1. <strong>Movie</strong>: ${movieDataGlobal.title} (Released: ${movieDataGlobal.release_date ? movieDataGlobal.release_date.split('-')[0] : 'N/A'})<br>` +
                `2. <strong>Series</strong>: ${seriesDataGlobal.name} (First aired: ${seriesDataGlobal.first_air_date ? seriesDataGlobal.first_air_date.split('-')[0] : 'N/A'})`;
        } else if (movieDataGlobal) {
            await handleMediaData(movieDataGlobal, 'movie');
        } else if (seriesDataGlobal) {
            await handleMediaData(seriesDataGlobal, 'series');
        } else {
            alert('No results found.');
        }
    } catch (error) {
        alert('Error fetching data.');
        console.error(error);
    }

    document.querySelector('#search').focus();
}

async function chooseOption(type) {
    if (type === 'movie') {
        await handleMediaData(movieDataGlobal, 'movie');
    } else if (type === 'series') {
        await handleMediaData(seriesDataGlobal, 'series');
    }
    document.querySelector('#search').value = '';
    // Hide the prompt and reset global data
    document.querySelector('#choicePrompt').style.display = 'none';
    movieDataGlobal = null;
    seriesDataGlobal = null;
}
async function handleMediaData(media, type) {
    const mediaId = media.id;
    const detailsUrl = `https://api.themoviedb.org/3/${type === 'movie' ? 'movie' : 'tv'}/${mediaId}?api_key=${tmdbApiKey}&append_to_response=credits,reviews`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const videosUrl = `https://api.themoviedb.org/3/${type === 'movie' ? 'movie' : 'tv'}/${mediaId}/videos?api_key=${tmdbApiKey}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    const trailer = videosData.results.find(video => video.type === 'Trailer');
    const trailerLink = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : 'N/A';

    const mediaData = {
        id: mediaId,
        poster: `https://image.tmdb.org/t/p/w200${media.poster_path}`,
        title: type === 'movie' ? media.title : media.name,
        originalTitle: type === 'movie' ? media.original_title : media.original_name,
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
