import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/export/storyboard - Export storyboard in various formats
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const {
            project_id,
            project_name,
            format, // 'pdf' | 'png_strip' | 'pitch_deck' | 'fcpxml'
            options,
            scene_ids,
            shot_ids
        } = body;

        if (!project_id || !format) {
            return NextResponse.json(
                { error: 'project_id and format are required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/export/storyboard`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id,
                project_name: project_name || 'Untitled',
                format,
                options: options || {},
                scene_ids: scene_ids || [],
                shot_ids: shot_ids || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Export failed' },
                { status: response.status }
            );
        }

        // Get the file from the response
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const contentDisposition = response.headers.get('content-disposition');
        const blob = await response.blob();

        // Return the file
        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': contentDisposition || `attachment; filename="storyboard.${format === 'pdf' ? 'pdf' : format === 'fcpxml' ? 'fcpxml' : 'zip'}"`,
            }
        });
    } catch (error) {
        console.error('Error exporting storyboard:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
