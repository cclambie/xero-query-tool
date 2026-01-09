import { NextRequest, NextResponse } from 'next/server';
import { getXeroAccessToken } from '@/lib/xero-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientSecret, endpoint, parameters } = body ?? {};

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      );
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Get access token and tenant ID using provided credentials
    const { accessToken, tenantId } = await getXeroAccessToken(clientId, clientSecret);

    const queryParams = new URLSearchParams();
    Object.entries(parameters ?? {})?.forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });

    const url = queryParams?.toString()
      ? `${endpoint}?${queryParams?.toString()}`
      : endpoint;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xero-tenant-id': tenantId,
      },
    });

    if (!response?.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: `Xero API error: ${response?.status} ${response?.statusText}`,
          details: errorText 
        },
        { status: response?.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error querying Xero API:', error);
    return NextResponse.json(
      { error: 'Failed to query Xero API', details: error?.message },
      { status: 500 }
    );
  }
}
