
import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documentService';

const documentService = new DocumentService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await documentService.getDocumentById(params.id);
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    await documentService.updateDocument(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await documentService.deleteDocument(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
