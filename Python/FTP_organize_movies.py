import ftplib
import re
import os

# Regular expression pattern to extract the year from file names
year_pattern = re.compile(r'\((\d{4})\)')

# List of allowed file extensions
allowed_extensions = ['.mp4', '.avi', '.mkv']

def extract_year(filename,year_pattern):
    match = year_pattern.search(filename)
    if match:
        return match.group(1)
    return None

def get_ftp_listing(ftp, working_dir):
    """Retrieve a list of files from the FTP directory."""
    try:
        ftp.cwd(working_dir)
        file_listing = ftp.nlst()
        return file_listing
    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")
        return []

def organize_movies_by_year(ftp_host, ftp_user, ftp_pass, working_dir):
    """Organize movies into year-based folders on the FTP server."""
    try:
        ftp = ftplib.FTP(ftp_host, ftp_user, ftp_pass)
        file_listing = get_ftp_listing(ftp, working_dir)
        
        for filename in file_listing:
            if any(filename.lower().endswith(ext) for ext in allowed_extensions):
                print (os.path.basename(filename))
                filename_only = os.path.basename(filename)
                year = extract_year(filename,year_pattern)
                print(year)
                if year:
                    year_folder = f"{working_dir}/{year}"
                    #print ("folder  will be: "+year)
                    # Create year folder if it doesn't exist
                    try:
                        ftp.mkd(year)
                        #print(f"Created folder: {year_folder}")
                    except ftplib.error_perm:
                        # Folder likely already exists
                        pass
                    
                    # Move file to the year folder
                    new_path = f"{year_folder}/{filename_only}"
                    try:
                        #new_path = f"{year}/{filename}"  # Use relative path within working_dir
                        ftp.rename(filename, new_path)

                        #ftp.rename(f"{working_dir}/{filename}", new_path)
                        print(f"Moved {filename} to {new_path}")
                    except ftplib.error_perm as e:
                        print(f"Permission error while moving {filename}: {type(e).__name__}, {str(e)}")
                else:
                    print(f"No year found in {filename}")
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
working_dir = '/2tb/Download2/Movies'

if __name__ == "__main__":
    organize_movies_by_year(ftp_host, ftp_user, ftp_pass, working_dir)
