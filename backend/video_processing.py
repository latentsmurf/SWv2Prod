import ffmpeg
import os

def generate_proxy(input_path: str, output_path: str, width: int = 1280):
    """
    Generates a proxy video using FFmpeg.
    Scales the video to the specified width while maintaining aspect ratio.
    """
    try:
        (
            ffmpeg
            .input(input_path)
            .filter('scale', width, -1)
            .output(output_path, vcodec='libx264', crf=23, preset='fast', acodec='aac')
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        return {"status": "success", "output_path": output_path}
    except ffmpeg.Error as e:
        print('stdout:', e.stdout.decode('utf8'))
        print('stderr:', e.stderr.decode('utf8'))
        raise e

def conform_to_standard(input_path: str, output_path: str, fps: float = 24.0):
    """
    Conforms video to a standard frame rate (e.g., 24fps).
    """
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, r=fps)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        return {"status": "success", "output_path": output_path}
    except ffmpeg.Error as e:
        print('stderr:', e.stderr.decode('utf8'))
        raise e
