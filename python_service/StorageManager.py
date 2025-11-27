import datetime
from google.cloud import storage

class StorageManager:
    """
    Handles interactions with Google Cloud Storage.
    """
    def __init__(self, bucket_name: str, credentials_path: str = None):
        """
        Initialize the StorageManager.
        
        Args:
            bucket_name: The name of the GCS bucket.
            credentials_path: Path to the service account JSON key. 
                              If None, uses default environment credentials.
        """
        if credentials_path:
            self.client = storage.Client.from_service_account_json(credentials_path)
        else:
            self.client = storage.Client()
        
        self.bucket_name = bucket_name
        self.bucket = self.client.bucket(bucket_name)

    def upload_file(self, file_obj, destination_blob_name: str):
        """
        Uploads a file-like object to the bucket.

        Args:
            file_obj: A file-like object (e.g., from open() or BytesIO).
            destination_blob_name: The path/name of the file in the bucket.
        """
        blob = self.bucket.blob(destination_blob_name)
        # Rewind file if needed, though usually handled by caller or fresh stream
        if hasattr(file_obj, 'seek'):
            file_obj.seek(0)
            
        blob.upload_from_file(file_obj)
        print(f"File uploaded to {destination_blob_name}.")

    def generate_signed_url(self, blob_name: str, expiration_minutes: int = 60) -> str:
        """
        Generates a V4 signed URL for a blob.

        Args:
            blob_name: The name of the blob.
            expiration_minutes: How long the URL is valid for.

        Returns:
            The signed URL string.
        """
        blob = self.bucket.blob(blob_name)
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=expiration_minutes),
            method="GET",
        )
        return url

# IMPORTANT: To configure CORS for your GCS bucket so the React Video Editor 
# canvas doesn't crash, run the following command in your terminal:
# 
# echo '[{"origin": ["*"], "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"], "method": ["GET", "HEAD", "OPTIONS"], "maxAgeSeconds": 3600}]' > cors.json
# gsutil cors set cors.json gs://YOUR_BUCKET_NAME
# rm cors.json
    def download_file(self, source_blob_name: str, destination_file_name: str):
        """
        Downloads a blob from the bucket.
        """
        if not self.bucket:
            print(f"Mock download {source_blob_name} to {destination_file_name}")
            # Create a dummy file for testing if it doesn't exist
            if not os.path.exists(destination_file_name):
                with open(destination_file_name, "wb") as f:
                    f.write(b"dummy video content")
            return

        blob = self.bucket.blob(source_blob_name)
        blob.download_to_filename(destination_file_name)
        print(f"Downloaded {source_blob_name} to {destination_file_name}")
