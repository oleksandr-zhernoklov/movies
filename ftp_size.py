import ftplib
import re

def get_ftp_listing(host, user, password, working_dir='2tb/Download2/Movies'):
    try:
        ftp = ftplib.FTP(host, user, password)
        if working_dir:
            ftp.cwd(working_dir)
        file_listing = []
        ftp.retrlines('LIST', file_listing.append)
        ftp.quit()
        return file_listing
    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")
        return []

def parse_ftp_listing(listing):
    parsed_files = []
    for line in listing:
        parts = line.split()
        if len(parts) >= 9:
            size = parts[4]
            name = ' '.join(parts[8:])
            if re.match(r'^\d+$', size):  # Ensure size is a number
                parsed_files.append((name, int(size)))
    return parsed_files

def size_in_gb(size_bytes):
    return size_bytes / (1024 ** 3)  # Convert bytes to gigabytes

ftp_host = '45.152.75.187'
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'

# Get the listing from the specified directory
file_listing = get_ftp_listing(ftp_host, ftp_user, ftp_pass)

if file_listing:
    print("Listing of files and their sizes on the FTP server (in GB):")
    parsed_files = parse_ftp_listing(file_listing)
    for name, size in parsed_files:
        size_gb = size_in_gb(size)
        print(f"{name}: {size_gb:.2f} GB")
else:
    print("Failed to retrieve file listing.")
