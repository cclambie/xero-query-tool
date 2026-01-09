# Xero Query Tool

A simple, focused web application for querying Xero accounting data and exporting results to CSV. Built for Excel geeks who need direct API access without writing code every time.

## Features

- ✅ **Pre-configured Query Scenarios**: Unpaid invoices, recent payments, unreconciled transactions, and more
- ✅ **Direct Xero API Access**: Fast, efficient queries using Xero's API v2.0
- ✅ **CSV Export**: Every result can be exported for further analysis in Excel
- ✅ **Aggregated Views**: Automatic grouping and summing (e.g., by bank account)
- ✅ **Session-Based Security**: No database, no permanent credential storage
- ✅ **Locale-Aware Formatting**: Currency and numbers adapt to your regional settings
- ✅ **Customizable**: Add new queries by editing a JSON file—no code changes needed

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **API**: Xero API v2.0 (OAuth2 client_credentials flow)
- **Package Manager**: Yarn

## Prerequisites

Before you begin, ensure you have:

1. **Node.js**: Version 18 or higher
2. **Yarn**: Version 1.22 or higher (or you can use npm)
3. **Xero Custom Connection**:
   - Go to [developer.xero.com](https://developer.xero.com/app/manage)
   - Create a new app and select "Custom connection"
   - Add your organization
   - Copy your **Client ID** and **Client Secret**

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cclambie/xero-query-tool.git
   cd xero-query-tool
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   yarn dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Running Queries

1. **Enter Credentials**:
   - Input your Xero Custom Connection **Client ID**
   - Input your Xero Custom Connection **Client Secret**
   - These are session-only and never stored permanently

2. **Select a Scenario**:
   - Choose from pre-configured queries like "Unpaid Invoices" or "Recent Payments"
   - Set any required parameters (date ranges, etc.)

3. **Execute Query**:
   - Click "Execute Query"
   - Results appear in a sortable table

4. **Export to CSV**:
   - Click "Export to CSV" to download results
   - Open in Excel for further analysis

### Customizing Queries

All query scenarios are defined in `public/scenarios.json`. To add a new query:

1. Open `public/scenarios.json`
2. Add a new scenario object:

```json
{
  "id": "your-query-id",
  "name": "Display Name",
  "description": "What this query does",
  "endpoint": "https://api.xero.com/api.xro/2.0/ResourceName",
  "method": "GET",
  "parameters": [
    {
      "name": "where",
      "type": "hidden",
      "value": "YourFilterExpression"
    }
  ],
  "displayFields": ["Field1", "Field2", "Field3"]
}
```

3. Save the file
4. Refresh your browser—changes take effect immediately

For detailed configuration instructions, see the [Query Configuration Guide](../documents/QUERY_CONFIGURATION.md).

## Available Query Scenarios

### 1. Unpaid Invoices
Get all authorised invoices with outstanding amounts.

**Shows**: Invoice Number, Contact Name, Date, Due Date, Total, Amount Due, Status

### 2. Overdue Invoices
Get invoices past their due date with amounts owed.

**Shows**: Invoice Number, Contact Name, Date, Due Date, Total, Amount Due, Status

### 3. Recent Payments
Get payments received in the last 30/60/90 days.

**Shows**: Date, Payment Type, Amount, Reference, Status, Invoice Number

### 4. Bank Transactions by Date Range
Get bank transactions filtered by custom date range.

**Shows**: Date, Type, Contact Name, Reference, Total, Status

### 5. Unreconciled Bank Transactions
Summary of unreconciled transactions grouped by bank account.

**Shows**: Bank Account, Count of Unreconciled, Balance on Xero

## Project Structure

```
xero-query-tool/
├── app/
│   ├── api/
│   │   └── xero-query/       # API route for Xero queries
│   ├── layout.tsx            # Root layout with theme provider
│   ├── page.tsx              # Main application page
│   └── globals.css           # Global styles
├── components/
│   ├── instructions.tsx      # Expandable usage instructions
│   ├── results-table.tsx     # Query results display + CSV export
│   ├── theme-provider.tsx    # Light/dark mode support
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── csv-export.ts         # CSV export utility
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Utility functions
│   └── xero-auth.ts          # Xero OAuth authentication
├── public/
│   ├── scenarios.json        # Query scenario definitions
│   ├── favicon.svg           # Site icon
│   └── og-image.png          # Social sharing image
├── .env.example              # Environment variable template
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## API Authentication

This tool uses Xero's **Custom Connection** OAuth2 flow with the `client_credentials` grant type:

1. User enters Client ID and Client Secret (session-only)
2. Backend requests access token from Xero
3. Token is cached with 5-minute expiry buffer
4. All API requests use the access token
5. First organization is automatically selected as tenant

**Security Notes**:
- Credentials are never stored in a database
- Tokens are cached only for the duration of the session
- All authentication happens server-side
- Client Secret is never exposed to the browser

## Development

### Running Tests

Currently, testing is manual. Test by:
1. Running queries against your Xero organization
2. Verifying data accuracy
3. Testing CSV export functionality

### Building for Production

```bash
yarn build
```

This creates an optimized production build in `.next/`.

### Starting Production Server

```bash
yarn start
```

## Deployment

This Next.js application can be deployed to:

- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Configure build command and output directory
- **Self-hosted**: Use `yarn build && yarn start`
- **Docker**: Create Dockerfile with Node.js and Next.js

### Environment Variables for Production

Set these in your hosting platform:

```
NEXTAUTH_URL=https://yourdomain.com
```

## Troubleshooting

### "Invalid client_id or client_secret"
- Verify credentials are correct in your Xero developer console
- Ensure you're using a **Custom Connection** (not OAuth 2.0)
- Check that your organization is added to the app

### "No data returned"
- Check your query filters in `scenarios.json`
- Verify the Xero endpoint is correct
- Ensure your organization has data matching the query

### Hydration Errors
- These have been resolved in the latest version
- If you encounter them, ensure you're using consistent date/number formatting

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check the [Query Configuration Guide](../documents/QUERY_CONFIGURATION.md)
- Review [Xero API documentation](https://developer.xero.com/documentation/api/api-overview)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Xero API v2.0](https://developer.xero.com/documentation/api/api-overview)

---

**Built by an Excel geek who got tired of clicking.** 🧮
