from ftplib import FTP

def get_ftp_file_sizes(host, user, password, directory):
    try:
        ftp = FTP(host)
        ftp.login(user, password)
        ftp.cwd(directory)

        # Use the LIST command to get detailed file information
        listing = []
        ftp.retrlines('LIST', listing.append)

        file_info = []
        for line in listing:
            parts = line.split()
            if len(parts) >= 9:  # Typical format for Unix-like systems
                size = int(parts[4])
                name = ' '.join(parts[8:])
                file_info.append((name, size))
        
        ftp.quit()
        return file_info

    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")
        return []

# Example usage
host = 'zhernoklov.asuscomm.com'
user = 'saf'
password  = 'iMV9vDHFM@9Drvb'
directory = '/2tb/Download2/Movies'

file_sizes = get_ftp_file_sizes(host, user, password, directory)
for file_name, size in file_sizes:
    print(f"File: {file_name}, Size: {size} bytes")

