
import ftplib

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

ftp_host = 'zhernoklov.asuscomm.com'
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'

# Get the listing from the root directory (or specific directory if desired)
file_listing = get_ftp_listing(ftp_host, ftp_user, ftp_pass)

if file_listing:
    print("Listing of files and folders on the FTP server:")
    for item in file_listing:
        print(item)
else:
    print("Failed to retrieve file listing.")