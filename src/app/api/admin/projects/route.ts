import { NextRequest, NextResponse } from 'next/server';

// Mock project data
interface Project {
    id: string;
    name: string;
    owner_email: string;
    owner_name: string;
    genre: string;
    status: 'draft' | 'in_progress' | 'completed' | 'archived';
    created_at: string;
    updated_at: string;
    scenes_count: number;
    shots_count: number;
    credits_used: number;
    visibility: 'private' | 'team' | 'public';
}

const projects: Project[] = [
    { id: 'proj-1', name: 'Midnight Romance', owner_email: 'sarah@studio.com', owner_name: 'Sarah Chen', genre: 'Romance', status: 'in_progress', created_at: '2024-10-01T10:00:00Z', updated_at: '2024-11-25T10:00:00Z', scenes_count: 24, shots_count: 156, credits_used: 4500, visibility: 'team' },
    { id: 'proj-2', name: 'Urban Legends S2', owner_email: 'netflix@partner.com', owner_name: 'Netflix Studios', genre: 'Horror', status: 'in_progress', created_at: '2024-09-15T10:00:00Z', updated_at: '2024-11-24T10:00:00Z', scenes_count: 48, shots_count: 320, credits_used: 15000, visibility: 'private' },
    { id: 'proj-3', name: 'Space Odyssey', owner_email: 'john@example.com', owner_name: 'John Smith', genre: 'Sci-Fi', status: 'completed', created_at: '2024-08-01T10:00:00Z', updated_at: '2024-10-15T10:00:00Z', scenes_count: 32, shots_count: 210, credits_used: 8500, visibility: 'public' },
    { id: 'proj-4', name: 'Corporate Video', owner_email: 'mike@films.io', owner_name: 'Mike Johnson', genre: 'Corporate', status: 'draft', created_at: '2024-11-20T10:00:00Z', updated_at: '2024-11-20T10:00:00Z', scenes_count: 5, shots_count: 12, credits_used: 200, visibility: 'private' },
    { id: 'proj-5', name: 'Documentary: Nature', owner_email: 'emma@prod.co', owner_name: 'Emma Wilson', genre: 'Documentary', status: 'archived', created_at: '2024-06-01T10:00:00Z', updated_at: '2024-09-01T10:00:00Z', scenes_count: 18, shots_count: 95, credits_used: 3200, visibility: 'private' },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;
        const genre = searchParams.get('genre') || undefined;
        const search = searchParams.get('search') || undefined;
        
        let filtered = [...projects];
        
        if (status && status !== 'all') {
            filtered = filtered.filter(p => p.status === status);
        }
        if (genre && genre !== 'all') {
            filtered = filtered.filter(p => p.genre.toLowerCase() === genre.toLowerCase());
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.owner_name.toLowerCase().includes(q) ||
                p.owner_email.toLowerCase().includes(q)
            );
        }
        
        // Calculate stats
        const stats = {
            total: projects.length,
            draft: projects.filter(p => p.status === 'draft').length,
            in_progress: projects.filter(p => p.status === 'in_progress').length,
            completed: projects.filter(p => p.status === 'completed').length,
            archived: projects.filter(p => p.status === 'archived').length,
            totalCredits: projects.reduce((sum, p) => sum + p.credits_used, 0),
            totalShots: projects.reduce((sum, p) => sum + p.shots_count, 0),
        };
        
        // Get unique genres
        const genres = [...new Set(projects.map(p => p.genre))];
        
        return NextResponse.json({
            projects: filtered,
            stats,
            genres,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, projectId } = body;
        
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        
        switch (action) {
            case 'archive':
                projects[projectIndex].status = 'archived';
                break;
            case 'unarchive':
                projects[projectIndex].status = 'draft';
                break;
            case 'delete':
                projects.splice(projectIndex, 1);
                break;
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing project action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
