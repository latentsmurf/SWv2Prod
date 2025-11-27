from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SceneWeaver AI Microservice")

class GenerationRequest(BaseModel):
    prompt: string
    style: string

@app.get("/")
def read_root():
    return {"status": "online", "service": "SceneWeaver AI Engine"}

from nano_banana import NanoBananaClient

nb_client = NanoBananaClient()

@app.post("/generate")
def generate_video(request: GenerationRequest):
    result = nb_client.generate_video(request.prompt, request.style)
    return result

from video_processing import generate_proxy

class ProcessRequest(BaseModel):
    input_path: str
    output_path: str
    task_type: str # 'proxy' or 'conform'

from export import generate_edl
from typing import List, Dict

class ExportRequest(BaseModel):
    project_name: str
    clips: List[Dict]
    format: str = "edl"

@app.post("/export-edl")
def export_project(request: ExportRequest):
    if request.format == "edl":
        edl_content = generate_edl(request.project_name, request.clips)
        return {"status": "success", "content": edl_content, "filename": f"{request.project_name}.edl"}
    return {"status": "error", "message": "Unsupported format"}
