import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Note: style_presets might be public or protected. 
        // If protected, we need the token. If public, we don't.
        // Based on main.py, get_style_presets depends on get_db but NOT RequireAuth.
        // So it's public. But let's pass token if available just in case.

        const headers: Record<string, string> = {};
        if (session?.id_token) {
            headers["Authorization"] = `Bearer ${session.id_token}`;
        }

        const res = await fetch(`${apiUrl}/api/style_presets`, {
            headers,
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Backend error: ${res.statusText}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching style presets:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
