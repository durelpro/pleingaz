import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.whatsappPhone || body.phone || '+237699123456';
    const callPhone = body.callPhone || phone;
    const firstName = body.firstName || 'Client';
    const lastName = body.lastName || 'PLEINGAZ';

    const userObj = {
      phone,
      whatsappPhone: phone,
      callPhone,
      role: 'CUSTOMER',
      firstName,
      lastName,
      city: body.city || 'Douala',
      neighborhood: body.neighborhood || 'Akwa',
      loyaltyPoints: 100,
    };

    const token = `jwt_reg_${Date.now()}`;
    const response = NextResponse.json({
      accessToken: token,
      user: userObj,
      message: 'Compte créé avec succès',
    });

    response.cookies.set('pleingaz_session', encodeURIComponent(JSON.stringify(userObj)), {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Erreur lors de l'enregistrement du compte" }, { status: 400 });
  }
}
