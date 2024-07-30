function editMedia(index) {
    // Your code to edit media
}

function deleteMedia(index) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    movies.splice(index, 1);
    localStorage.setItem('movies/', JSON.stringify(movies));
    displayMediaFromLocalStorage();
}

function isDuplicateMedia(id) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    return movies.some(movie => movie.id === id);
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