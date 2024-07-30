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
    const mediaWithType = { ...mediaData, type: type || 'Unknown' }; // Add default type if missing
    movies.push(mediaWithType);
    localStorage.setItem('movies/', JSON.stringify(movies));
}
