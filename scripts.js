// document.addEventListener('DOMContentLoaded', () => {
//     displayMediaFromLocalStorage();
//     document.querySelector('#search').focus();
// });

const tmdbApiKey = 'fb70d4fb95572e0ddd9bc99f90734e46';

// async function searchMedia() {
//     let mediaName = document.querySelector('#search').value.trim();
//     if (mediaName.startsWith('.')) {
//         mediaName = mediaName.substring(1).trim();
//         document.querySelector('#search').value = mediaName;
//     }

//     if (mediaName.length === 0) {
//         alert('Please enter a movie or series name.');
//         return;
//     }

//     try {
//         const movieSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(mediaName)}`;
//         const seriesSearchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(mediaName)}`;

//         const [movieResponse, seriesResponse] = await Promise.all([fetch(movieSearchUrl), fetch(seriesSearchUrl)]);
//         const movieData = await movieResponse.json();
//         const seriesData = await seriesResponse.json();

//         if ((movieData.results && movieData.results.length > 0) || (seriesData.results && seriesData.results.length > 0)) {
//             const movie = movieData.results[0];
//             const series = seriesData.results[0];

//             if (movie) {
//                 await handleMovieData(movie);
//             }

//             if (series) {
//                 await handleSeriesData(series);
//             }
//         } else {
//             alert('No results found.');
//         }
//     } catch (error) {
//         alert('Error fetching data.');
//         console.error(error);
//     }

//     document.querySelector('#search').focus();
// }

// function toggleReviewColumn() {
//     const reviewColumn = document.querySelector('#mediaTable th.collapsible');
//     const reviewCells = document.querySelectorAll('#mediaTable td.collapsible');
//     reviewColumn.classList.toggle('expanded');
//     reviewCells.forEach(cell => cell.classList.toggle('expanded'));
// }

// function isDuplicateMedia(id) {
//     const storedMedia = JSON.parse(localStorage.getItem('movies/')) || [];
//     return storedMedia.some(media => media.id === id);
// // }

// function saveMediaToLocalStorage(mediaData, type) {
//     const storedMedia = JSON.parse(localStorage.getItem('movies/')) || [];
//     mediaData.type = type;
//     storedMedia.push(mediaData);
//     localStorage.setItem('movies/', JSON.stringify(storedMedia));
// }

// function displayMediaFromLocalStorage() {
//     const storedMedia = JSON.parse(localStorage.getItem('movies/')) || [];
//     const mediaTableBody = document.querySelector('#mediaTableBody');
//     if (!mediaTableBody) {
//         console.error('Error: #mediaTableBody element not found.');
//         return;
//     }

//     mediaTableBody.innerHTML = '';
//     storedMedia.forEach((media, index) => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td><img src="${media.poster}" alt="${media.title} Poster"></td>
//             <td>${media.title}</td>
//             <td>${media.genre}</td>
//             <td>${media.year}</td>
//             <td>${media.length}</td>
//             <td>${media.rating}</td>
//             <td>${media.description}</td>
//             <td>${media.director}</td>
//             <td>${media.actors}</td>
//             <td class="collapsible">${media.review}</td>
//             <td><a href="${media.tmdbLink}" target="_blank">TMDB</a></td>
//             <td><a href="${media.imdbLink}" target="_blank">IMDb</a></td>
//             <td><a href="${media.tolokaLink}" target="_blank">Toloka</a></td>
//             <td><a href="${media.rutrackerLink}" target="_blank">Rutracker</a></td>
//             <td><a href="${media.trailer}" target="_blank">Trailer</a></td>
//             <td><button onclick="removeMedia(${media.id})">Remove</button></td>
//         `;
//         mediaTableBody.appendChild(row);
//     });
// }

// function removeMedia(id) {
//     let storedMedia = JSON.parse(localStorage.getItem('movies/')) || [];
//     storedMedia = storedMedia.filter(media => media.id !== id);
//     localStorage.setItem('movies/', JSON.stringify(storedMedia));
//     displayMediaFromLocalStorage();
// }

// function exportMedia() {
//     const storedMedia = localStorage.getItem('movies/');
//     if (!storedMedia) {
//         alert('No data to export.');
//         return;
//     }

//     const blob = new Blob([storedMedia], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'mediaList.json';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// }


// function importData() {
//     document.getElementById('fileInput').click();
// }
// function handleFileSelect(event) {
//     const file = event.target.files[0];
//     const reader = new FileReader();
//     reader.onload = function(e) {
//         const importedMedia = JSON.parse(e.target.result);
//         if (Array.isArray(importedMedia)) {
//             localStorage.setItem('movies/', JSON.stringify(importedMedia));
//             displayMediaFromLocalStorage();
//         } else {
//             alert('Invalid data format.');
//         }
//     };
//     reader.readAsText(file);
// }

// function displaySummary(mediaData) {
//     const summarySection = document.querySelector('#summary');
//     summarySection.innerHTML = `
//         <h2>Summary</h2>
//         <p>Title: ${mediaData.title}</p>
//         <p>Year: ${mediaData.year}</p>
//         <p>Length: ${mediaData.length}</p>
//         <p>Rating: ${mediaData.rating}</p>
//         <p>Director: ${mediaData.director}</p>
//         <p>Actors: ${mediaData.actors}</p>
//         <p>Description: ${mediaData.description}</p>
//         <p>Review: ${mediaData.review}</p>
//         <p>Trailer: <a href="${mediaData.trailer}" target="_blank">Watch</a></p>
//     `;
// }
