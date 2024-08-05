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
      console.log("remove all");
//      localStorage.removeItem('movies');
      localStorage.clear();

      console.log("remove all - success");
      displayMediaFromLocalStorage();
  }
}


// Function to save media to JSON file instead of localStorage
function saveMediaToFile(mediaData) {
  fetch('data.json')
      .then(response => response.json())
      .then(existingData => {
          existingData.push(mediaData);
          return fetch('saveData.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(existingData)
          });
      })
      .then(response => {
          if (!response.ok) throw new Error('Failed to save data');
          console.log('Media saved successfully');
          displayMediaFromJSON();
      })
      .catch(error => console.error('Error saving media:', error));
}
