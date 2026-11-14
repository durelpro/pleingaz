import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'notice-1',
      title: 'Approvisionnement Douala & Yaoundé',
      content: 'Tous les dépôts partenaires sont approvisionnés en bouteilles 12.5 kg homologuées. Livraison garantie en moins de 45 minutes.',
      category: 'INFO',
      targetRole: 'ALL',
      targetCity: 'ALL',
      isActive: true,
      requiresAck: true,
      createdAt: new Date().toISOString(),
    },
  ]);
}
