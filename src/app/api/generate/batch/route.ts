import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// POST /api/generate/batch - Start batch generation for multiple shots
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        const { project_id, shot_ids, scene_ids, style_mode, style_preset_id } = body;

        if (!project_id) {
            return NextResponse.json(
                { error: 'project_id is required' },
                { status: 400 }
            );
        }

        if (!shot_ids?.length && !scene_ids?.length) {
            return NextResponse.json(
                { error: 'Either shot_ids or scene_ids is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/generate/batch`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id,
                shot_ids: shot_ids || [],
                scene_ids: scene_ids || [],
                style_mode: style_mode || 'storyboard',
                style_preset_id
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.detail || 'Failed to start batch generation' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error starting batch generation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
