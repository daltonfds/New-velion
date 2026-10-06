export type IntegrationStatus = "active" | "suspended" | "revoked";

export type IntegrationOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "failed"
  | "returned";

export type IntegrationProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  currency: "ZAR";
  price: number;
  promotional_price: number | null;
  stock: number;
  available: boolean;
  images: string[];
  video_url: string | null;
  category_id: string;
  category_name: string | null;
  benefits: string[];
  shipping: {
    supported: boolean;
  };
};

export type IntegrationOrderItem = {
  id: string;
  external_product_id: string;
  newvelion_product_id: string;
  quantity: number;
  sale_price: number;
  currency: "ZAR";
  product_name: string;
};

export type IntegrationOrder = {
  id: string;
  external_order_id: string;
  status: IntegrationOrderStatus;
  currency: "ZAR";
  subtotal: number;
  shipping_amount: number;
  total: number;
  customer: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
  items: IntegrationOrderItem[];
};
