'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Key, FileEdit, PlayCircle } from 'lucide-react';

export function Instructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">How to Use Xero Query Tool</CardTitle>
              <CardDescription>Quick guide to get started</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6 pt-0">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Create Custom Connection
                </h3>
              </div>
              <div className="text-sm space-y-2 text-muted-foreground ml-10">
                <p className="font-medium mb-2">In the Xero Developer Portal:</p>
                <ol className="space-y-1.5">
                  <li>1. Go to <a href="https://developer.xero.com/app/manage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">developer.xero.com</a></li>
                  <li>2. Click "New app"</li>
                  <li>3. Enter an app name (e.g., "My Query Tool")</li>
                  <li>4. Select <strong>"Custom connection"</strong> as app type</li>
                  <li>5. Add your company/organization</li>
                  <li>6. Save and get your credentials:</li>
                  <li className="ml-4">• <strong>Client ID</strong></li>
                  <li className="ml-4">• <strong>Client Secret</strong></li>
                </ol>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Keep your Client Secret secure. Never share it publicly or commit it to version control.
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Run Queries
                </h3>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground ml-10">
                <li>• Select a query scenario from the dropdown</li>
                <li>• Fill in any required parameters (dates, ranges, etc.)</li>
                <li>• Click "Execute Query"</li>
                <li>• View results in the table below</li>
                <li>• Sort columns by clicking headers</li>
                <li>• Export data as CSV for analysis</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Customize Scenarios
                </h3>
              </div>
              <div className="text-sm space-y-2 text-muted-foreground ml-10">
                <p>To add or edit query scenarios:</p>
                <ol className="space-y-1">
                  <li>• Edit <code className="bg-muted px-1 py-0.5 rounded text-xs">public/scenarios.json</code></li>
                  <li>• Add new scenarios with endpoint, parameters, and filters</li>
                  <li>• Follow the existing format</li>
                  <li>• Reload the page to see changes</li>
                </ol>
                <p className="mt-2 text-xs">See <a href="https://developer.xero.com/documentation/api/api-overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xero API Docs</a> for available endpoints.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span>💡</span> Pro Tips
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your credentials are only used for the current session - never stored permanently</li>
              <li>• Authentication tokens are fetched automatically using the client_credentials flow</li>
              <li>• Use the CSV export to analyze data in Excel or Google Sheets</li>
              <li>• Each scenario can be customized in <code className="bg-muted px-1 py-0.5 rounded text-xs">public/scenarios.json</code></li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
