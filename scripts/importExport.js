function importData() {
    document.getElementById('fileInput').click();
}

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('movies/', JSON.stringify(data));
        displayMediaFromLocalStorage();
    };
    reader.readAsText(file);
}

function exportData() {
    const data = JSON.parse(localStorage.getItem('movies/')) || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movies.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
