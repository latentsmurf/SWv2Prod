import { NextRequest, NextResponse } from 'next/server';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { blogStore } from '@/lib/blog';

// ============================================================================
// XML-RPC API for Blog Posting Software Compatibility
// Supports: MetaWeblog API, Blogger API, WordPress API
// Compatible with: MarsEdit, Open Live Writer, Windows Live Writer, etc.
// ============================================================================

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
});

// Simple auth check - in production, use proper authentication
function authenticate(username: string, password: string): boolean {
    // For demo, accept any non-empty credentials
    // In production, verify against your auth system
    const validApiKey = process.env.BLOG_API_KEY || 'demo_api_key';
    return password === validApiKey || (Boolean(username) && Boolean(password));
}

// Convert blog post to MetaWeblog struct format
function postToStruct(post: any) {
    return {
        postid: post.id,
        title: post.title,
        description: post.content,
        link: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/${post.slug}`,
        permaLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/${post.slug}`,
        dateCreated: { '@_type': 'dateTime.iso8601', '#text': post.createdAt },
        date_created_gmt: { '@_type': 'dateTime.iso8601', '#text': post.createdAt },
        wp_slug: post.slug,
        post_status: post.status === 'published' ? 'publish' : post.status,
        categories: post.categories,
        mt_keywords: post.tags?.join(', ') || '',
        mt_excerpt: post.excerpt || '',
        mt_text_more: '',
        wp_more_text: '',
        mt_allow_comments: 1,
        mt_allow_pings: 1,
        wp_author_display_name: post.author?.name || 'Admin',
        custom_fields: [],
    };
}

// Build XML-RPC response
function buildResponse(result: any): string {
    return `<?xml version="1.0"?>
<methodResponse>
<params>
<param>
<value>${valueToXml(result)}</value>
</param>
</params>
</methodResponse>`;
}

// Build XML-RPC fault response
function buildFault(code: number, message: string): string {
    return `<?xml version="1.0"?>
<methodResponse>
<fault>
<value>
<struct>
<member><name>faultCode</name><value><int>${code}</int></value></member>
<member><name>faultString</name><value><string>${message}</string></value></member>
</struct>
</value>
</fault>
</methodResponse>`;
}

// Convert JS value to XML-RPC value
function valueToXml(value: any): string {
    if (value === null || value === undefined) {
        return '<string></string>';
    }
    if (typeof value === 'boolean') {
        return `<boolean>${value ? 1 : 0}</boolean>`;
    }
    if (typeof value === 'number') {
        return Number.isInteger(value) ? `<int>${value}</int>` : `<double>${value}</double>`;
    }
    if (typeof value === 'string') {
        return `<string>${escapeXml(value)}</string>`;
    }
    if (Array.isArray(value)) {
        const items = value.map(v => `<value>${valueToXml(v)}</value>`).join('');
        return `<array><data>${items}</data></array>`;
    }
    if (typeof value === 'object') {
        if (value['@_type'] === 'dateTime.iso8601') {
            return `<dateTime.iso8601>${value['#text']}</dateTime.iso8601>`;
        }
        const members = Object.entries(value)
            .map(([k, v]) => `<member><name>${k}</name><value>${valueToXml(v)}</value></member>`)
            .join('');
        return `<struct>${members}</struct>`;
    }
    return `<string>${String(value)}</string>`;
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Parse XML-RPC params
function parseParams(params: any): any[] {
    if (!params?.param) return [];
    const paramArray = Array.isArray(params.param) ? params.param : [params.param];
    return paramArray.map((p: any) => parseValue(p.value));
}

function parseValue(value: any): any {
    if (!value) return null;
    if (value.string !== undefined) return value.string || '';
    if (value.int !== undefined) return parseInt(value.int);
    if (value.i4 !== undefined) return parseInt(value.i4);
    if (value.double !== undefined) return parseFloat(value.double);
    if (value.boolean !== undefined) return value.boolean === '1' || value.boolean === 1;
    if (value['dateTime.iso8601'] !== undefined) return value['dateTime.iso8601'];
    if (value.base64 !== undefined) return value.base64;
    if (value.array?.data?.value) {
        const arr = Array.isArray(value.array.data.value) 
            ? value.array.data.value 
            : [value.array.data.value];
        return arr.map(parseValue);
    }
    if (value.struct?.member) {
        const members = Array.isArray(value.struct.member) 
            ? value.struct.member 
            : [value.struct.member];
        const obj: any = {};
        members.forEach((m: any) => {
            obj[m.name] = parseValue(m.value);
        });
        return obj;
    }
    // If value is just text content
    if (typeof value === 'string') return value;
    return null;
}

// Handle XML-RPC method calls
async function handleMethod(methodName: string, params: any[]): Promise<string> {
    console.log(`XML-RPC: ${methodName}`, params.slice(0, 2)); // Log method (hide sensitive params)

    switch (methodName) {
        // ====== Blogger API ======
        case 'blogger.getUsersBlogs':
        case 'metaWeblog.getUsersBlogs': {
            const [appKey, username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            return buildResponse([{
                blogid: '1',
                blogName: 'SceneWeaver Blog',
                url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog`,
            }]);
        }

        // ====== MetaWeblog API ======
        case 'metaWeblog.getRecentPosts': {
            const [blogId, username, password, numberOfPosts] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            const posts = blogStore.getAllPosts().slice(0, numberOfPosts || 10);
            return buildResponse(posts.map(postToStruct));
        }

        case 'metaWeblog.getPost': {
            const [postId, username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            const post = blogStore.getPostById(postId);
            if (!post) {
                return buildFault(404, 'Post not found');
            }
            return buildResponse(postToStruct(post));
        }

        case 'metaWeblog.newPost': {
            const [blogId, username, password, content, publish] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            
            const settings = blogStore.getSettings();
            const post = blogStore.createPost({
                title: content.title || 'Untitled',
                slug: content.wp_slug || blogStore.generateSlug(content.title || 'untitled'),
                content: content.description || '',
                excerpt: content.mt_excerpt || '',
                coverImage: content.wp_post_thumbnail || undefined,
                categories: Array.isArray(content.categories) ? content.categories : [],
                tags: content.mt_keywords ? content.mt_keywords.split(',').map((t: string) => t.trim()) : [],
                status: publish ? 'published' : 'draft',
                publishedAt: publish ? new Date().toISOString() : undefined,
                author: settings.defaultAuthor,
            });
            return buildResponse(post.id);
        }

        case 'metaWeblog.editPost': {
            const [postId, username, password, content, publish] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }

            const updates: any = {
                title: content.title,
                content: content.description,
                excerpt: content.mt_excerpt,
                status: publish ? 'published' : 'draft',
            };

            if (content.wp_slug) updates.slug = content.wp_slug;
            if (content.categories) updates.categories = Array.isArray(content.categories) ? content.categories : [];
            if (content.mt_keywords) updates.tags = content.mt_keywords.split(',').map((t: string) => t.trim());
            if (content.wp_post_thumbnail) updates.coverImage = content.wp_post_thumbnail;

            const post = blogStore.updatePost(postId, updates);
            if (!post) {
                return buildFault(404, 'Post not found');
            }
            return buildResponse(true);
        }

        case 'metaWeblog.deletePost':
        case 'blogger.deletePost': {
            const isMetaWeblog = methodName === 'metaWeblog.deletePost';
            const [appKeyOrPostId, postIdOrUsername, usernameOrPassword, passwordOrPublish] = params;
            
            const postId = isMetaWeblog ? appKeyOrPostId : postIdOrUsername;
            const username = isMetaWeblog ? postIdOrUsername : usernameOrPassword;
            const password = isMetaWeblog ? usernameOrPassword : passwordOrPublish;

            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }

            const deleted = blogStore.deletePost(postId);
            if (!deleted) {
                return buildFault(404, 'Post not found');
            }
            return buildResponse(true);
        }

        case 'metaWeblog.getCategories': {
            const [blogId, username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            const categories = blogStore.getAllCategories();
            return buildResponse(categories.map(c => ({
                categoryId: c.id,
                categoryName: c.name,
                htmlUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/category/${c.slug}`,
                rssUrl: '',
            })));
        }

        case 'metaWeblog.newMediaObject': {
            const [blogId, username, password, mediaObject] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            // In production, save the file and return URL
            // For now, return a placeholder
            const filename = mediaObject.name || 'upload';
            return buildResponse({
                url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/uploads/${filename}`,
                file: filename,
                type: mediaObject.type || 'image/jpeg',
            });
        }

        // ====== WordPress API extensions ======
        case 'wp.getUsersBlogs': {
            const [username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            return buildResponse([{
                isAdmin: true,
                url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog`,
                blogid: '1',
                blogName: 'SceneWeaver Blog',
                xmlrpc: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog/xmlrpc`,
            }]);
        }

        case 'wp.getCategories': {
            const [blogId, username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            const categories = blogStore.getAllCategories();
            return buildResponse(categories.map(c => ({
                categoryId: c.id,
                categoryName: c.name,
                categoryDescription: c.description || '',
                htmlUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/category/${c.slug}`,
                rssUrl: '',
            })));
        }

        case 'wp.getTags': {
            const [blogId, username, password] = params;
            if (!authenticate(username, password)) {
                return buildFault(403, 'Authentication failed');
            }
            const tags = blogStore.getAllTags();
            return buildResponse(tags.map((tag, i) => ({
                tag_id: i + 1,
                name: tag,
                count: 0,
                slug: tag.toLowerCase().replace(/\s+/g, '-'),
            })));
        }

        case 'wp.getPostFormats': {
            return buildResponse({
                standard: 'Standard',
                aside: 'Aside',
                image: 'Image',
                video: 'Video',
                quote: 'Quote',
                link: 'Link',
            });
        }

        // ====== System methods ======
        case 'system.listMethods': {
            return buildResponse([
                'system.listMethods',
                'blogger.getUsersBlogs',
                'blogger.deletePost',
                'metaWeblog.getUsersBlogs',
                'metaWeblog.getRecentPosts',
                'metaWeblog.getPost',
                'metaWeblog.newPost',
                'metaWeblog.editPost',
                'metaWeblog.deletePost',
                'metaWeblog.getCategories',
                'metaWeblog.newMediaObject',
                'wp.getUsersBlogs',
                'wp.getCategories',
                'wp.getTags',
                'wp.getPostFormats',
            ]);
        }

        default:
            return buildFault(501, `Method not implemented: ${methodName}`);
    }
}

// Main request handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const parsed = parser.parse(body);
        
        const methodCall = parsed.methodCall;
        if (!methodCall) {
            return new NextResponse(buildFault(400, 'Invalid XML-RPC request'), {
                status: 200,
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        const methodName = methodCall.methodName;
        const params = parseParams(methodCall.params);
        
        const response = await handleMethod(methodName, params);
        
        return new NextResponse(response, {
            status: 200,
            headers: { 'Content-Type': 'text/xml' },
        });
    } catch (error) {
        console.error('XML-RPC error:', error);
        return new NextResponse(buildFault(500, 'Internal server error'), {
            status: 200,
            headers: { 'Content-Type': 'text/xml' },
        });
    }
}

// Support GET for discovery
export async function GET() {
    return NextResponse.json({
        name: 'SceneWeaver Blog XML-RPC API',
        description: 'MetaWeblog API compatible endpoint for external blog posting software',
        endpoint: '/api/blog/xmlrpc',
        supported: [
            'MetaWeblog API',
            'Blogger API',
            'WordPress API (partial)',
        ],
        compatible_software: [
            'MarsEdit',
            'Open Live Writer',
            'Windows Live Writer',
            'Blogo',
            'Desk',
            'Byword',
            'IA Writer',
            'Ulysses',
        ],
        setup: {
            api_endpoint: '/api/blog/xmlrpc',
            blog_id: '1',
            username: 'your_username',
            password: 'your_api_key (set BLOG_API_KEY env var)',
        },
    });
}
