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

function saveMediaToLocalStorage(media, type) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    media.type = type;
    movies.push(media);
    localStorage.setItem('movies/', JSON.stringify(movies));
}
