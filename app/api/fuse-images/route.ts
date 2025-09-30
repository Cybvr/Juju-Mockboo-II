import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Body {
  imageA: string;  // base64 (without data: prefix or you can include, just parse accordingly)
  imageB: string;
  prompt?: string;
}

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function POST(request: NextRequest) {
  try {
    const { imageA, imageB, prompt } = (await request.json()) as Body;
    if (!imageA || !imageB) {
      return NextResponse.json({ error: "Need two images" }, { status: 400 });
    }

    // Strip data URL prefix if present
    let imageDataA = imageA.startsWith('data:') ? imageA.split(',')[1] : imageA;
    let imageDataB = imageB.startsWith('data:') ? imageB.split(',')[1] : imageB;

    const contents = [
      { text: prompt ?? "Fuse the two images into a single cohesive image" },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageDataA,
        },
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageDataB,
        },
      },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const part = candidate.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!part) {
      return NextResponse.json({ error: "No image data in response" }, { status: 500 });
    }

    return NextResponse.json({ image: part.inlineData.data });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}