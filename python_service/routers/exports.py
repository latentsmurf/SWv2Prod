"""
Export routes for SceneWeaver.
Supports PDF storyboards, image strips, pitch decks, and NLE exports.
"""

import os
import io
import uuid
import zipfile
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4, TABLOID
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from auth import get_current_user, RequireAuth
from database import get_db
from StorageManager import StorageManager
from models import User

router = APIRouter(prefix="/api/export", tags=["export"])

storage_manager = StorageManager()


class StoryboardExportRequest(BaseModel):
    project_id: str
    project_name: str = "Untitled"
    format: str  # pdf, png_strip, pitch_deck, fcpxml
    options: Dict[str, Any] = {}
    scene_ids: List[str] = []
    shot_ids: List[str] = []


PAPER_SIZES = {
    "letter": letter,
    "a4": A4,
    "tabloid": TABLOID
}


@router.post("/storyboard")
async def export_storyboard(
    request: StoryboardExportRequest,
    user: User = RequireAuth,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export storyboard in various formats"""
    
    # Get shots
    query = {"project_id": request.project_id, "status": "completed"}
    if request.shot_ids:
        query["id"] = {"$in": request.shot_ids}
    elif request.scene_ids:
        query["scene_id"] = {"$in": request.scene_ids}
    
    shots = await db.get_collection("shots").find(query).sort("shot_number", 1).to_list(length=500)
    
    if not shots:
        raise HTTPException(status_code=400, detail="No completed shots to export")
    
    # Get scenes for context
    scene_ids = list(set(s.get("scene_id") for s in shots if s.get("scene_id")))
    scenes = await db.get_collection("scenes").find({
        "id": {"$in": scene_ids}
    }).to_list(length=100)
    scenes_map = {s.get("id"): s for s in scenes}
    
    if request.format == "pdf":
        return await generate_pdf_storyboard(
            request.project_name, shots, scenes_map, request.options
        )
    elif request.format == "png_strip":
        return await generate_image_strips(
            request.project_name, shots, scenes_map
        )
    elif request.format == "pitch_deck":
        return await generate_pitch_deck(
            request.project_name, shots, scenes_map, request.options
        )
    elif request.format == "fcpxml":
        return await generate_fcpxml(
            request.project_name, shots, scenes_map
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {request.format}")


async def generate_pdf_storyboard(
    project_name: str,
    shots: List[Dict],
    scenes_map: Dict,
    options: Dict
) -> StreamingResponse:
    """Generate PDF storyboard with panels"""
    
    paper_size = PAPER_SIZES.get(options.get("paperSize", "letter"), letter)
    panels_per_row = options.get("panelsPerRow", 3)
    include_notes = options.get("includeNotes", True)
    include_dialogue = options.get("includeDialogue", True)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=paper_size,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.75*inch,
        bottomMargin=0.5*inch
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=20,
        textColor=colors.black
    )
    scene_style = ParagraphStyle(
        'Scene',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.darkgray
    )
    shot_style = ParagraphStyle(
        'Shot',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.gray
    )
    
    elements = []
    
    # Title page
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph(project_name, title_style))
    elements.append(Paragraph("Storyboard", styles['Heading2']))
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    elements.append(Paragraph(f"{len(shots)} shots", styles['Normal']))
    elements.append(PageBreak())
    
    # Group shots by scene
    shots_by_scene = {}
    for shot in shots:
        scene_id = shot.get("scene_id", "unsorted")
        if scene_id not in shots_by_scene:
            shots_by_scene[scene_id] = []
        shots_by_scene[scene_id].append(shot)
    
    # Create storyboard pages
    for scene_id, scene_shots in shots_by_scene.items():
        scene = scenes_map.get(scene_id, {})
        
        # Scene header
        slug_line = scene.get("slug_line", f"Scene {scene_id}")
        elements.append(Paragraph(slug_line, scene_style))
        
        # Create panel rows
        for i in range(0, len(scene_shots), panels_per_row):
            row_shots = scene_shots[i:i + panels_per_row]
            
            # Panel images row
            panel_data = []
            for shot in row_shots:
                # Download image from GCS or use placeholder
                img_url = shot.get("proxy_path") or shot.get("gcs_path")
                
                if img_url:
                    try:
                        # For local testing, use a placeholder
                        # In production, download from GCS
                        img = Image(img_url, width=2*inch, height=1.125*inch)
                    except:
                        img = Paragraph("[Image]", styles['Normal'])
                else:
                    img = Paragraph("[Pending]", styles['Normal'])
                
                panel_data.append(img)
            
            # Pad row if needed
            while len(panel_data) < panels_per_row:
                panel_data.append("")
            
            table = Table([panel_data], colWidths=[2.2*inch] * panels_per_row)
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ]))
            elements.append(table)
            
            # Shot info row
            info_data = []
            for shot in row_shots:
                shot_type = shot.get("shot_type", "medium").upper()[:3]
                shot_num = shot.get("shot_number", 0)
                desc = shot.get("description", shot.get("prompt", ""))[:100]
                
                info_text = f"<b>{shot_type}-{shot_num}</b><br/>{desc}"
                if include_notes and shot.get("notes"):
                    info_text += f"<br/><i>{shot.get('notes')}</i>"
                
                info_data.append(Paragraph(info_text, shot_style))
            
            while len(info_data) < panels_per_row:
                info_data.append("")
            
            info_table = Table([info_data], colWidths=[2.2*inch] * panels_per_row)
            info_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(info_table)
            elements.append(Spacer(1, 0.2*inch))
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{project_name.replace(" ", "_")}_storyboard.pdf"'
        }
    )


async def generate_image_strips(
    project_name: str,
    shots: List[Dict],
    scenes_map: Dict
) -> StreamingResponse:
    """Generate ZIP file with image strips per scene"""
    
    buffer = io.BytesIO()
    
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Group by scene
        shots_by_scene = {}
        for shot in shots:
            scene_id = shot.get("scene_id", "unsorted")
            if scene_id not in shots_by_scene:
                shots_by_scene[scene_id] = []
            shots_by_scene[scene_id].append(shot)
        
        # Create a manifest
        manifest = {
            "project_name": project_name,
            "generated_at": datetime.now().isoformat(),
            "scenes": []
        }
        
        for scene_id, scene_shots in shots_by_scene.items():
            scene = scenes_map.get(scene_id, {})
            slug_line = scene.get("slug_line", f"Scene_{scene_id}")
            safe_name = "".join(c if c.isalnum() or c in "._- " else "_" for c in slug_line)
            
            scene_manifest = {
                "id": scene_id,
                "slug_line": slug_line,
                "shots": []
            }
            
            for i, shot in enumerate(scene_shots):
                shot_info = {
                    "number": i + 1,
                    "type": shot.get("shot_type", "medium"),
                    "description": shot.get("description", ""),
                    "filename": f"{safe_name}/shot_{i+1:03d}.jpg"
                }
                scene_manifest["shots"].append(shot_info)
                
                # Add shot image (placeholder for now)
                img_url = shot.get("proxy_path")
                if img_url:
                    # In production, download from GCS
                    # For now, create placeholder
                    zf.writestr(
                        f"{safe_name}/shot_{i+1:03d}.jpg",
                        f"Placeholder for shot {i+1}".encode()
                    )
            
            manifest["scenes"].append(scene_manifest)
        
        # Add manifest
        import json
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))
    
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{project_name.replace(" ", "_")}_strips.zip"'
        }
    )


async def generate_pitch_deck(
    project_name: str,
    shots: List[Dict],
    scenes_map: Dict,
    options: Dict
) -> StreamingResponse:
    """Generate pitch deck style PDF with key frames"""
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=TABLOID,  # Landscape-ish for presentations
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'BigTitle',
        parent=styles['Title'],
        fontSize=48,
        spaceAfter=30
    )
    
    elements = []
    
    # Title slide
    elements.append(Spacer(1, 3*inch))
    elements.append(Paragraph(project_name, title_style))
    elements.append(Paragraph("Visual Treatment", styles['Heading2']))
    elements.append(PageBreak())
    
    # Key frames - select every Nth shot for highlights
    key_shots = shots[::max(1, len(shots) // 10)][:10]  # Max 10 key frames
    
    for shot in key_shots:
        scene = scenes_map.get(shot.get("scene_id"), {})
        
        # Full page image
        elements.append(Spacer(1, 0.5*inch))
        
        img_url = shot.get("proxy_path")
        if img_url:
            try:
                img = Image(img_url, width=9*inch, height=5*inch)
                elements.append(img)
            except:
                elements.append(Paragraph("[Image]", styles['Normal']))
        
        elements.append(Spacer(1, 0.3*inch))
        elements.append(Paragraph(scene.get("slug_line", ""), styles['Heading3']))
        elements.append(Paragraph(shot.get("description", ""), styles['Normal']))
        elements.append(PageBreak())
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{project_name.replace(" ", "_")}_pitch_deck.pdf"'
        }
    )


async def generate_fcpxml(
    project_name: str,
    shots: List[Dict],
    scenes_map: Dict
) -> StreamingResponse:
    """Generate FCPXML for import into Final Cut Pro / DaVinci Resolve"""
    
    # Calculate total duration
    total_duration = sum(shot.get("duration", 3.0) for shot in shots)
    
    # Build resources
    resources_xml = ""
    clips_xml = ""
    current_offset = 0
    
    for i, shot in enumerate(shots):
        duration = shot.get("duration", 3.0)
        shot_id = shot.get("id", f"shot_{i}")
        img_url = shot.get("proxy_path") or shot.get("gcs_path") or ""
        
        # Resource
        resources_xml += f'''
        <asset id="r{i+1}" name="Shot_{i+1}" uid="{uuid.uuid4()}" 
               src="{img_url}" start="0s" duration="{duration}s" 
               hasVideo="1" format="r0" />
'''
        
        # Clip in spine
        clips_xml += f'''
            <asset-clip name="Shot_{i+1}" ref="r{i+1}" 
                        offset="{current_offset}s" duration="{duration}s" start="0s" />
'''
        current_offset += duration
    
    fcpxml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r0" name="FFVideoFormat1080p2398" 
                frameDuration="1001/24000s" width="1920" height="1080" 
                colorSpace="1-1-1 (Rec. 709)"/>
        {resources_xml}
    </resources>
    <library>
        <event name="{project_name}">
            <project name="{project_name}_Storyboard">
                <sequence format="r0" duration="{total_duration}s">
                    <spine>
                        {clips_xml}
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>
'''
    
    buffer = io.BytesIO(fcpxml.encode('utf-8'))
    
    return StreamingResponse(
        buffer,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{project_name.replace(" ", "_")}.fcpxml"'
        }
    )
