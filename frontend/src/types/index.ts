export type UserRole = "user" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  // add other fields the backend returns (name, plan, etc.)
}

export interface ExchangeAccount {
  id: number;
  name: string;
  exchange: string;
  apiKey: string;
  isPaper: boolean;
  createdAt: string;
}

export interface Bot {
  id: number;
  name: string;
  template: string;
  status: "running" | "stopped";
  settings: string;
  baseCurrency: string;
  quoteCurrency: string;
  exchangeAccountId: number;
  exchangeAccount?: ExchangeAccount;
  orders?: Order[];
  logs?: BotLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  botId: number;
  exchangeOrderId?: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  status: "pending" | "filled" | "cancelled";
  price?: number;
  quantity: number;
  filledQty: number;
  symbol: string;
  createdAt: string;
}

export interface BotLog {
  id: number;
  botId: number;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  sparkline: number[]; // array of recent prices for the mini chart
}

export interface MarketSummary {
  totalVolume: number;
  topGainer: MarketTicker;
  topLoser: MarketTicker;
}