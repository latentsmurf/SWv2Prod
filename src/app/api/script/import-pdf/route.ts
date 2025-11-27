import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.id_token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // When sending FormData with fetch, do NOT set Content-Type header manually.
        // The browser/fetch will set it with the boundary.
        // However, since we are proxying, we need to make sure we pass the body correctly.
        // Next.js Request body can be passed to fetch.

        const res = await fetch(`${apiUrl}/api/script/import-pdf`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.id_token}`,
                // "Content-Type": "multipart/form-data" // Do NOT set this
            },
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend error:", errorText);
            return NextResponse.json(
                { error: `Backend error: ${res.statusText}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error importing PDF:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
