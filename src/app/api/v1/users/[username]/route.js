import { NextResponse } from "next/server";
import { getUser, hashPassword, setUser, verifyUser } from "/lib/backend/auth";
import { verifySession } from "/lib/backend/auth";

export async function POST(request) {
    const sessionId = request.cookies.get("session_id")?.value;
    const username = request.cookies.get("username")?.value;
    const body = await request.json();
    
    if (await verifySession(username, sessionId)) {
        if (body.password && body["new_password"]) {
            if (await verifyUser(username, body.password)) {
                body.password = await hashPassword(body["new_password"]);
            } else {
                return NextResponse.json({ status: "failed", message: "Authentication failed" });
            }
        } else {
            delete body.password;
        }
        delete body["new_password"];

        await setUser(username, body);
        return NextResponse.json({ status: "success", result: body });
    }
    return NextResponse.json({ status: "failed", message: "Authentication failed" });
}

export async function GET(request) {
    const username = new URL(request.url).pathname.split('/').at(-1);

    if (username) {
        const user = await getUser(username);
        return NextResponse.json({ status: "success", user: user });
    }
    return NextResponse.json({ status: "failed", message: "Invalid username" });
}

export const revalidate = 0;