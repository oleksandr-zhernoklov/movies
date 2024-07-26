from moviepy.editor import VideoFileClip
import os

def check_video_duration(file_path):
    """Check the duration of the video file using moviepy."""
    try:
        with VideoFileClip(file_path) as video:
            duration = video.duration
            return duration
    except OSError as e:
        # Handle specific file errors (e.g., file not found, invalid format)
        print(f"File error for {file_path}: {e}")
        return None
    except Exception as e:
        # Handle other potential errors
        print(f"Error with file {file_path}: {e}")
        return None

def check_directory(directory):
    """Check all video files in the given directory and its subdirectories."""
    non_valid_files = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                file_path = os.path.join(root, file)
                print(f"Checking file: {file_path}")  # Log the file being checked
                duration = check_video_duration(file_path)
                if duration is None:
                    non_valid_files.append(file_path)
    
    return non_valid_files

if __name__ == "__main__":
    directory = r"G:\Movies"  # Update this path to your directory
    if os.path.isdir(directory):
        non_valid_files = check_directory(directory)
        
        if non_valid_files:
            print("Non-valid video files:")
            for file in non_valid_files:
                print(file)
        else:
            print("All video files are valid.")
    else:
        print("The provided path is not a directory.")
