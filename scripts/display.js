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
            <td><a href="${media.tolokaLink || '#'}" target="_blank">Toloka</a></td>
            <td><a href="${media.rutrackerLink || '#'}" target="_blank">Rutracker</a></td>
            <td><a href="${media.trailer || '#'}" target="_blank">Trailer</a></td>
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
        makeTableSortable();
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

function makeTableSortable() {
    const table = document.querySelector('#media-table');
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            const tableBody = table.querySelector('tbody');
            const rows = Array.from(tableBody.querySelectorAll('tr'));
            const isAsc = header.classList.toggle('asc');
            rows.sort((a, b) => {
                const aText = a.children[index].innerText.trim();
                const bText = b.children[index].innerText.trim();
                return isAsc ? aText.localeCompare(bText) : bText.localeCompare(aText);
            });
            rows.forEach(row => tableBody.appendChild(row));
        });
    });
}
