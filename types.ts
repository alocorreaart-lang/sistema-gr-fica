
export enum OrderStatus {
  OPEN = 'ABERTO',
  ART = 'CRIANDO ARTE',
  PRODUCTION = 'EM PRODUÇÃO',
  SHIPPING = 'EM TRANSPORTE',
  COMPLETED = 'FINALIZADO'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  responsible?: string;
  address?: string;
  addressNumber?: string;
  neighborhood?: string;
  city?: string;
  observations?: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  basePrice: number;
  salePrice: number;
  margin: number;
  unit?: string;
  size: string;
  material: string;
  description: string;
}

export interface Supply {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  provider: string;
  providerPhone?: string;
  purchaseDate?: string;
  observations?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  status: OrderStatus;
  total: number;
  entry: number; 
  entryMethod?: string; 
  date: string;
  deliveryDate?: string;
  archived?: boolean;
  items?: any[];
  installmentsCount?: number;
  installmentValue?: number;
  firstInstallmentDate?: string;
  installmentIntervalDays?: number;
  paidInstallmentIndices?: number[];
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  type: 'BANK' | 'CASH';
  color?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

export interface FinancialEntry {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: string;
  accountId: string; 
  method?: string; 
  status?: 'PAID' | 'PENDING';
  isRecurring?: boolean;
  recurrencePeriod?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
}

export interface SystemSettings {
  companyName: string;
  companyTagline: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  pixKey: string;
  pdfIntroText: string;
  pdfObservations: string; // Novo campo
  primaryColor: string;
  estimateValidityDays: number;
  defaultFooterNote: string;
  accounts: Account[]; 
  paymentMethods: PaymentMethod[]; 
}
