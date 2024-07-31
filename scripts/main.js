let reviewColumnIsVisible = true;

function toggleReviewColumn() {
    const reviewCells = document.querySelectorAll('.collapsible');
    reviewCells.forEach(cell => {
      if (reviewColumnIsVisible) {
        cell.classList.add('hidden');
        console.log('hidden');
      } else {
        cell.classList.remove('hidden');
        console.log('visible');
      }
    });
    reviewColumnIsVisible = !reviewColumnIsVisible;
  }

document.addEventListener('DOMContentLoaded', () => {
    try {
        displayMediaFromLocalStorage();
        const toggleReviewButton = document.querySelector('#toggleReviewButton');
        if (toggleReviewButton) {
            toggleReviewButton.addEventListener('click', toggleReviewColumn);
        }
    } catch (error) {
        console.error("Error loading media from local storage:", error);
    }
});
function removeAllMovies() {
  if (confirm('Are you sure you want to remove all movies?')) {
      localStorage.removeItem('movies');
      displayMoviesFromLocalStorage();
  }
}