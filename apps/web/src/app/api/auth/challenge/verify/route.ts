import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.phone || '+237699123456';
    const portal = body.portal || 'CUSTOMER';

    const userObj = {
      phone,
      whatsappPhone: phone,
      callPhone: body.callPhone || phone,
      role: portal,
      firstName: portal === 'CUSTOMER' ? 'Marie' : portal === 'DISTRIBUTOR' ? 'Dépôt Partenaire' : 'Paul',
      lastName: portal === 'CUSTOMER' ? 'Tchouassi' : portal === 'COURIER' ? 'Mouto' : 'PLEINGAZ',
      loyaltyPoints: 120,
    };

    const token = `jwt_verified_${Date.now()}`;
    const response = NextResponse.json({
      accessToken: token,
      portal,
      user: userObj,
    });

    response.cookies.set('pleingaz_session', encodeURIComponent(JSON.stringify(userObj)), {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Code erroné ou expiré' }, { status: 400 });
  }
}
