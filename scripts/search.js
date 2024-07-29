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
