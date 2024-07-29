function displayMediaFromLocalStorage() {
    const mediaTableBody = document.querySelector('#media-table tbody');
    mediaTableBody.innerHTML = '';

    const mediaList = JSON.parse(localStorage.getItem('movies/')) || [];

    mediaList.forEach((media, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${media.poster || ''}" alt="Poster" style="width: 50px;"></td>
            <td>${media.title}</td>
            <td>${media.genre}</td>
            <td>${media.year}</td>
            <td>${media.length}</td>
            <td>${media.rating}</td>
            <td>${media.description}</td>
            <td>${media.director || 'N/A'}</td>
            <td>${media.actors || 'N/A'}</td>
            <td class="collapsible">${media.review || 'N/A'}</td>
            <td>${media.type}</td>
            <td><a href="${media.tmdbLink || '#'}" target="_blank">TMDB</a></td>
            <td><a href="${media.imdbLink || '#'}" target="_blank">IMDb</a></td>
            <td><a href="${media.tolokaLink || '#'}" target="_blank">Toloka</a></td>
            <td><a href="${media.rutrackerLink || '#'}" target="_blank">Rutracker</a></td>
            <td><a href="${media.trailer || '#'}" target="_blank">Trailer</a></td>
            <td>
                <button onclick="editMedia(${index})">Edit</button>
                <button onclick="deleteMedia(${index})">Delete</button>
            </td>
        `;

        mediaTableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        displayMediaFromLocalStorage();
        const collapsibleHeader = document.querySelector('th.collapsible');
        if (collapsibleHeader) {
            collapsibleHeader.addEventListener('click', toggleReviewColumn);
        }
    } catch (error) {
        console.error("Error loading media from local storage:", error);
    }
});

function toggleReviewColumn() {
    const reviewCells = document.querySelectorAll('td.collapsible');
    reviewCells.forEach(cell => {
        cell.classList.toggle('expanded');
    });
}
