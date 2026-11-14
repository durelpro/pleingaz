import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/pleingaz_session=([^;]+)/);
  if (match) {
    try {
      const user = JSON.parse(decodeURIComponent(match[1]));
      return NextResponse.json({ user });
    } catch {
      // fallback
    }
  }

  return NextResponse.json({
    user: {
      phone: '+237699123456',
      role: 'CUSTOMER',
      firstName: 'Marie',
      lastName: 'Tchouassi',
      loyaltyPoints: 120,
    },
  });
}
