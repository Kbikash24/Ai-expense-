// app/api/process-receipt/route.ts
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { extractExpenseDetailsWithAI } from '../../lib/aiUtlis';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageBase64 = body.imageBase64;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Valid imageBase64 string is required' },
        { status: 400 }
      );
    }

    // Validate base64 format
    const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    if (!base64Regex.test(base64Data)) {
      return NextResponse.json(
        { error: 'Invalid base64 image data' },
        { status: 400 }
      );
    }

    // OCR Processing with OpenAI
    console.log("Starting OCR processing with OpenAI...");
    const ocrResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // Use the vision model
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text from this receipt image exactly as it appears, including numbers, dates, and prices. Preserve the original formatting and layout as much as possible."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`
            }
          }
        ]
      }],
      max_tokens: 1000
    });

    const extractedText = ocrResponse.choices[0]?.message?.content;
    console.log(extractedText,'test')
    
    if (!extractedText) {
      console.warn("No text detected in image");
      return NextResponse.json(
        { error: 'No text content detected in the image' },
        { status: 400 }
      );
    }

    console.log(`OCR completed. Text length: ${extractedText.length} chars`);
    
    // AI Analysis
    console.log("Starting expense analysis...");
    const analyzedData = await extractExpenseDetailsWithAI(extractedText);
    
    // Sanitize response data
    const responseData = {
      category: analyzedData.category,
      amount: analyzedData.amount,
      date: analyzedData.date,
      merchant: analyzedData.description,
      rawText: extractedText // Optional: include raw text for debugging
    };

    return NextResponse.json({ 
      success: true,
      data: responseData 
    });

  } catch (error: unknown) {
    console.error("Processing error:", error);
    
    const errorResponse = {
      error: 'Receipt processing failed',
      details: '',
      status: 500
    };

    if (error instanceof Error) {
      errorResponse.details = error.message;
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        errorResponse.error = 'API quota exceeded';
        errorResponse.status = 429;
      } else if (error.message.includes('invalid')) {
        errorResponse.error = 'Invalid request data';
        errorResponse.status = 400;
      } else if (error.message.includes('auth') || error.message.includes('API key')) {
        errorResponse.error = 'Authentication error';
        errorResponse.status = 401;
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorResponse.error, 
        details: errorResponse.details 
      },
      { status: errorResponse.status }
    );
  }
}