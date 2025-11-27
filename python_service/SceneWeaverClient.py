import os
import uuid
import ffmpeg
import shutil
import pdfplumber
import re

class NanoBananaClient:
    """
    A placeholder wrapper class for the NanoBanana API.
    Now generates local dummy files for testing.
    """
    def __init__(self, api_key: str = "mock_key"):
        self.api_key = api_key

    def generate_asset(self, type: str, prompt: str) -> str:
        """
        Generates a new Character or Prop asset.
        
        Args:
            type: 'character' or 'prop'.
            prompt: Description of the asset.
            
        Returns:
            The absolute path to the generated local image file (dummy).
        """
        print(f"Generating asset of type '{type}' with prompt: '{prompt}'")
        
        # Generate a unique filename
        filename = f"generated_asset_{uuid.uuid4()}.jpg" # Assuming image for assets
        output_path = os.path.abspath(os.path.join("temp_assets", filename))
        
        # Ensure temp directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Create a dummy image (using ffmpeg to generate a single frame)
        try:
            (
                ffmpeg
                .input('color=c=red:s=512x512', f='lavfi')
                .output(output_path, vframes=1)
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Generated dummy asset at {output_path}")
            return output_path
        except ffmpeg.Error as e:
            print('ffmpeg error generating asset:', e.stderr.decode('utf8'))
            # Fallback if ffmpeg fails or not installed for images, just touch the file
            with open(output_path, 'wb') as f:
                f.write(b'dummy image content')
            return output_path

    def generate_shot(self, prompt: str, style_preset: str, linked_asset_data: list) -> str:
        """
        The main rendering engine. Generates a shot based on prompt, style, and assets.
        
        Args:
            prompt: The description of the shot.
            style_preset: The name or ID of the style preset (e.g., 'The Kubrick').
            linked_asset_data: List of asset data dicts used in the shot.
            
        Returns:
            The absolute path to the generated local .mp4 file.
        """
        print(f"Generating shot for prompt: '{prompt}'")
        print(f"Style Preset: {style_preset}")
        print(f"Linked Assets: {linked_asset_data}")
        
        # Generate a unique filename
        filename = f"generated_shot_{uuid.uuid4()}.mp4"
        output_path = os.path.abspath(os.path.join("temp_shots", filename))
        
        # Ensure temp directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        width, height = 1920, 1080 # Default HD
        
        try:
            # Generate a 2-second test pattern video using ffmpeg
            (
                ffmpeg
                .input(f'testsrc=duration=2:size={width}x{height}:rate=24', f='lavfi')
                .output(output_path, vcodec='libx264', pix_fmt='yuv420p', t=2)
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Generated dummy shot at {output_path}")
            return output_path
            
        except ffmpeg.Error as e:
            print('ffmpeg error generating shot:', e.stderr.decode('utf8'))
            raise e

    def inpaint_shot(self, original_path: str, mask_path: str, prompt: str) -> str:
        """
        Repairs a shot using in-painting.
        """
        print(f"In-painting shot with prompt: '{prompt}'")
        
        filename = f"repaired_shot_{uuid.uuid4()}.mp4"
        output_path = os.path.abspath(os.path.join("temp_shots", filename))
        
        try:
            # Mock in-painting: Overlay text "REPAIRED" on the original video
            (
                ffmpeg
                .input(original_path)
                .drawtext(text='REPAIRED', x='(w-text_w)/2', y='(h-text_h)/2', fontsize=64, fontcolor='green')
                .output(output_path, vcodec='libx264', preset='fast')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Generated repaired shot at {output_path}")
            return output_path
        except ffmpeg.Error as e:
            print('ffmpeg error inpainting:', e.stderr.decode('utf8'))
            # Fallback
            shutil.copy(original_path, output_path)
            return output_path

    def generate_sfx(self, prompt: str) -> str:
        """
        Generates a sound effect based on the prompt.
        """
        print(f"Generating SFX for prompt: '{prompt}'")
        
        filename = f"sfx_{uuid.uuid4()}.mp3"
        output_path = os.path.abspath(os.path.join("temp_shots", filename))
        
        try:
            # Mock SFX: Generate a sine wave beep
            (
                ffmpeg
                .input('sine=frequency=1000:duration=2', f='lavfi')
                .output(output_path)
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Generated dummy SFX at {output_path}")
            return output_path
        except ffmpeg.Error as e:
            print('ffmpeg error generating sfx:', e.stderr.decode('utf8'))
            raise e

    def sync_lips(self, video_path: str, audio_path: str) -> str:
        """
        Synchronizes the lips in the video to the audio.
        """
        print(f"Syncing lips. Video: {video_path}, Audio: {audio_path}")
        
        filename = f"synced_{uuid.uuid4()}.mp4"
        output_path = os.path.abspath(os.path.join("temp_shots", filename))
        
        try:
            # Mock LipSync: Just combine video and audio, maybe add a text overlay "LIP SYNCED"
            # In reality, this would call Wav2Lip or similar
            (
                ffmpeg
                .input(video_path)
                .input(audio_path)
                .drawtext(text='LIP SYNCED', x='(w-text_w)/2', y='h-text_h-50', fontsize=48, fontcolor='yellow')
                .output(output_path, vcodec='libx264', acodec='aac', shortest=None)
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            print(f"Generated lip-synced video at {output_path}")
            return output_path
        except ffmpeg.Error as e:
            print('ffmpeg error syncing lips:', e.stderr.decode('utf8'))
            # Fallback: just return original video
            return video_path

    def generate_text(self, selected_text: str, instruction: str, context: str) -> str:
        """
        Generates or rewrites text based on instruction.
        """
        print(f"Ghostwriting. Instruction: '{instruction}'. Context: '{context}'")
        
        # Mock LLM Response
        if "funnier" in instruction.lower():
            return f"{selected_text} (and then a clown honks a horn)"
        elif "shorten" in instruction.lower():
            return "Briefly: " + selected_text[:10] + "..."
        elif "expand" in instruction.lower():
            return f"{selected_text} It was a dark and stormy night. The wind howled..."
        elif "next scene" in instruction.lower():
            return """
<h1 class="scene-heading">EXT. ALIEN PLANET - NIGHT</h1>
<p class="action">Two moons glow in the purple sky. A rover wheels silently across the dunes.</p>
<div class="character">ROVER AI</div>
<div class="dialogue">Destination reached. Initiating scan.</div>
"""
        else:
            return f"[AI REWRITE]: {selected_text}"

    def parse_pdf_script(self, pdf_path: str) -> dict:
        """
        Parses a PDF screenplay and returns Tiptap JSON.
        Uses heuristics based on indentation (x-coordinate) and text content.
        """
        print(f"Parsing PDF script: {pdf_path}")
        
        content = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    # Extract words with position data
                    words = page.extract_words(x_tolerance=3, y_tolerance=3)
                    
                    # Group words by line (y-coordinate)
                    lines = {}
                    for word in words:
                        top = round(word['top'])
                        if top not in lines:
                            lines[top] = []
                        lines[top].append(word)
                    
                    # Sort lines by vertical position
                    sorted_y = sorted(lines.keys())
                    
                    for y in sorted_y:
                        line_words = lines[y]
                        # Sort words in line by x position
                        line_words.sort(key=lambda w: w['x0'])
                        
                        text = " ".join([w['text'] for w in line_words])
                        x0 = line_words[0]['x0']
                        
                        # Heuristics (assuming standard 72dpi PDF, 8.5x11)
                        # Margins: Left ~ 1 inch (72pts) to 1.5 inch (108pts)
                        
                        block_type = 'action'
                        
                        # Scene Heading: Left aligned, Uppercase, usually starts with INT/EXT
                        if x0 < 120:
                            if re.match(r'^(INT\.|EXT\.|EST\.|I\/E)', text) or (text.isupper() and " " not in text): 
                                # Simple check for scene headings
                                block_type = 'sceneHeading'
                            elif text.isupper() and len(text) > 4:
                                # Fallback for scene headings without INT/EXT but all caps and left aligned
                                # But could be a transition (CUT TO:)
                                if "TO:" in text:
                                    block_type = 'action' # Transitions are often right aligned but sometimes left
                                else:
                                    block_type = 'sceneHeading'
                            else:
                                block_type = 'action'
                        
                        # Character: Centered-ish (approx 200-300)
                        elif 200 < x0 < 320:
                            if text.isupper():
                                block_type = 'character'
                            elif text.startswith('('):
                                block_type = 'parenthetical'
                            else:
                                block_type = 'dialogue'
                        
                        # Dialogue: Wider block, indented (approx 140-200)
                        elif 140 < x0 < 250:
                            if text.startswith('('):
                                block_type = 'parenthetical'
                            else:
                                block_type = 'dialogue'
                        
                        # Transitions: Right aligned (approx > 400)
                        elif x0 > 400:
                            block_type = 'action' # Treat transitions as action for now
                        
                        content.append({
                            "type": block_type,
                            "content": [{"type": "text", "text": text}]
                        })
                        
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            # Return a basic error document
            return {
                "type": "doc",
                "content": [
                    {
                        "type": "action", 
                        "content": [{"type": "text", "text": f"Error parsing PDF: {str(e)}"}]
                    }
                ]
            }

        return {
            "type": "doc",
            "content": content
        }

    def breakdown_scene(self, scene_text: str) -> list:
        """
        Breaks down a scene text into a list of shots.
        Returns a list of dicts: {"prompt": str, "size": "Wide/Close/Medium", "duration": 3}
        """
        print(f"Breaking down scene: {scene_text[:50]}...")
        
        shots = []
        
        # Simple heuristic breakdown
        lines = scene_text.split('\n')
        
        # 1. Master Shot (Establish the scene)
        location_match = re.search(r'(INT\.|EXT\.)\s+(.+?)(?:\s-|$)', scene_text)
        location = location_match.group(2) if location_match else "Unknown Location"
        shots.append({
            "prompt": f"Wide establishing shot of {location}, cinematic lighting, 8k",
            "size": "Wide",
            "duration": 5
        })
        
        # 2. Parse actions and dialogue for coverage
        current_char = None
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # Character speaking
            if line.isupper() and len(line) < 30 and "INT." not in line and "EXT." not in line:
                current_char = line
                continue
                
            # Dialogue
            if current_char and not line.isupper() and not line.startswith('('):
                shots.append({
                    "prompt": f"Close up of {current_char} speaking, emotional expression, detailed face",
                    "size": "Close Up",
                    "duration": 4
                })
                current_char = None
                
            # Action
            if not current_char and not line.isupper() and len(line) > 10:
                shots.append({
                    "prompt": f"Medium shot of {line}, dynamic angle",
                    "size": "Medium",
                    "duration": 4
                })
                
        # Limit to 5 shots for the mock to avoid spamming
        return shots[:5]
