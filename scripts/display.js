function displayMediaFromLocalStorage() {
    const mediaTableBody = document.querySelector('#mediaTable tbody');
    mediaTableBody.innerHTML = '';

    const movies = JSON.parse(localStorage.getItem('movies/')) || [];
    console.log('Loaded movies from local storage:', movies);

    movies.forEach((media, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${media.poster}" alt="${media.title}"></td>
            <td>${media.type}</td>
            <td>${media.title}</td>
            <td>${media.originalTitle || 'N/A'}</td>
            <td>${media.genre}</td>
            <td>${media.year}</td>
            <td>${media.length}</td>
            <td>${media.rating}</td>
            <td>${media.description}</td>
            <td>${media.director}</td>
            <td>${media.actors}</td>
            <td class="review-cell collapsible">${media.review}</td>
            <td><a href="${media.tmdbLink}" target="_blank">TMDb</a></td>
            <td><a href="${media.tolokaLink}" target="_blank">Toloka</a></td>
            <td><a href="${media.rutrackerLink}" target="_blank">Rutracker</a></td>
            <td>${media.trailer !== 'N/A' ? `<a href="${media.trailer}" target="_blank">Watch</a>` : 'N/A'}</td>
            <td><button onclick="updateMedia(${index}, '${media.title}', '${media.type}')">Update</button></td>
            <td><button onclick="deleteMedia(${index})">Remove</button></td>
        `;

        // Adding the hidden class to the review cell if reviews are toggled off
        const reviewCell = row.querySelector('.review-cell');
        console.log(`Processing row ${index + 1}, reviewCell:`, reviewCell);
        console.log(`reviewColumnIsVisible: ${reviewColumnIsVisible}`);

        if (!reviewColumnIsVisible) {
            reviewCell.classList.add('hidden');
            console.log(`Row ${index + 1} review cell is hidden`);
        } else {
            reviewCell.classList.remove('hidden');
            console.log(`Row ${index + 1} review cell is visible`);
        }

        mediaTableBody.appendChild(row);
    });
}




function displaySummary(mediaData) {
    const summarySection = document.querySelector('#summary');
    summarySection.innerHTML = `
        <h2>Summary</h2>
        <img src="${mediaData.poster}" alt="Poster of ${mediaData.title}" style="width: 200px;">
        <p>Title: ${mediaData.title}</p>
        <p>Original Title: ${mediaData.originalTitle || 'N/A'}</p> <!-- Add this line -->
        <p>Year: ${mediaData.year}</p>
        <p>Length: ${mediaData.length}</p>
        <p>Rating: ${mediaData.rating}</p>
        <p>Director: ${mediaData.director}</p>
        <p>Actors: ${mediaData.actors}</p>
        <p>Description: ${mediaData.description}</p>
        <p>Review: ${mediaData.review}</p>
        <p>Toloka Link: <a href="${mediaData.tolokaLink}" target="_blank">Toloka</a></p>
        <p>Rutracker Link: <a href="${mediaData.rutrackerLink}" target="_blank">Rutracker</a></p>
        <p>Trailer: <a href="${mediaData.trailer}" target="_blank">Watch</a></p>
    `;
}
