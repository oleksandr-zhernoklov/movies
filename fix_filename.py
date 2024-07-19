import os
import re

# Regular expression to find movie name and year for correction
pattern = re.compile(r'^(.*?)[\.\s](\d{4})(.*)$')
additional_pattern = re.compile(r'^(.*?)(\(\d{4}\))(.*)$')

# Regular expression to identify correctly named files
correct_pattern = re.compile(r'^(.*?)\s\(\d{4}\)')

# List of allowed file extensions
allowed_extensions = ['.mp4', '.avi', '.mkv']

def correct_filenames_in_directory(directory):
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath) and os.path.splitext(filename)[1].lower() in allowed_extensions:
            if correct_pattern.match(filename):
                print(f"Skipped: {filename} (already correctly named)")
                continue

            match = pattern.search(filename)
            if match:
                name, year, rest = match.groups()
                name = name.replace('.', ' ').strip()
                new_filename = f"{name} ({year}){rest}"
                new_filepath = os.path.join(directory, new_filename)
                os.rename(filepath, new_filepath)
                print(f"Corrected: {filename} -> {new_filename}")
            else:
                match = additional_pattern.search(filename)
                if match:
                    name, year, rest = match.groups()
                    name = name.replace('.', ' ').strip()
                    new_filename = f"{name} {year}{rest}"
                    new_filepath = os.path.join(directory, new_filename)
                    os.rename(filepath, new_filepath)
                    print(f"Corrected additional: {filename} -> {new_filename}")
                else:
                    print(f"Filename does not match the pattern: {filename}")
        else:
            print(f"Skipped: {filename} (unsupported file type)")

# Replace 'your_directory_path' with the actual path to your directory
directory_path = 'D:\Movies'
correct_filenames_in_directory(directory_path)

