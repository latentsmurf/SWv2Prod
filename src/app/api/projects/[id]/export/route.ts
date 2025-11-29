import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/projects/[id]/export - Start export job
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const { 
            platform, 
            format,
            resolution,
            include_subtitles,
            include_audio,
            quality,
            watermark
        } = body;

        // Try Python backend first
        try {
            const response = await fetch(`${PYTHON_API_URL}/api/projects/${id}/export`, {
                method: 'POST',
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available for export');
        }

        // Return mock export job
        const jobId = crypto.randomUUID();
        
        return NextResponse.json({
            job_id: jobId,
            project_id: id,
            status: 'queued',
            platform,
            format: format || 'mp4',
            resolution: resolution || '1080x1920',
            settings: {
                include_subtitles,
                include_audio,
                quality,
                watermark
            },
            created_at: new Date().toISOString(),
            estimated_time: '5 minutes',
            message: 'Export job queued. In production, this would render your video.'
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to start export' }, { status: 500 });
    }
}

// GET /api/projects/[id]/export - Get export status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('job_id');

        // Try Python backend first
        try {
            const response = await fetch(
                `${PYTHON_API_URL}/api/projects/${id}/export${jobId ? `?job_id=${jobId}` : ''}`,
                {
                    headers: {
                        'Authorization': request.headers.get('Authorization') || '',
                    }
                }
            );

            if (response.ok) {
                return NextResponse.json(await response.json());
            }
        } catch (backendError) {
            console.log('Backend not available');
        }

        // Return mock status
        return NextResponse.json({
            job_id: jobId || 'demo-job',
            project_id: id,
            status: 'completed',
            progress: 100,
            download_url: '/api/placeholder-export.mp4',
            created_at: new Date(Date.now() - 300000).toISOString(),
            completed_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching export status:', error);
        return NextResponse.json({ error: 'Failed to fetch export status' }, { status: 500 });
    }
}
