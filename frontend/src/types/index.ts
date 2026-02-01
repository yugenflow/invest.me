export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  preferred_currency: string;
  onboarding_completed: boolean;
  created_at: string;
  is_pro?: boolean;
}

export interface AssetClass {
  code: string;
  name: string;
  category: string;
  fields_schema: {
    required: string[];
    optional: string[];
  };
}

export interface Holding {
  id: string;
  user_id: string;
  asset_class_code: string;
  symbol?: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  buy_currency: string;
  exchange?: string;
  buy_date?: string;
  maturity_date?: string;
  interest_rate?: number;
  institution?: string;
  sebi_category?: string;
  is_active: boolean;
  current_value?: number;
  gain_loss?: number;
  gain_loss_pct?: number;
  day_change_pct?: number;
  value?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  holding_id?: string;
  type: "buy" | "sell" | "dividend";
  symbol?: string;
  quantity: number;
  price: number;
  currency: string;
  total_amount: number;
  fees: number;
  transaction_date?: string;
  broker?: string;
}

export interface RiskProfile {
  id: string;
  version: number;
  age?: number;
  monthly_income?: number;
  savings?: number;
  liabilities?: number;
  scenario_responses?: Record<string, number>;
  risk_score?: number;
  risk_persona?: string;
  is_current: boolean;
}

export interface Goal {
  id: string;
  goal_name: string;
  target_amount: number;
  horizon_years: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_gain_loss: number;
  total_gain_loss_pct: number;
  day_change: number;
  day_change_pct: number;
}

export interface AllocationItem {
  asset_class: string;
  asset_class_name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface PerformanceData {
  portfolio: PerformancePoint[];
  by_category: Record<string, PerformancePoint[]>;
  benchmarks: Record<string, PerformancePoint[]>;
}

export interface DashboardData {
  summary: PortfolioSummary;
  allocation: AllocationItem[];
  performance: PerformanceData;
  top_holdings: Holding[];
  all_holdings: Holding[];
}

export interface CsvPreviewRow {
  symbol: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  asset_class_code: string;
  [key: string]: string | number;
}

export interface ImportRow {
  symbol: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  asset_class_code: string;
  exchange?: string;
  buy_currency: string;
  interest_rate?: number;
  maturity_date?: string;
  institution?: string;
  buy_date?: string;
  sebi_category?: string;
  amount_invested?: number;
  resolved_symbol?: string;
  resolved_isin?: string;
  matched_name?: string;
}

export interface MfResolveResult {
  fund_name: string;
  resolved: boolean;
  yf_ticker?: string;
  isin?: string;
  matched_name?: string;
}

export interface CsvUploadResult {
  rows: ImportRow[];
  count: number;
  detected_broker: string | null;
  confidence: number;
  headers: string[] | null;
}

export interface ColumnMapping {
  [ourField: string]: string;
}

export interface FileGroup {
  fileName: string;
  broker: string | null;
  rows: ImportRow[];
  error?: string;
  excluded: boolean;
}

// --- Duplicate detection types ---

export interface ExistingHoldingInfo {
  id: string;
  symbol?: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  asset_class_code: string;
  buy_currency: string;
}

export interface DuplicateMatch {
  row_index: number;
  incoming_symbol?: string;
  incoming_name?: string;
  incoming_quantity: number;
  incoming_avg_price: number;
  existing: ExistingHoldingInfo;
  merged_quantity: number;
  merged_avg_price: number;
}

export interface DuplicateCheckResult {
  duplicates: DuplicateMatch[];
  clean_count: number;
}

export type ConflictAction = "merge" | "skip" | "replace";

export interface RowAction {
  action: "create" | "merge" | "replace" | "skip";
  existing_holding_id?: string;
}

export interface DuplicateGroup {
  id: string;
  symbol?: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  asset_class_code: string;
  buy_currency: string;
  created_at?: string;
}
