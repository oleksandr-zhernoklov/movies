import os
import re

# Regular expression to find movie name and year for correction
pattern = re.compile(r'^(.*?)[\.\s]\(?(\d{4})\)?')

# List of allowed file extensions
allowed_extensions = ['.mp4', '.avi', '.mkv']

def to_camel_case(text):
    return ' '.join(word.capitalize() for word in text.split())

def correct_filenames(directory):
    processed_files = {}
    for root, _, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            if os.path.isfile(filepath) and os.path.splitext(filename)[1].lower() in allowed_extensions:
                match = pattern.search(filename)
                if match:
                    name, year = match.groups()
                    name = name.replace('.', ' ').strip()
                    camel_case_name = to_camel_case(name)
                    new_filename = f"{camel_case_name} ({year}){os.path.splitext(filename)[1]}"
                    new_filepath = os.path.join(root, new_filename)

                    if new_filename in processed_files:
                        existing_file = processed_files[new_filename]
                        existing_size = os.path.getsize(existing_file)
                        current_size = os.path.getsize(filepath)

                        if current_size > existing_size:
                            smaller_filepath = existing_file
                            larger_filepath = filepath
                            smaller_filename = new_filename.replace(os.path.splitext(new_filename)[1], f"_1{os.path.splitext(new_filename)[1]}")
                            smaller_new_filepath = os.path.join(root, smaller_filename)
                            print(f"Corrected duplicate: {smaller_filepath} -> {smaller_new_filepath}")
                            print(f"Retaining larger file: {larger_filepath}")
                            # os.rename(smaller_filepath, smaller_new_filepath)  # Uncomment this line to rename the smaller file
                            os.remove(smaller_filepath)  # Remove the smaller file
                        elif current_size < existing_size:
                            smaller_filepath = filepath
                            larger_filepath = existing_file
                            smaller_filename = new_filename.replace(os.path.splitext(new_filename)[1], f"_1{os.path.splitext(new_filename)[1]}")
                            smaller_new_filepath = os.path.join(root, smaller_filename)
                            print(f"Corrected duplicate: {smaller_filepath} -> {smaller_new_filepath}")
                            print(f"Retaining larger file: {larger_filepath}")
                            os.rename(smaller_filepath, smaller_new_filepath)  # Uncomment this line to rename the smaller file
                            os.remove(smaller_filepath)  # Remove the smaller file
                        else:  # Files are the same size
                            print(f"Duplicate with same size: {filepath} (removed)")
                            os.remove(filepath)  # Remove the duplicate file
                    else:
                        processed_files[new_filename] = filepath
                        print(f"Corrected: {filename} -> {new_filename}")
                        os.rename(filepath, new_filepath)  # Uncomment this line to rename the file
                else:
                    print(f"Filename does not match the pattern: {filename}")
            else:
                print(f"Skipped: {filename} (unsupported file type)")

# Set the directory path
directory_path = 'G:\\Movies'
correct_filenames(directory_path)
