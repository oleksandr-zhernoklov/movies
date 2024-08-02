import ftplib
import os
import time

# FTP server credentials
ftp_host = 'zhernoklov.asuscomm.com'
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'

def get_ftp_file_size(ftp, path):
    """Tries to fetch the size of the file using the SIZE command, falls back to a partial RETR if needed."""
    path = path.replace('\\', '/')  # Replace backslashes with forward slashes
    try:
        size = ftp.size(path)
        if size is not None:
            return size
    except ftplib.error_perm as e:
        print(f"SIZE command not allowed for {path}: {e}")
    except ftplib.error_temp as e:
        print(f"Temporary error while getting size for {path}: {e}")

    # Fallback method: attempt to retrieve a part of the file
    try:
        # Retrieve the first byte of the file to confirm accessibility
        ftp.voidcmd(f'TYPE I')  # Switch to binary mode
        with ftp.transfercmd(f"RETR {path}") as conn:
            conn.recv(1)
            conn.close()
        # Estimate: assume 1 byte retrieved means file exists (size unknown)
        return 1  # Indicate the file exists, but size is unknown
    except (ftplib.error_perm, ftplib.error_temp) as e:
        print(f"Could not access {path} using RETR command: {e}")
        return 0

def list_files(ftp, path):
    """List files and directories in the given FTP directory."""
    file_list = []
    try:
        ftp.retrlines(f'LIST {path}', lambda x: file_list.append(x.split()))
    except ftplib.error_perm as e:
        print(f"Could not list {path}: {e}")
    except ftplib.error_temp as e:
        print(f"Temporary error listing {path}: {e}")
    return file_list

def get_total_size(ftp, path='', retry=3):
    """Recursively calculate the total size of files in the given path on the FTP server."""
    total_size = 0
    original_directory = ftp.pwd()
    
    try:
        # Change to the target directory
        ftp.cwd(path)
        print(f"Accessing directory: {ftp.pwd()}")
        
        # List all files and directories in the current path
        items = list_files(ftp, path)
        
        for item in items:
            if len(item) == 0:
                continue
            
            # Determine if it is a file or directory
            name = ' '.join(item[8:])
            if item[0].startswith('d'):  # Directory
                try:
                    total_size += get_total_size(ftp, name, retry)
                except ftplib.error_perm as e:
                    print(f"Permission denied for directory {name}: {e}")
            else:  # File
                file_path = os.path.join(ftp.pwd(), name)
                file_path = file_path.replace('\\', '/')  # Replace backslashes with forward slashes
                total_size += get_ftp_file_size(ftp, file_path)

        # Return to the original directory
        ftp.cwd(original_directory)

    except ftplib.error_perm as e:
        print(f"Permission denied or error accessing: {path}. Error: {e}")
        try:
            ftp.cwd(original_directory)  # Ensure we return to the original directory
        except ftplib.error_perm as e2:
            print(f"Failed to return to original directory: {e2}")

    except ftplib.error_temp as e:
        if retry > 0:
            print(f"Temporary error encountered in {path}. Retrying... ({retry} attempts left): {e}")
            time.sleep(2)  # Wait a bit before retrying
            return get_total_size(ftp, path, retry - 1)
        else:
            print(f"Failed to process {path} after multiple attempts: {e}")

    return total_size

def main():
    # Connect to the FTP server
    with ftplib.FTP(ftp_host) as ftp:
        ftp.login(ftp_user, ftp_pass)
        ftp.encoding = 'utf-8'

        # Set timeout for the FTP connection
        ftp.sock.settimeout(30)

        # Calculate the total size of all files on the FTP server
        total_size = get_total_size(ftp)
        print(f"Total size of data on the FTP server: {total_size} bytes")

if __name__ == '__main__':
    main()
