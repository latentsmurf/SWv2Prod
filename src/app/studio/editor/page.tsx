import EditorBridge from '@/components/post-production/editor-core/EditorBridge';

export default function EditorPage() {
    // Hardcoded project ID for prototype or fetch from params/context
    const projectId = "default-project-id";

    return <EditorBridge projectId={projectId} />;
}
