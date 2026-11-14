import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    allowed: true,
    bottlesRemaining: 4,
    limit: 5,
    consumedIn30Days: 1,
    onlineOrdersCount: 1,
    counterSalesCount: 0,
    windowStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date().toISOString(),
  });
}
