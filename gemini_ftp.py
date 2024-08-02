import fluentftp
import os

def calculate_storage_usage(ftp, path):
    total_size = 0

    def traverse_and_calculate(ftp, path):
        nonlocal total_size
        try:
            for item in ftp.listdir(path):
                full_path = os.path.join(path, item)
                if ftp.isdir(full_path):
                    traverse_and_calculate(ftp, full_path)
                else:
                    size = ftp.size(full_path)
                    if size is not None:
                        total_size += size
        except Exception as e:
            print(f"Error listing {path}: {type(e).__name__}, {str(e)}")

    traverse_and_calculate(ftp, path)
    return total_size

def get_ftp_listing(host, user, password, working_dir='2tb/Download2/Movies'):
    try:
        with fluentftp.FTP(host, user, password) as ftp:
            if working_dir:
                ftp.cwd(working_dir)

            total_size = calculate_storage_usage(ftp, working_dir)
            print(f"Total storage used: {total_size} bytes")

    except Exception as e:
        print(f"An error occurred: {type(e).__name__}, {str(e)}")

# Replace with your actual credentials
ftp_host = 'zhernoklov.asuscomm.com'
ftp_user = 'saf'
ftp_pass = 'iMV9vDHFM@9Drvb'

get_ftp_listing(ftp_host, ftp_user, ftp_pass)
