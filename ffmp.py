import subprocess
import json
import os

def get_video_duration(file_path, ffprobe_path):
    """Get the duration of the video file using ffprobe."""
    try:
        command = [ffprobe_path, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'json', file_path]
        print(f"Running command: {' '.join(command)}")  # Print the command for debugging

        result = subprocess.run(
            command,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True
        )
        
        print(f"FFprobe output for {file_path}: {result.stdout}")

        info = json.loads(result.stdout)
        
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

if __name__ == "__main__":
    file_path = r"G:\Movies\1900x\Baraka (1992).mkv"  # Update this path if needed
    ffprobe_path = r"C:\Users\zhern\OneDrive\Documents\CCE\Repos\movies\ffprobe.exe"  # Update this path to the location of ffprobe on your system

    print(f"File path: {file_path}")
    print(f"FFprobe path: {ffprobe_path}")

    if os.path.exists(file_path):
        duration = get_video_duration(file_path, ffprobe_path)
        if duration is not None:
            print(f"{file_path} duration: {duration:.2f} seconds")
        else:
            print(f"Could not determine duration for {file_path}")
    else:
        print("The provided file path does not exist.")
