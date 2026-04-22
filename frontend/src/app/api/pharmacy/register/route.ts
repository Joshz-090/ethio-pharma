import { NextResponse } from 'next/server';
import { z } from 'zod';

const registrationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  license_number: z.string().min(2),
  phone_number: z.string().min(10),
  address: z.string().min(5),
  tax_id: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  verification_doc: z.string().url(),
  payment_receipt: z.string().url(),
  opening_hours: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Server-side validation
    const validatedData = registrationSchema.parse(body);

    // Forward to Django Backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${backendUrl}/pharmacies/apply/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('API Route Error:', error);
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
  }
}
