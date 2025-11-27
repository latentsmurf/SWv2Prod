import { Storage } from '@google-cloud/storage';

// Initialize storage with credentials from environment variables
// In production, these should be handled securely, potentially via a service account key file
// or workload identity federation if running on GCP.
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucketName = process.env.GCS_BUCKET_NAME || 'sceneweaver-assets';

export const uploadFileToGCS = async (
    file: Buffer,
    destination: string,
    contentType: string
) => {
    try {
        const bucket = storage.bucket(bucketName);
        const fileObj = bucket.file(destination);

        await fileObj.save(file, {
            contentType,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Make the file public (optional, depending on requirements)
        // await fileObj.makePublic();

        return `https://storage.googleapis.com/${bucketName}/${destination}`;
    } catch (error) {
        console.error('Error uploading to GCS:', error);
        throw new Error('Failed to upload file to Google Cloud Storage');
    }
};

export const getGCSFileUrl = (filename: string) => {
    return `https://storage.googleapis.com/${bucketName}/${filename}`;
};
