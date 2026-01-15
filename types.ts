
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
  neighborhood?: string;
  city?: string;
  observations?: string;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  salePrice: number;
  margin: number;
  size: string;
  material: string;
  description: string;
}

export interface Supply {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  provider: string;
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
  date: string;
  archived?: boolean;
}

export interface FinancialEntry {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: string;
}

export interface SystemSettings {
  companyName: string;
  companyTagline: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  estimateValidityDays: number;
  defaultFooterNote: string;
}
