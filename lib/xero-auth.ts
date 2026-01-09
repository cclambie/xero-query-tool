// Xero Authentication using Custom Connection (client_credentials)

interface XeroTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface XeroConnection {
  id: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
}

/**
 * Get a valid Xero access token using client_credentials grant
 * @param clientId - The Xero Custom Connection Client ID
 * @param clientSecret - The Xero Custom Connection Client Secret
 */
export async function getXeroAccessToken(
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; tenantId: string }> {
  if (!clientId || !clientSecret) {
    throw new Error('Client ID and Client Secret are required.');
  }

  try {
    // Step 1: Get access token using client_credentials
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData: XeroTokenResponse = await tokenResponse.json();

    // Step 2: Get tenant ID from connections endpoint
    const connectionsResponse = await fetch('https://api.xero.com/connections', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!connectionsResponse.ok) {
      const errorText = await connectionsResponse.text();
      throw new Error(`Failed to get connections: ${connectionsResponse.status} - ${errorText}`);
    }

    const connections: XeroConnection[] = await connectionsResponse.json();

    if (connections.length === 0) {
      throw new Error('No Xero organizations found. Please ensure your Custom Connection has access to at least one organization.');
    }

    // Use the first connection (typically there's only one for Custom Connections)
    const tenantId = connections[0].tenantId;

    return {
      accessToken: tokenData.access_token,
      tenantId: tenantId
    };
  } catch (error) {
    console.error('Xero authentication error:', error);
    throw error;
  }
}
