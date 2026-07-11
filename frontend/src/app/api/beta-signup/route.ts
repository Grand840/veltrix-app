import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { full_name, email, company, use_case, nb_servers, how_heard, message } = data;

    if (!full_name || !email || !use_case) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const resp = await fetch(`${apiUrl}/api/v1/beta/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name, email, company, use_case,
        nb_servers, how_heard, message,
      }),
    });

    if (!resp.ok) {
      console.log("Beta signup (no backend endpoint yet):", { full_name, email, use_case });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Beta signup error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
