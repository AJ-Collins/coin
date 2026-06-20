export interface RegisterInput {
  email: string;
  password: string;
  referrerId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AccountDTO {
  id: string;
  type: 'DEMO' | 'REAL';
  balance: number;
  currency: string;
  createdAt: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  role: string;
  referralRate: number;
  kycStatus: string;
  idDocument: string | null;
  createdAt: Date;
  accounts: AccountDTO[];
}

export interface AuthResponse {
  user?: UserDTO;
  token?: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface AccountBalanceDTO {
  balance: number;
  currency: string;
}