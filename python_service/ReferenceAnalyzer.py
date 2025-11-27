import os
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Image
from vertexai.language_models import TextEmbeddingModel

class ReferenceAnalyzer:
    """
    Handles image analysis using Vertex AI Gemini models.
    """
    def __init__(self, project_id: str, location: str = "us-central1"):
        vertexai.init(project=project_id, location=location)
        self.model = GenerativeModel("gemini-1.5-flash-001") # Using Flash for speed/cost, or Pro for quality
        self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")

    def analyze_image(self, image_bytes: bytes) -> str:
        """
        Analyzes an image and returns a JSON string with metadata.
        """
        prompt = """
        Analyze this cinematic still. Return a valid JSON object (no markdown formatting) with the following keys:
        - shot_size: e.g., "Close-up", "Wide shot"
        - lighting_style: e.g., "Chiaroscuro", "High key", "Neon"
        - mood: e.g., "Melancholic", "Tense", "Joyful"
        - color_palette: A list of 3-5 dominant hex color codes.
        - description: A detailed visual description of the scene.
        """
        
        image = Part.from_data(image_bytes, mime_type="image/jpeg") # Assuming JPEG for simplicity, or detect
        
        response = self.model.generate_content(
            [image, prompt],
            generation_config={"response_mime_type": "application/json"}
        )
        
        return response.text

    def generate_embedding(self, text: str) -> list:
        """
        Generates a vector embedding for the given text.
        """
        embeddings = self.embedding_model.get_embeddings([text])
        return embeddings[0].values
