import { NextResponse } from 'next/server';
import { blogStore } from '@/lib/blog';

// GET /api/blog/categories - List all categories
export async function GET() {
    const categories = blogStore.getAllCategories();
    return NextResponse.json({ categories });
}
