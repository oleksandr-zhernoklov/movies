import ftplib
import re

# Regular expression to find movie name and year for correction
pattern = re.compile(r'^(.*?)[\.\s]\(?(\d{4})\)?')

# List of allowed file extensions
allowed_extensions = ['.mp4', '.avi', '.mkv']

def to_proper_case(filename):
    """Cleanses a filename by removing unnecessary dots and underscores,
        and converting the name to CamelCase.

        Args:
            filename: The original filename.

        Returns:
            The cleansed filename in CamelCase.
        """

        # Remove unnecessary dots and underscores
    cleaned_name = re.sub(r'[._]+', ' ', filename)

    # Convert to CamelCase
    words = cleaned_name.split()
    camel_case_name = ''.join(word.capitalize() for word in words)

    return camel_case_name


def get_ftp_listing(host, user, password, working_dir='2tb/Download2/Movies'):
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

def rename_ftp_files(host, user, password, working_dir='2tb/Download2/Movies/Starter_for_10'):
    file_listing = get_ftp_listing(host, user, password, working_dir)
    if file_listing:
        processed_files = {}
        ftp = ftplib.FTP(host, user, password)
        try:
            if working_dir:
                ftp.cwd(working_dir)
            for filename in file_listing:
                if any(filename.lower().endswith(ext) for ext in allowed_extensions):
                    match = pattern.search(filename)
                    if match:
                        name, year = match.groups()
                        name = name.replace('.', ' ').strip()
                        proper_case_name = to_proper_case(name)
                        new_filename = f"{proper_case_name} ({year}){filename[-4:]}"
                        
                        try:
                            # Check for duplicate files
                            if new_filename in processed_files:
                                existing_file = processed_files[new_filename]
                                current_size = ftp.size(filename)
                                existing_size = ftp.size(existing_file)

                                if current_size > existing_size:
                                    smaller_filename = existing_file
                                    larger_filename = filename
                                    smaller_new_filename = new_filename.replace(filename[-4:], f"_1{filename[-4:]}")
                                    print(f"Corrected duplicate: {smaller_filename} -> {smaller_new_filename}")
                                    print(f"Retaining larger file: {larger_filename}")
                                    ftp.rename(smaller_filename, smaller_new_filename)  # Rename the smaller file
                                    ftp.delete(smaller_filename)  # Remove the smaller file
                                elif current_size < existing_size:
                                    smaller_filename = filename
                                    larger_filename = existing_file
                                    smaller_new_filename = new_filename.replace(filename[-4:], f"_1{filename[-4:]}")
                                    print(f"Corrected duplicate: {smaller_filename} -> {smaller_new_filename}")
                                    print(f"Retaining larger file: {larger_filename}")
                                    #ftp.rename(smaller_filename, smaller_new_filename)  # Rename the smaller file
                                    ftp.delete(smaller_filename)  # Remove the smaller file
                                else:  # Files are the same size
                                    print(f"Duplicate with same size: {filename} (removed)")
                                    ftp.delete(filename)  # Remove the duplicate file
                            else:
                                processed_files[new_filename] = filename
                                print(f"Corrected: {filename} -> {new_filename}")
                                try:
                                   print(f"Corrected: {filename} -> {new_filename}")
                                   #ftp.rename(filename, new_filename)  # Rename the file
                                except ftplib.error_perm as e:
                                    print(f"Permission error while renaming {filename}: {type(e).__name__}, {str(e)}")
                        except ftplib.error_perm as e:
                            print(f"An error occurred while processing {filename}: {type(e).__name__}, {str(e)}")
                    else:
                        print(f"Filename does not match the pattern: {filename}")
                else:
                    print(f"Skipped: {filename} (unsupported file type)")
        except Exception as e:
            print(f"An error occurred: {type(e).__name__}, {str(e)}")
        finally:
            ftp.quit()

# FTP server details
ftp_host = '45.152.75.187'  # Replace with actual FTP server address
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'

# Rename files on FTP
rename_ftp_files(ftp_host, ftp_user, ftp_pass)
