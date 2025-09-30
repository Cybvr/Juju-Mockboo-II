Directory Structure (simplified)
/app
  /api
    /fuse-images
      route.ts       ← API handler
  /components
    FuseForm.tsx     ← UI to upload / select two images
  page.tsx           ← page showing form + result

✅ API Route: app/api/fuse-images/route.ts
// app/api/fuse-images/route.ts

import { NextRequest, NextResponse } from "next/server";

interface Body {
  imageA: string;  // base64 (without data: prefix or you can include, just parse accordingly)
  imageB: string;
  prompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageA, imageB, prompt } = (await request.json()) as Body;
    if (!imageA || !imageB) {
      return NextResponse.json({ error: "Need two images" }, { status: 400 });
    }

    // Build payload for Gemini’s image fusion endpoint
    const payload = {
      model: "gemini-2.5-flash-image-preview",  // adjust if your slug is different
      contents: [
        {
          mime_type: "image/png",
          data: imageA,
        },
        {
          mime_type: "image/png",
          data: imageB,
        },
        {
          text: prompt ?? "Fuse the two images into a single cohesive image"
        }
      ],
      response_modalities: ["IMAGE"],
      image_format: "PNG",
    };

    const apiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Gemini fusion error:", errText);
      return NextResponse.json({ error: "Fusion failed", detail: errText }, { status: 500 });
    }

    const apiJson = await apiRes.json();
    const candidate = apiJson.candidates?.[0];
    if (!candidate) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const part = candidate.content?.parts?.find((p: any) => p.inline_data?.data);
    if (!part) {
      return NextResponse.json({ error: "No image data in response" }, { status: 500 });
    }

    const outBase64 = part.inline_data.data;
    return NextResponse.json({ image: outBase64 });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

⚛️ Client Component: app/components/FuseForm.tsx
// app/components/FuseForm.tsx

"use client";

import React, { useState } from "react";

export default function FuseForm() {
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // strip off “data:*/*;base64,” prefix
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imgA || !imgB) return;

    setLoading(true);
    try {
      const resp = await fetch("/api/fuse-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageA: imgA, imageB: imgB, prompt: "Merge side by side" }),
      });
      const j = await resp.json();
      if (!resp.ok) {
        throw new Error(j.error ?? "Failed");
      }
      setResult(j.image);
    } catch (err: any) {
      console.error("Client error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files && e.target.files[0]) {
              const b = await toBase64(e.target.files[0]);
              setImgA(b);
            }
          }} />
        </div>
        <div>
          <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files && e.target.files[0]) {
              const b = await toBase64(e.target.files[0]);
              setImgB(b);
            }
          }} />
        </div>
        <button type="submit" disabled={loading || !imgA || !imgB}>
          { loading ? "Fusing…" : "Fuse Images" }
        </button>
      </form>

      { result && (
        <div>
          <h3>Result:</h3>
          <img src={`data:image/png;base64,${result}`} alt="Fused image" />
        </div>
      ) }
    </div>
  );
}