function editMedia(index) {
    // Your code to edit media
}

function deleteMedia(index) {
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    movies.splice(index, 1);
    localStorage.setItem('movies/', JSON.stringify(movies));
    displayMediaFromLocalStorage();
}