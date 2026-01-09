export interface ScenarioParameter {
  name: string;
  type: 'text' | 'date' | 'select' | 'hidden';
  label?: string;
  required?: boolean;
  value?: string;
  options?: { label: string; value: string }[];
  default?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  parameters?: ScenarioParameter[];
  displayFields?: string[];
  aggregateByAccount?: boolean;
  fetchAllAccounts?: boolean;
  accountsEndpoint?: string;
}

export interface QueryResult {
  data: any[];
  fields: string[];
  count: number;
}

export interface XeroApiResponse {
  Id?: string;
  Status?: string;
  ProviderName?: string;
  DateTimeUTC?: string;
  [key: string]: any;
}
