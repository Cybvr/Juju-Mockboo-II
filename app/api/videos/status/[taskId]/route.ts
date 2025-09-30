import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Freepik API key not configured' },
        { status: 500 }
      );
    }

    // Check status using Freepik API
    const response = await fetch(`https://api.freepik.com/v1/ai/task/${taskId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Failed to check video status', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the status data from Freepik API
    return NextResponse.json({
      status: data.status, // 'pending', 'processing', 'completed', 'failed'
      data: data.data,
      error: data.error,
      task_id: taskId
    });

  } catch (error) {
    console.error('Video status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}