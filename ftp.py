import paramiko

def get_ftp_listing(host, username, password, working_dir=''):
    try:
        transport = paramiko.Transport((host, 22))
        transport.connect(username=username, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)

        if working_dir:
            sftp.chdir(working_dir)

        file_listing = sftp.listdir('.')
        sftp.close()
        transport.close()

        return file_listing
    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")
        return []


# Replace with your actual credentials
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