import { NextResponse } from 'next/server';

export async function GET() {
  // Mock blockchain status data
  const mockData = {
    latest_block_number: 1234567 + Math.floor(Math.random() * 100),
    peer_count: 3 + Math.floor(Math.random() * 3),
    syncing: false,
    gas_price: 1000000000,
    network_id: '1337',
    healthy: true,
  };

  return NextResponse.json(mockData);
}
