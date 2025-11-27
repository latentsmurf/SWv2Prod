import React from 'react';
import ReviewPlayer from '@/components/review/ReviewPlayer';

// Mock data for prototype - in real app, fetch based on token
const MOCK_PROJECT_ID = "proj_123";
const MOCK_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Placeholder

export default function ReviewPage({ params }: { params: { token: string } }) {
    // In a real implementation:
    // 1. Validate token from params.token
    // 2. Fetch associated project/video asset
    // 3. Pass data to ReviewPlayer

    return (
        <div className="w-full h-screen overflow-hidden">
            <ReviewPlayer
                videoUrl={MOCK_VIDEO_URL}
                projectId={MOCK_PROJECT_ID}
            />
        </div>
    );
}
