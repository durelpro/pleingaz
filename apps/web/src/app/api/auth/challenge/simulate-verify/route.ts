import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    verified: true,
    message: 'Défi validé avec succès (simulation webhook WhatsApp)',
  });
}
