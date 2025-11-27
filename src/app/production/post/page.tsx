import EditorWrapper from "@/components/post-production/EditorWrapper";

export default function PostProductionPage() {
    // In a real app, we'd fetch the project ID from the URL or context
    // For now, we'll pass a dummy ID or handle it inside the wrapper
    return <EditorWrapper projectId="mock-project-id" />;
}
