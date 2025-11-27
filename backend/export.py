from typing import List, Dict

def generate_edl(project_name: str, clips: List[Dict]) -> str:
    """
    Generates a CMX 3600 formatted EDL string from a list of clips.
    """
    edl_lines = [f"TITLE: {project_name}", "FCM: NON-DROP FRAME"]
    
    for i, clip in enumerate(clips):
        event_num = str(i + 1).zfill(3)
        reel = clip.get("reel", "AX").ljust(8)
        track = "V     " # Video only for now
        trans = "C        " # Cut
        
        # Timecodes (HH:MM:SS:FF)
        src_in = clip.get("src_in", "00:00:00:00")
        src_out = clip.get("src_out", "00:00:05:00")
        rec_in = clip.get("rec_in", "00:00:00:00")
        rec_out = clip.get("rec_out", "00:00:05:00")
        
        line = f"{event_num}  {reel} {track} {trans} {src_in} {src_out} {rec_in} {rec_out}"
        edl_lines.append(line)
        
        # Add clip name as comment
        if "name" in clip:
            edl_lines.append(f"* FROM CLIP NAME: {clip['name']}")

    return "\n".join(edl_lines)
