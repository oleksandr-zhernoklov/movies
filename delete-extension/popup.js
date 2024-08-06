document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const deleteButton = document.getElementById('deleteButton');

  deleteButton.addEventListener('click', function() {
    const fileEntry = fileInput.files[0];
    if (fileEntry) {
      deleteFileOrDirectory(fileEntry);
    }
  });

  function deleteFileOrDirectory(fileEntry) {
    if (fileEntry.isFile) {
      fileEntry.remove(() => {
        console.log('File deleted successfully');
      }, errorHandler);
    } else if (fileEntry.isDirectory) {
      const reader = fileEntry.createReader();
      reader.readEntries(entries => {
        const promises = entries.map(entry => deleteFileOrDirectory(entry));
        Promise.all(promises)
          .then(() => fileEntry.remove(() => {
            console.log('Directory deleted successfully');
          }, errorHandler))
          .catch(errorHandler);
      }, errorHandler);
    }
  }

  function errorHandler(error) {
    console.error('Error:', error);
  }
});
