import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface WhisperWord {
    word: string;
    start: number;
    end: number;
}

interface WhisperSegment {
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    words?: WhisperWord[];
}

interface WhisperResponse {
    text: string;
    segments: WhisperSegment[];
    language: string;
}

// Convert Whisper response to our caption format
function convertWhisperToCaption(segment: WhisperSegment) {
    return {
        text: segment.text.trim(),
        startMs: Math.round(segment.start * 1000),
        endMs: Math.round(segment.end * 1000),
        timestampMs: null,
        confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.95,
        words: segment.words?.map(w => ({
            word: w.word,
            startMs: Math.round(w.start * 1000),
            endMs: Math.round(w.end * 1000),
            confidence: 0.95
        })) || []
    };
}

// Generate demo captions for fallback
function generateDemoCaptions(duration: number = 10000) {
    const captions = [];
    const phrases = [
        "Welcome to SceneWeaver Production Studio.",
        "Create stunning AI-powered videos with ease.",
        "Generate captions automatically for any video.",
        "Professional quality results in seconds.",
        "Perfect for micro dramas and vertical content."
    ];
    
    let currentTime = 0;
    const segmentDuration = Math.min(3000, duration / phrases.length);
    
    for (let i = 0; i < phrases.length && currentTime < duration; i++) {
        const text = phrases[i];
        const words = text.split(' ');
        const wordDuration = segmentDuration / words.length;
        
        captions.push({
            text,
            startMs: currentTime,
            endMs: currentTime + segmentDuration,
            timestampMs: null,
            confidence: 0.95 + Math.random() * 0.05,
            words: words.map((word, idx) => ({
                word,
                startMs: currentTime + idx * wordDuration,
                endMs: currentTime + (idx + 1) * wordDuration,
                confidence: 0.95 + Math.random() * 0.05
            }))
        });
        
        currentTime += segmentDuration + 500; // 500ms gap between segments
    }
    
    return captions;
}

export async function POST(request: NextRequest) {
    try {
        const { videoSrc, audioUrl, language = 'en', duration } = await request.json();

        if (!videoSrc && !audioUrl) {
            return NextResponse.json(
                { error: 'Video source or audio URL is required' },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        // Try Python backend first (which may have Whisper or other transcription)
        try {
            const pythonResponse = await fetch(`${PYTHON_API_URL}/api/ai/transcribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': request.headers.get('Authorization') || '',
                },
                body: JSON.stringify({
                    video_url: videoSrc,
                    audio_url: audioUrl,
                    language
                }),
            });

            if (pythonResponse.ok) {
                const data = await pythonResponse.json();
                return NextResponse.json({
                    success: true,
                    captions: data.segments?.map(convertWhisperToCaption) || data.captions,
                    language: data.language || language,
                    processingTime: Date.now() - startTime,
                    source: 'python-backend'
                });
            }
        } catch (backendError) {
            console.log('Python backend not available, trying OpenAI directly...');
        }

        // Try OpenAI Whisper API directly if we have the API key
        if (OPENAI_API_KEY && audioUrl) {
            try {
                // Fetch the audio file
                const audioResponse = await fetch(audioUrl);
                if (audioResponse.ok) {
                    const audioBlob = await audioResponse.blob();
                    
                    // Create form data for OpenAI
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'audio.mp3');
                    formData.append('model', 'whisper-1');
                    formData.append('language', language);
                    formData.append('response_format', 'verbose_json');
                    formData.append('timestamp_granularities[]', 'word');
                    formData.append('timestamp_granularities[]', 'segment');

                    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        },
                        body: formData,
                    });

                    if (whisperResponse.ok) {
                        const whisperData: WhisperResponse = await whisperResponse.json();
                        
                        return NextResponse.json({
                            success: true,
                            captions: whisperData.segments.map(convertWhisperToCaption),
                            language: whisperData.language,
                            fullText: whisperData.text,
                            processingTime: Date.now() - startTime,
                            source: 'openai-whisper'
                        });
                    }
                }
            } catch (openaiError) {
                console.error('OpenAI Whisper error:', openaiError);
            }
        }

        // Fallback to demo captions
        console.log('Using demo captions (no transcription service available)');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        return NextResponse.json({
            success: true,
            captions: generateDemoCaptions(duration || 15000),
            language,
            processingTime: Date.now() - startTime,
            source: 'demo',
            message: 'Using demo captions. Set OPENAI_API_KEY or configure Python backend for real transcription.'
        });

    } catch (error) {
        console.error('Caption generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate captions', details: String(error) },
            { status: 500 }
        );
    }
} 