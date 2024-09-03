import subprocess
import os
import json

def get_video_duration(file_path, ffprobe_path):
    """Get the duration of the video file using ffprobe."""
    try:
        # Ensure file path is correctly quoted
        result = subprocess.run(
            [ffprobe_path, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'json', file_path],
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            shell=True  # Ensure shell compatibility
        )
        
        # Print raw ffprobe output for debugging
        print(f"FFprobe output for {file_path}: {result.stdout}")

        # Parse the JSON output
        info = json.loads(result.stdout)
        
        # Check if 'streams' and 'duration' are present in the output
        if 'streams' in info and len(info['streams']) > 0 and 'duration' in info['streams'][0]:
            duration = info['streams'][0]['duration']
            return float(duration)
        else:
            print(f"'duration' not found in the output for {file_path}")
            return None
    
    except json.JSONDecodeError as e:
        print(f"JSON decoding error for {file_path}: {e}")
        return None
    except Exception as e:
        print(f"An error occurred while checking duration for {file_path}: {e}")
        return None

def check_directory(directory, ffprobe_path):
    """Check all video files in the given directory and its subdirectories."""
    print(f"Checking directory: {directory}")  # Debug print
    for root, dirs, files in os.walk(directory):
        print(f"Scanning directory: {root}")  # Debug print
        for file in files:
            if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                file_path = os.path.join(root, file)
                duration = get_video_duration(file_path, ffprobe_path)
                if duration is not None:
                    print(f"{file_path} duration: {duration:.2f} seconds")
                else:
                    print(f"Could not determine duration for {file_path}")

if __name__ == "__main__":
    # Use raw string to handle backslashes correctly
    directory = r"G:\Movies"  # Update this path if needed
    ffprobe_path = r"C:\Users\zhern\OneDrive\Documents\CCE\Repos\movies\ffprobe.exe"  # Update this path to the location of ffprobe on your system

    # Print paths for debugging
    print(f"Directory path: {directory}")
    print(f"FFprobe path: {ffprobe_path}")

    # Check if the directory path exists
    if os.path.exists(directory):
        if os.path.isdir(directory):
            check_directory(directory, ffprobe_path)
        else:
            print("The provided path is not a directory.")
    else:
        print("The provided path does not exist.")
