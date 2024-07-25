import os
import re
import shutil

# Define the path to the base movie folder
base_path = '/path/to/your/Movie/folder'

# Regular expression pattern to extract the year from file names
year_pattern = re.compile(r'\((\d{4})\)')

def extract_year(filename):
    match = year_pattern.search(filename)
    if match:
        return match.group(1)
    return None

def organize_movies_by_year(base_path):
    # Ensure base_path exists
    if not os.path.exists(base_path):
        print(f"The directory {base_path} does not exist.")
        return

    for filename in os.listdir(base_path):
        file_path = os.path.join(base_path, filename)
        
        # Skip directories and non-file items
        if os.path.isdir(file_path):
            continue
        
        year = extract_year(filename)
        if year:
            year_folder = os.path.join(base_path, year)
            # Create year folder if it does not exist
            if not os.path.exists(year_folder):
                os.makedirs(year_folder)
            
            # Move the file to the year folder
            #shutil.move(file_path, os.path.join(year_folder, filename))
            print(f"Moved {filename} to {year_folder}")
        else:
            print(f"No year found in {filename}")

if __name__ == "__main__":
    organize_movies_by_year(base_path)
