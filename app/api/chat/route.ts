import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { storageService } from '@/services/storageService';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to detect image generation requests
function isImageGenerationRequest(content: string): boolean {
  const imageKeywords = [
    'generate', 'create', 'make', 'draw', 'design', 'produce',
    'image', 'picture', 'photo', 'illustration', 'artwork', 'visual'
  ];

  const contentLower = content.toLowerCase();

  // Check for common image generation patterns
  const patterns = [
    /generate.*image/i,
    /create.*image/i,
    /make.*image/i,
    /draw.*image/i,
    /image.*of/i,
    /picture.*of/i,
    /show.*me.*image/i,
    /can.*you.*create/i,
    /can.*you.*generate/i,
    /can.*you.*make/i
  ];

  return patterns.some(pattern => pattern.test(content)) ||
         (imageKeywords.some(keyword => contentLower.includes(keyword)) && 
          imageKeywords.filter(keyword => contentLower.includes(keyword)).length >= 2);
}

export async function POST(request: NextRequest) {
  try {
    const { messages, uploadedImage, generateImage, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content || lastMessage.content.trim() === '') {
      return NextResponse.json(
        { error: 'Last message content is required' },
        { status: 400 }
      );
    }

    // Check if this is an explicit image generation request
    if (generateImage || isImageGenerationRequest(lastMessage.content)) {
      try {
        // Import and use the GoogleGenAI directly to avoid fetch issues
        const { GoogleGenAI } = require('@google/genai');

        const genAI = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY || ''
        });

        const response = await genAI.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: lastMessage.content,
          config: {
            numberOfImages: 1,
            aspectRatio: "1:1",
          },
        });

        const generatedImages: string[] = [];
        for (const generatedImage of response.generatedImages) {
          const imageData = generatedImage.image.imageBytes;
          const dataUrl = `data:image/png;base64,${imageData}`;
          generatedImages.push(dataUrl);
        }

        if (generatedImages.length > 0) {
          // Upload generated images to persistent storage if userId is provided
          let persistentImageUrls = generatedImages;
          if (userId) {
            try {
              persistentImageUrls = await storageService.uploadImages(generatedImages, userId);
            } catch (uploadError) {
              console.warn('Failed to upload images to storage, using base64:', uploadError);
              // Keep the base64 images as fallback
            }
          }

          return NextResponse.json({
            success: true,
            content: `I've generated an image for you based on your prompt: "${lastMessage.content}"`,
            images: persistentImageUrls,
            isImageGeneration: true
          });
        }
      } catch (error) {
        console.error('Image generation failed:', error);
        // Fall through to regular chat if image generation fails
      }
    }

    // Search for relevant knowledge base documents
    let contextPrompt = '';
    try {
      const relevantDocs = await knowledgeBaseService.searchDocuments(lastMessage.content);

      if (relevantDocs.length > 0) {
        contextPrompt = `\n\nRelevant information from our knowledge base:\n`;
        relevantDocs.slice(0, 3).forEach((doc, index) => {
          contextPrompt += `\n${index + 1}. ${doc.title}\n${doc.content}\n`;
        });
        contextPrompt += `\nPlease use this information to provide accurate and helpful responses. If the user's question relates to any of the above information, reference it in your answer.\n\n`;
      }
    } catch (knowledgeError) {
      console.warn('Knowledge base search failed, continuing without context:', knowledgeError);
      // Continue without knowledge base context
    }

    // Build conversation history for context
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add the current message with context
    conversationHistory.push({
      role: 'user',
      parts: [{ text: contextPrompt + lastMessage.content }]
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All except the current message
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const aiResponse = response.text();

    return NextResponse.json({
      success: true,
      content: aiResponse,
      chatId: messages[0]?.chatId // Assuming chatId is available in the first message
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 401 }
        );
      }
      if (error.message.includes('QUOTA')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('SAFETY')) {
        return NextResponse.json(
          { error: 'Message was blocked by safety filters. Please rephrase your request.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process chat message: ' + (error as Error).message },
      { status: 500 }
    );
  }
}