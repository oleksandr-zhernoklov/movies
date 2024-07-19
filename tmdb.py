import os
import re
import csv
import requests
import pandas as pd
from datetime import datetime
from jinja2 import Template

# Function to map genre id to value
def get_genre_value(genre_id):
    genre_mapping = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western'
    }
    return genre_mapping.get(genre_id, 'Unknown')

# Function to generate HTML table
def generate_html_table(successful_results):
    # Load the HTML template
    template_str = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Movie Results</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/css/theme.default.min.css">
        <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.3/js/jquery.tablesorter.min.js"></script>
        <style>
            .checkbox-column {
                text-align: center;
            }
        </style>
    </head>
    <body>
    
    <h2>Successful Results</h2>
    
    <table id="movieTable" class="tablesorter">
        <thead>
            <tr>
                <th>File</th>
                <th>File Size (GB)</th>
                <th>Title</th>
                <th>Genre</th>
                <th>TMDB ID</th>
                <th>Year</th>
                <th>Length (minutes)</th>
                <th>TMDB Link</th>
                <th>Description</th>
                <th>Rating</th>
                <th class="checkbox-column">Easy</th>
                <th class="checkbox-column">Heavy</th>
                <th>Toloka Link</th>
                <th>Rutracker Link</th>
            </tr>
        </thead>
        <tbody>
            {% for result in successful_results %}
                <tr>
                    <td>{{ result['File'] }}</td>
                    <td>{{ result['File_gb'] }}</td>
                    <td>{{ result['Title'] }}</td>
                    <td>{{ result['Genre']|join(', ') }}</td>
                    <td>{{ result['TMDB ID'] }}</td>
                    <td>{{ result['Year'] }}</td>
                    <td>{{ result['Length'] }}</td>
                    <td><a href="{{ result['TMDB Link'] }}" target="_blank">{{ result['TMDB Link'] }}</a></td>
                    <td>{{ result['Description'] }}</td>
                    <td>{{ result['Rating'] }}</td>
                    <td class="checkbox-column"><input type="checkbox" class="easy-checkbox" data-file="{{ result['File'] }}"></td>
                    <td class="checkbox-column"><input type="checkbox" class="heavy-checkbox" data-file="{{ result['File'] }}"></td>
                    <td><a href="https://toloka.to/tracker.php?nm={{ result['Title'] }}" target="_blank">Toloka</a></td>
                    <td><a href="https://rutracker.org/forum/tracker.php?nm={{ result['Title'] }}" target="_blank">Rutracker</a></td>
                </tr>
            {% endfor %}
        </tbody>
    </table>
    
    <script>
        $(document).ready(function(){
            // Initialize tablesorter
            $("#movieTable").tablesorter();

            // Save checkbox values to localStorage
            function saveCheckboxValues() {
                var easyValues = {};
                var heavyValues = {};

                $(".easy-checkbox").each(function() {
                    var file = $(this).data("file");
                    easyValues[file] = $(this).is(":checked");
                });

                $(".heavy-checkbox").each(function() {
                    var file = $(this).data("file");
                    heavyValues[file] = $(this).is(":checked");
                });

                localStorage.setItem("easyValues", JSON.stringify(easyValues));
                localStorage.setItem("heavyValues", JSON.stringify(heavyValues));
            }

            // Load checkbox values from localStorage
            function loadCheckboxValues() {
                var easyValues = JSON.parse(localStorage.getItem("easyValues") || "{}");
                var heavyValues = JSON.parse(localStorage.getItem("heavyValues") || "{}");

                $(".easy-checkbox").each(function() {
                    var file = $(this).data("file");
                    $(this).prop("checked", easyValues[file] || false);
                });

                $(".heavy-checkbox").each(function() {
                    var file = $(this).data("file");
                    $(this).prop("checked", heavyValues[file] || false);
                });
            }

            // Save checkbox values on change
            $(".easy-checkbox, .heavy-checkbox").on("change", saveCheckboxValues);

            // Load checkbox values on page load
            loadCheckboxValues();
        });
    </script>
    
    </body>
    </html>
    """
    template = Template(template_str)

    # Render the template with the successful_results data
    rendered_html = template.render(successful_results=successful_results)

    # Save the rendered HTML to a file
    with open('downloaded.html', 'w', encoding='utf-8') as html_file:
        html_file.write(rendered_html)

    print('HTML file generated successfully: downloaded.html')

# Function to process video files from multiple directories
def process_video_files(directories, tmdb_api_key):
    video_files = []
    for directory in directories:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.lower().endswith(('.mp4', '.avi', '.mkv')):
                    video_files.append(os.path.join(root, file))

    # Lists to store successful and failed results
    successful_results = []
    failed_results = []

    # TMDB API request
    for file in video_files:
        # Extract the filename without extension
        filename = os.path.splitext(os.path.basename(file))[0]
        file_gb = round(os.path.getsize(file) / (1024 * 1024 * 1024), 2)
        # Remove year from filename (inside brackets or after dot)
        filename_without_year = re.sub(r"\(\d{4}\)|\.\d{4}(?=\D|$)", "", filename).strip()
        # Extract only the movie name
        pattern = r"^(.*?)\s\(\d{4}\)"
        match = re.match(pattern, filename)
        if match:
            movie_name = match.group(1)
            print(match.group(1))
        else:
            # No movie found
            failed_results.append({'File': file, 'Result': 'No regexp'})
            continue

        # Make a request to TMDB API to search for the movie
        url = f"https://api.themoviedb.org/3/search/movie?api_key={tmdb_api_key}&query={movie_name}"
        response = requests.get(url)

        if response.status_code == 200:
            # Request successful
            data = response.json()
            if data['results']:
                # Get the first movie result
                movie = data['results'][0]

                # Extract relevant information from the response
                movie_title = movie['title']
                movie_genre_ids = movie['genre_ids']
                movie_id = movie['id']
                movie_year = datetime.strptime(movie['release_date'], '%Y-%m-%d').year

                # Map genre ids to corresponding values
                genre_values = [get_genre_value(genre_id) for genre_id in movie_genre_ids]

                # Get movie details
                details_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={tmdb_api_key}"
                details_response = requests.get(details_url)

                if details_response.status_code == 200:
                    details_data = details_response.json()
                    movie_description = details_data['overview']
                    movie_rating = details_data['vote_average']
                    movie_length = details_data['runtime'] if details_data['runtime'] else 'N/A'
                else:
                    movie_description = 'N/A'
                    movie_rating = 'N/A'
                    movie_length = 'N/A'

                # Generate TMDB link
                tmdb_link = f"https://www.themoviedb.org/movie/{movie_id}"

                # Store successful result
                successful_results.append({
                    'File': file.replace(",", ""),
                    'File_gb': file_gb,
                    'Title': movie_title,
                    'Genre': genre_values,
                    'TMDB ID': movie_id,
                    'Year': movie_year,
                    'Length': movie_length,
                    'TMDB Link': tmdb_link,
                    'Description': movie_description,
                    'Rating': movie_rating,
                    'Toloka Link': f"https://toloka.to/tracker.php?nm={movie_title}",
                    'Rutracker Link': f"https://rutracker.org/forum/tracker.php?nm={movie_title}"
                })
            else:
                # No movie found
                failed_results.append({'File': file, 'Result': 'No movie found'})
        else:
            # Request failed
            failed_results.append({'File': file, 'Result': 'Failed to retrieve movie information'})

    successful_results = sorted(successful_results, key=lambda x: x['Year'])
    return successful_results, failed_results

def save_results_to_csv_and_excel(successful_results, failed_results):
    # Save successful results to CSV file
    successful_csv_path = 'successful_results.csv'
    successful_fields = ['File', 'File_gb', 'Title', 'Genre', 'TMDB ID', 'Year', 'Length', 'TMDB Link', 'Description', 'Rating', 'Toloka Link', 'Rutracker Link']

    with open(successful_csv_path, 'w', newline='', encoding='utf-8') as successful_file:
        writer = csv.DictWriter(successful_file, fieldnames=successful_fields)
        writer.writeheader()
        writer.writerows(successful_results)

    print(f'Successful results saved to: {successful_csv_path}')

    # Save successful results to Excel file
    successful_excel_path = 'successful_results.xlsx'

    df = pd.DataFrame(successful_results)
    df.to_excel(successful_excel_path, index=False, engine='openpyxl')

    print(f'Successful results saved to: {successful_excel_path}')

    # Save failed results to CSV file
    failed_csv_path = 'failed_results.csv'
    failed_fields = ['File', 'Result']

    with open(failed_csv_path, 'w', newline='', encoding='utf-8') as failed_file:
        writer = csv.DictWriter(failed_file, fieldnames=failed_fields)
        writer.writeheader()
        writer.writerows(failed_results)

    print(f'Failed results saved to: {failed_csv_path}')

# Main function
def main():
    # List of directories to process
    directories = [
        r'D:/Movies',
        r'F:',
        r'E:/Download2',
        r'C:/Users/zhern/Videos',
        # Add more directories as needed
    ]

    # TMDB API key
    tmdb_api_key = 'fb70d4fb95572e0ddd9bc99f90734e46'

    # Process video files and get results
    successful_results, failed_results = process_video_files(directories, tmdb_api_key)

    # Save results to CSV and Excel files
    save_results_to_csv_and_excel(successful_results, failed_results)

    # Generate HTML table
    generate_html_table(successful_results)

if __name__ == "__main__":
    main()
