'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Play, Loader2, AlertCircle } from 'lucide-react';
import { Scenario, ScenarioParameter } from '@/lib/types';
import { ResultsTable } from '@/components/results-table';
import { Instructions } from '@/components/instructions';

export default function HomePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/scenarios.json')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch((err) => console.error('Failed to load scenarios:', err));
  }, []);

  const handleScenarioChange = (scenarioId: string) => {
    const scenario = scenarios?.find((s) => s?.id === scenarioId);
    setSelectedScenario(scenario ?? null);
    setParameters({});
    setResults(null);
    setError(null);
  };

  const handleParameterChange = (name: string, value: string) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  const executeQuery = async () => {
    if (!clientId || !clientSecret) {
      setError('Please provide both Client ID and Client Secret');
      return;
    }

    if (!selectedScenario) {
      setError('Please select a scenario');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const queryParams: Record<string, string> = {};

      selectedScenario?.parameters?.forEach((param) => {
        if (param?.type === 'hidden') {
          queryParams[param?.name] = param?.value ?? '';
        } else if (param?.type === 'select' && param?.name === 'dateRange') {
          const days = parseInt(parameters?.[param?.name] ?? param?.default ?? '30');
          const date = new Date();
          date.setDate(date.getDate() - days);
          const formattedDate = date.toISOString().split('T')?.[0];
          queryParams['where'] = `Date >= DateTime.Parse("${formattedDate}")`;
        } else if (param?.type === 'date') {
          const value = parameters?.[param?.name];
          if (value) {
            if (param?.name === 'fromDate') {
              queryParams['where'] = queryParams?.['where']
                ? `${queryParams?.['where']} AND Date >= DateTime.Parse("${value}")`
                : `Date >= DateTime.Parse("${value}")`;
            } else if (param?.name === 'toDate') {
              queryParams['where'] = queryParams?.['where']
                ? `${queryParams?.['where']} AND Date <= DateTime.Parse("${value}")`
                : `Date <= DateTime.Parse("${value}")`;
            }
          }
        } else {
          const value = parameters?.[param?.name];
          if (value) {
            queryParams[param?.name] = value;
          }
        }
      });

      // Fetch all bank accounts first if scenario requires it
      let allBankAccounts: any[] = [];
      if (selectedScenario?.fetchAllAccounts && selectedScenario?.accountsEndpoint) {
        const accountsResponse = await fetch('/api/xero-query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            clientSecret,
            endpoint: selectedScenario.accountsEndpoint,
            parameters: {
              where: 'Type=="BANK"',
            },
          }),
        });

        const accountsData = await accountsResponse.json();
        if (accountsResponse?.ok) {
          const accountsKey = Object.keys(accountsData ?? {})?.find(
            (key) => Array.isArray(accountsData?.[key]) && key !== 'Errors'
          );
          allBankAccounts = accountsKey ? accountsData[accountsKey] : [];
        }
      }

      const response = await fetch('/api/xero-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          endpoint: selectedScenario?.endpoint,
          parameters: queryParams,
        }),
      });

      const data = await response.json();

      if (!response?.ok) {
        throw new Error(data?.error ?? 'Failed to execute query');
      }

      const responseKey = Object.keys(data ?? {})?.find(
        (key) => Array.isArray(data?.[key]) && key !== 'Errors'
      );
      let resultData = responseKey ? data?.[responseKey] : [];

      // Aggregate by bank account if scenario requires it
      if (selectedScenario?.aggregateByAccount && Array.isArray(resultData)) {
        const accountMap = new Map<string, { count: number; balance: number }>();
        
        // Initialize all bank accounts with 0 count and balance
        if (allBankAccounts.length > 0) {
          allBankAccounts.forEach((account: any) => {
            const accountName = account?.Name || account?.Code || 'Unknown Account';
            accountMap.set(accountName, { count: 0, balance: 0 });
          });
        }
        
        // Add transaction data to the accounts
        resultData.forEach((transaction: any) => {
          const accountName = transaction?.BankAccount?.Name || 'Unknown Account';
          const amount = parseFloat(transaction?.Total) || 0;
          
          if (accountMap.has(accountName)) {
            const existing = accountMap.get(accountName)!;
            existing.count += 1;
            existing.balance += amount;
          } else {
            // Account not in the bank accounts list, add it anyway
            accountMap.set(accountName, { count: 1, balance: amount });
          }
        });

        // Get user's locale for currency formatting
        const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-GB';
        
        // Convert to array format for display with proper formatting
        resultData = Array.from(accountMap.entries()).map(([account, data]) => ({
          'Bank Account': account,
          'Count of Unreconciled': data.count, // Integer - no decimals
          'Balance on Xero': new Intl.NumberFormat(userLocale, {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(data.balance)
        }));
      }

      setResults(resultData);
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred while executing the query');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
              <Database className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Xero Query Tool
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Execute powerful Xero API queries using your Custom Connection credentials. Export results to CSV for analysis.
          </p>
        </div>

        <Instructions />

        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b">
            <CardTitle className="text-2xl">Query Configuration</CardTitle>
            <CardDescription>Configure your query parameters and execute</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-base font-semibold">
                  Client ID *
                </Label>
                <Input
                  id="clientId"
                  type="text"
                  placeholder="Your Custom Connection Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e?.target?.value ?? '')}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  From your Xero Custom Connection app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="text-base font-semibold">
                  Client Secret *
                </Label>
                <Input
                  id="clientSecret"
                  type="password"
                  placeholder="Your Custom Connection Client Secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e?.target?.value ?? '')}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Keep this secure - never share publicly
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario" className="text-base font-semibold">
                Query Scenario *
              </Label>
              <Select onValueChange={handleScenarioChange}>
                <SelectTrigger id="scenario" className="w-full">
                  <SelectValue placeholder="Select a query scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios?.map((scenario) => (
                    <SelectItem key={scenario?.id} value={scenario?.id ?? ''}>
                      <div>
                        <div className="font-semibold">{scenario?.name}</div>
                        <div className="text-xs text-muted-foreground">{scenario?.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScenario?.parameters
              ?.filter((param) => param?.type !== 'hidden')
              ?.map((param) => (
                <div key={param?.name} className="space-y-2">
                  <Label htmlFor={param?.name} className="text-base font-semibold">
                    {param?.label ?? param?.name} {param?.required ? '*' : ''}
                  </Label>
                  {param?.type === 'select' ? (
                    <Select
                      onValueChange={(value) => handleParameterChange(param?.name, value)}
                      defaultValue={param?.default}
                    >
                      <SelectTrigger id={param?.name}>
                        <SelectValue placeholder={`Select ${param?.label ?? param?.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {param?.options?.map((option) => (
                          <SelectItem key={option?.value} value={option?.value ?? ''}>
                            {option?.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param?.type === 'date' ? (
                    <Input
                      id={param?.name}
                      type="date"
                      value={parameters?.[param?.name] ?? ''}
                      onChange={(e) => handleParameterChange(param?.name, e?.target?.value ?? '')}
                    />
                  ) : (
                    <Input
                      id={param?.name}
                      type="text"
                      placeholder={param?.label ?? param?.name}
                      value={parameters?.[param?.name] ?? ''}
                      onChange={(e) => handleParameterChange(param?.name, e?.target?.value ?? '')}
                    />
                  )}
                </div>
              ))}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              </div>
            )}

            <Button
              onClick={executeQuery}
              disabled={!clientId || !clientSecret || !selectedScenario || isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Executing Query...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Execute Query
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-b">
              <CardTitle className="text-2xl">Query Results</CardTitle>
              <CardDescription>
                {selectedScenario?.name ?? 'Results'} - Click column headers to sort
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResultsTable data={results} scenarioName={selectedScenario?.name} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
