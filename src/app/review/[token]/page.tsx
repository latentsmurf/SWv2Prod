import { redirect } from 'next/navigation';
import ReviewPageClient from './ReviewPageClient';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

async function getReviewData(token: string) {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/review/${token}`, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching review data:', error);
        return null;
    }
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    
    // Fetch review link data from backend
    const reviewData = await getReviewData(token);
    
    // For now, use fallback data if not found (development mode)
    const projectData = reviewData || {
        project_id: 'demo_project',
        project_name: 'Demo Project',
        video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        allow_comments: true,
        password_protected: false,
        scenes: [],
        shots: []
    };

    return <ReviewPageClient data={projectData} token={token} />;
}
