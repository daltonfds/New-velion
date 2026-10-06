export type UserRole = "admin" | "seller" | "supplier";

export type ProductStatus = "draft" | "active" | "inactive";

export type CommissionType = "percentual" | "fixo";

export type Currency = "ZAR" | "MZN";
export type SupplierCountry = "ZA" | "CN";
export type SupplierCostCurrency = "ZAR" | "CNY";

export interface Profile {
  id: string;
  nome_completo: string | null;
  pais: "ZA" | "MZ" | null;
  telefone: string | null;
  role: UserRole;
  kyc_status: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  categoria_id: string | null;
  subcategoria_id: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: Currency;
  comissao_tipo: CommissionType;
  comissao_valor: number;
  fotos: string[];
  video_url: string | null;
  checkout_url: string | null;
  estoque: number | null;
  ativo: boolean;
  destaque: boolean;
  novo: boolean;
  avaliacao_media: number;
  total_avaliacoes: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  supplier_status?: string | null;
  pricing_mode?: "fixed" | "custom";
  custom_pricing_floor_zar?: number | null;
  supplier_min_selling_price?: number | null;
  supplier_suggested_price?: number | null;
  supplier_commission_rate?: number | null;
  supplier_country_code?: "ZA" | "CN" | null;
  supplier_cost_currency?: "ZAR" | "CNY" | null;
  supplier_cost_amount?: number | null;
  supplier_fx_rate_to_zar?: number | null;
  supplier_fx_rate_captured_at?: string | null;
  supplier_origin_shipping_cost?: number | null;
  supplier_origin_shipping_currency?: "ZAR" | "CNY" | null;
  reserved_estoque?: number | null;
}
