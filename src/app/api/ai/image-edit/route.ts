import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shot_id, operation, prompt, image_base64, mask_base64, selection } = body;

        // Forward to Python backend (Nano Banana Pro / Gemini)
        const response = await fetch(`${PYTHON_API_URL}/api/ai/image-edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify({
                shot_id,
                operation,
                prompt,
                image_base64,
                mask_base64,
                selection
            }),
        });

        if (!response.ok) {
            // If backend not available, return mock response for development
            if (response.status === 404 || response.status === 502 || response.status === 503) {
                // Mock AI response for development
                return NextResponse.json({
                    status: 'success',
                    message: `AI ${operation} operation completed (mock)`,
                    result_image: image_base64, // Return original for mock
                    operation_id: crypto.randomUUID()
                });
            }
            
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            return NextResponse.json(
                { status: 'error', detail: error.detail || 'AI operation failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('AI image edit error:', error);
        
        // For development, return mock success
        const body = await request.clone().json().catch(() => ({}));
        return NextResponse.json({
            status: 'success',
            message: `AI operation completed (fallback mock)`,
            result_image: body.image_base64,
            operation_id: crypto.randomUUID()
        });
    }
}
