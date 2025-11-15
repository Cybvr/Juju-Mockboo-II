import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Upscale request received:', { ...body, image: body.image ? `[Base64 image ${body.image.length} chars]` : 'No image' });

    const {
      image,
      scale_factor = "2x",
      optimized_for = "standard",
      prompt,
      creativity = 0,
      hdr = 0,
      resemblance = 0,
      fractality = 0,
      engine = "automatic",
      webhook_url
    } = body;

    // Validate required fields
    if (!image) {
      console.error('No image provided');
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) {
      console.error('Freepik API key not configured');
      return NextResponse.json(
        { error: 'Freepik API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the payload
    const payload = {
      image,
      scale_factor,
      optimized_for,
      ...(prompt && { prompt }),
      creativity,
      hdr,
      resemblance,
      fractality,
      engine,
      ...(webhook_url && { webhook_url })
    };

    console.log('Sending request to Freepik API:', { ...payload, image: `[Base64 image ${image.length} chars]` });

    // Step 1: Submit the upscaling task
    const response = await fetch('https://api.freepik.com/v1/ai/image-upscaler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    console.log('Freepik API response status:', response.status);
    console.log('Freepik API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Freepik API error:', errorData);

      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch {
        parsedError = { message: errorData };
      }

      return NextResponse.json(
        { 
          error: 'Failed to submit upscaling task', 
          details: parsedError,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const taskData = await response.json();
    console.log('Freepik API task submission response:', taskData);

    // Extract task_id from response
    const taskId = taskData.task_id || taskData.data?.task_id || taskData.id;
    if (!taskId) {
      console.error('No task_id received from Freepik API');
      return NextResponse.json(
        { error: 'No task ID received from upscaling service' },
        { status: 500 }
      );
    }

    console.log('Task submitted with ID:', taskId);

    // Step 2: Poll for task completion
    const maxAttempts = 30; // 5 minutes max (30 * 10 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts} for task ${taskId}`);

      // Wait before polling (except for first attempt)
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for first check
      }

      try {
        const statusResponse = await fetch(`https://api.freepik.com/v1/ai/image-upscaler/${taskId}`, {
          method: 'GET',
          headers: {
            'x-freepik-api-key': apiKey,
            'Accept': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          console.error(`Status check failed: ${statusResponse.status}`);
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`Task status (attempt ${attempts}):`, statusData);

        // Check various possible status indicators
        const status = statusData.status || statusData.data?.status || statusData.state;

        if (status === 'completed' || status === 'success' || status === 'done' || status === 'COMPLETED') {
          // Task completed successfully
          console.log('Task completed successfully');

          // Extract the upscaled image(s)
          let images: string[] = [];

          // Try different possible response structures
          if (statusData.images && Array.isArray(statusData.images)) {
            images = statusData.images;
          } else if (statusData.image) {
            images = [statusData.image];
          } else if (statusData.data?.images && Array.isArray(statusData.data.images)) {
            images = statusData.data.images;
          } else if (statusData.data?.image) {
            images = [statusData.data.image];
          } else if (statusData.data?.generated && Array.isArray(statusData.data.generated)) {
            images = statusData.data.generated;
          } else if (statusData.result?.images && Array.isArray(statusData.result.images)) {
            images = statusData.result.images;
          } else if (statusData.result?.image) {
            images = [statusData.result.image];
          } else if (statusData.output?.images && Array.isArray(statusData.output.images)) {
            images = statusData.output.images;
          } else if (statusData.output?.image) {
            images = [statusData.output.image];
          }

          if (images.length > 0) {
            console.log(`Found ${images.length} upscaled images`);
            return NextResponse.json({
              images,
              task_id: taskId,
              status: 'completed'
            });
          } else {
            console.error('Task completed but no images found in response:', statusData);
            return NextResponse.json(
              { error: 'Task completed but no images were returned' },
              { status: 500 }
            );
          }
        } else if (status === 'failed' || status === 'error') {
          console.error('Task failed:', statusData);
          return NextResponse.json(
            { 
              error: 'Upscaling task failed',
              details: statusData.error || statusData.message || 'Unknown error'
            },
            { status: 500 }
          );
        } else if (status === 'processing' || status === 'pending' || status === 'running') {
          console.log('Task still processing, continuing to poll...');
          continue;
        } else {
          console.log('Unknown status, continuing to poll...', { status, fullResponse: statusData });
          continue;
        }
      } catch (pollError) {
        console.error(`Error polling task status (attempt ${attempts}):`, pollError);
        continue;
      }
    }

    // If we get here, we've exceeded max attempts
    console.error('Task polling timeout');
    return NextResponse.json(
      { 
        error: 'Upscaling task timed out',
        details: 'The upscaling process is taking longer than expected. Please try again later.',
        task_id: taskId
      },
      { status: 408 }
    );

  } catch (error) {
    console.error('Image upscale error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}