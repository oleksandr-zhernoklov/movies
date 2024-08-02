import os
import re
import ftplib

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
            process_file(root, filename, processed_files)

def process_file(root, filename, processed_files):
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
                handle_duplicate_files(new_filename, processed_files[new_filename], filepath)
            else:
                processed_files[new_filename] = filepath
                print(f"Corrected: {filename} -> {new_filename}")
                # os.rename(filepath, new_filepath)  # Uncomment this line to rename the file
        else:
            print(f"Filename does not match the pattern: {filename}")
    else:
        print(f"Skipped: {filename} (unsupported file type)")

def handle_duplicate_files(new_filename, existing_file, current_file):
    existing_size = os.path.getsize(existing_file)
    current_size = os.path.getsize(current_file)

    if current_size > existing_size:
        remove_smaller_file(existing_file, new_filename, current_file)
    elif current_size < existing_size:
        remove_smaller_file(current_file, new_filename, existing_file)
    else:  # Files are the same size
        print(f"Duplicate with same size: {current_file} (removed)")
        os.remove(current_file)  # Remove the duplicate file

def remove_smaller_file(smaller_filepath, new_filename, larger_filepath):
    smaller_filename = new_filename.replace(os.path.splitext(new_filename)[1], f"_1{os.path.splitext(new_filename)[1]}")
    smaller_new_filepath = os.path.join(os.path.dirname(smaller_filepath), smaller_filename)
    print(f"Corrected duplicate: {smaller_filepath} -> {smaller_new_filepath}")
    print(f"Retaining larger file: {larger_filepath}")
    # os.rename(smaller_filepath, smaller_new_filepath)  # Uncomment this line to rename the smaller file
    os.remove(smaller_filepath)  # Remove the smaller file

def get_ftp_listing(host, user, password, working_dir=''):
    """Retrieves a list of files and folders from an FTP server using plain FTP."""
    try:
        ftp = ftplib.FTP(host, user, password)
        if working_dir:
            ftp.cwd(working_dir)
        file_listing = ftp.nlst()
        ftp.quit()
        return file_listing
    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")
        return []

def process_ftp_files(host, user, password, working_dir=''):
    file_listing = get_ftp_listing(host, user, password, working_dir)
    if file_listing:
        print("Listing of files and folders on the FTP server:")
        processed_files = {}
        for item in file_listing:
            process_file('', item, processed_files)
    else:
        print("Failed to retrieve file listing.")

# Local directory processing
directory_path = '2TB'
correct_filenames(directory_path)

# FTP server processing
ftp_host = 'zhernoklov.asuscomm.com'
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'
ftp_working_dir = '2tb/Download2/Movies'
process_ftp_files(ftp_host, ftp_user, ftp_pass, ftp_working_dir)
