function displayMediaFromLocalStorage() {
    const mediaTableBody = document.getElementById('mediaTableBody');
    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    
    mediaTableBody.innerHTML = ''; // Clear the table body first

    movies.forEach((movie, index) => {
        const row = mediaTableBody.insertRow();
        
        row.insertCell(0).innerText = movie.type || 'N/A';
        row.insertCell(1).innerHTML = movie.poster ? `<img src="${movie.poster}" alt="Poster">` : 'N/A';
        row.insertCell(2).innerText = movie.title;
        row.insertCell(3).innerText = movie.genre;
        row.insertCell(4).innerText = movie.year;
        row.insertCell(5).innerText = movie.length;
        row.insertCell(6).innerText = movie.rating;
        row.insertCell(7).innerText = movie.description;
        row.insertCell(8).innerText = movie.director;
        row.insertCell(9).innerText = movie.actors;
        row.insertCell(10).innerText = movie.review;
        row.insertCell(11).innerHTML = movie.tmdbLink ? `<a href="${movie.tmdbLink}" target="_blank">TMDb</a>` : 'N/A';
        row.insertCell(12).innerHTML = movie.imdbLink ? `<a href="${movie.imdbLink}" target="_blank">IMDb</a>` : 'N/A';
        row.insertCell(13).innerHTML = movie.tolokaLink ? `<a href="${movie.tolokaLink}" target="_blank">Toloka</a>` : 'N/A';
        row.insertCell(14).innerHTML = movie.rutrackerLink ? `<a href="${movie.rutrackerLink}" target="_blank">Rutracker</a>` : 'N/A';
        row.insertCell(15).innerHTML = movie.trailer ? `<a href="${movie.trailer}" target="_blank">Trailer</a>` : 'N/A';
    });
}

document.addEventListener('DOMContentLoaded', displayMediaFromLocalStorage);
