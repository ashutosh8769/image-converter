import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const quality = parseInt((formData.get('quality') as string) || '80', 10);
    const targetFormat = (formData.get('targetFormat') as string) || 'image/avif';
    const scale = parseFloat((formData.get('scale') as string) || '1');
    const maxWidth = parseInt((formData.get('maxWidth') as string) || '0', 10);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    let pipeline = sharp(inputBuffer);
    const metadata = await pipeline.metadata();

    let width = metadata.width || 0;
    let height = metadata.height || 0;

    // Apply scale if needed
    if (scale < 1 && scale > 0 && width > 0 && height > 0) {
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      pipeline = pipeline.resize(width, height);
    } else if (maxWidth > 0 && width > maxWidth) {
      pipeline = pipeline.resize(maxWidth);
    }

    let outputBuffer: Buffer;
    let mimeType = 'image/avif';

    switch (targetFormat) {
      case 'image/webp':
        outputBuffer = await pipeline.webp({ quality }).toBuffer();
        mimeType = 'image/webp';
        break;
      case 'image/jpeg':
        outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
        mimeType = 'image/jpeg';
        break;
      case 'image/png':
        outputBuffer = await pipeline.png({ quality: Math.min(100, quality) }).toBuffer();
        mimeType = 'image/png';
        break;
      case 'image/tiff':
        outputBuffer = await pipeline.tiff({ quality }).toBuffer();
        mimeType = 'image/tiff';
        break;
      case 'image/gif':
        outputBuffer = await pipeline.gif().toBuffer();
        mimeType = 'image/gif';
        break;
      case 'image/avif':
      default:
        outputBuffer = await pipeline
          .avif({
            quality,
            effort: 4,
            chromaSubsampling: '4:2:0',
          })
          .toBuffer();
        mimeType = 'image/avif';
        break;
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': outputBuffer.length.toString(),
        'X-Converted-Width': (width || 0).toString(),
        'X-Converted-Height': (height || 0).toString(),
      },
    });
  } catch (error: any) {
    console.error('Conversion API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Image conversion failed' },
      { status: 500 }
    );
  }
}
