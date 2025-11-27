import ffmpeg
import os

class VideoProcessor:
    """
    Handles video processing tasks using ffmpeg-python.
    """

    def create_proxy(self, input_path: str, output_path: str):
        """
        Downscales video to 720p .mp4 with CRF 23 for web editor proxy.

        Args:
            input_path: Path to the input video file.
            output_path: Path where the proxy video should be saved.
        """
        try:
            (
                ffmpeg
                .input(input_path)
                .filter('scale', -2, 720) # Scale height to 720, keep aspect ratio (width divisible by 2)
                .output(output_path, vcodec='libx264', crf=23, preset='fast', acodec='aac')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Proxy created at {output_path}")
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e

    def conform_framerate(self, input_path: str, output_path: str, fps: float = 23.976):
        """
        Forces standard frame rate for export.

        Args:
            input_path: Path to the input video file.
            output_path: Path where the conformed video should be saved.
            fps: Target frames per second. Default is 23.976.
        """
        try:
            (
                ffmpeg
                .input(input_path)
                .filter('fps', fps=fps, round='near')
                .output(output_path, vcodec='libx264', crf=18, preset='fast', acodec='aac') # Higher quality for conform
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Video conformed to {fps} fps at {output_path}")
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e

    def render_timeline(self, clips: list, output_path: str):
        """
        Concatenates a list of clips into a single video file.
        
        Args:
            clips: List of dicts with 'path', 'start', 'duration'.
            output_path: Path where the rendered video should be saved.
        """
        if not clips:
            return
            
        try:
            # Create a temporary file list for ffmpeg concat demuxer
            # This is more robust for same-codec files than the concat filter
            # But for mixed codecs, we might need the filter. 
            # Assuming all proxies are same format (h264/aac) from create_proxy.
            
            list_path = output_path + ".txt"
            with open(list_path, 'w') as f:
                for clip in clips:
                    # Escape path
                    path = clip['path'].replace("'", "'\\''")
                    f.write(f"file '{path}'\n")
                    # f.write(f"inpoint {clip['start']}\n") # Optional trimming
                    # f.write(f"duration {clip['duration']}\n") # Optional trimming
            
            (
                ffmpeg
                .input(list_path, format='concat', safe=0)
                .output(output_path, c='copy') # Stream copy for speed if formats match
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            
            os.remove(list_path)
            print(f"Timeline rendered to {output_path}")
            
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            # Fallback: Try re-encoding if stream copy fails
            try:
                (
                    ffmpeg
                    .input(list_path, format='concat', safe=0)
                    .output(output_path, vcodec='libx264', acodec='aac')
                    .overwrite_output()
                    .run(capture_stdout=True, capture_stderr=True)
                )
                os.remove(list_path)
            except Exception as e2:
                raise e
