import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.phone || '+237699123456';
    const code = `PG-${Math.floor(1000 + Math.random() * 9000)}`;
    const officialNumber = '237657696567';
    const message = encodeURIComponent(`CONNEXION PLEINGAZ : ${code}`);
    const whatsappLink = `https://wa.me/${officialNumber}?text=${message}`;

    return NextResponse.json({
      challengeId: `chal-${Date.now()}`,
      code,
      phone,
      whatsappLink,
      whatsappUrl: whatsappLink,
      officialNumber: '+237657696567',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { message: "Erreur lors de l'initiation du défi" },
      { status: 500 }
    );
  }
}
