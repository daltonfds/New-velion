import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  User,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";

export type DashboardRole = "seller" | "producer" | "admin";

export interface MenuItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export const menuConfig: Record<DashboardRole, MenuGroup[]> = {
  seller: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/seller",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Commerce",
      items: [
        {
          label: "Marketplace",
          href: "/dashboard/seller/marketplace",
          icon: ShoppingBag,
        },
        {
          label: "Store",
          href: "/dashboard/seller/store",
          icon: Store,
        },
        {
          label: "Products",
          href: "/dashboard/seller/products",
          icon: Package,
        },
        {
          label: "Orders",
          href: "/dashboard/seller/orders",
          icon: ShoppingCart,
        },
        {
          label: "Inventory",
          href: "/dashboard/seller/inventory",
          icon: Boxes,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          label: "Wallet",
          href: "/dashboard/seller/finance/wallet",
          icon: Wallet,
        },
        {
          label: "Withdraw",
          href: "/dashboard/seller/withdraw",
          icon: CircleDollarSign,
        },
        {
          label: "Settlements",
          href: "/dashboard/seller/finance/settlements",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          label: "Returns & Disputes",
          href: "/dashboard/seller/returns",
          icon: RotateCcw,
        },
        {
          label: "Services",
          href: "/dashboard/seller/services",
          icon: Wrench,
        },
        {
          label: "Integrations",
          href: "/dashboard/seller/integrations",
          icon: Settings,
        },
      ],
    },
    {
      items: [
        {
          label: "Profile",
          href: "/dashboard/seller/profile",
          icon: User,
        },
      ],
    },
  ],

  producer: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/producer",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Products",
      items: [
        {
          label: "Products",
          href: "/dashboard/producer/products",
          icon: Package,
        },
        {
          label: "Inventory",
          href: "/dashboard/producer/inventory",
          icon: Boxes,
        },
        {
          label: "Warehouse",
          href: "/dashboard/producer/warehouse",
          icon: Warehouse,
        },
        {
          label: "Fulfillment",
          href: "/dashboard/producer/fulfillment",
          icon: Truck,
        },
        {
          label: "Orders",
          href: "/dashboard/producer/orders",
          icon: ShoppingCart,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          label: "Wallet",
          href: "/dashboard/producer/finance/wallet",
          icon: Wallet,
        },
        {
          label: "Settlements",
          href: "/dashboard/producer/finance/settlements",
          icon: ClipboardList,
        },
        {
          label: "Withdrawals",
          href: "/dashboard/producer/finance/withdrawals",
          icon: CircleDollarSign,
        },
        {
          label: "Finance",
          href: "/dashboard/producer/finance",
          icon: BarChart3,
        },
      ],
    },
    {
      items: [
        {
          label: "Profile",
          href: "/dashboard/producer/profile",
          icon: User,
        },
      ],
    },
  ],

  admin: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Commerce",
      items: [
        {
          label: "Marketplace",
          href: "/dashboard/admin/marketplace",
          icon: ShoppingBag,
        },
        {
          label: "Products",
          href: "/dashboard/admin/products",
          icon: Package,
        },
        {
          label: "Orders",
          href: "/dashboard/admin/operations",
          icon: ShoppingCart,
        },
        {
          label: "Users",
          href: "/dashboard/admin/users",
          icon: Users,
        },
        {
          label: "Requests",
          href: "/dashboard/admin/requests",
          icon: FileText,
        },
        {
          label: "KYC",
          href: "/dashboard/admin/kyc",
          icon: User,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          label: "Payments",
          href: "/dashboard/admin/finance/payments",
          icon: Wallet,
        },
        {
          label: "Withdrawals",
          href: "/dashboard/admin/finance/withdrawals",
          icon: CircleDollarSign,
        },
        {
          label: "Settlements",
          href: "/dashboard/admin/finance/settlements",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          label: "Logistics",
          href: "/dashboard/admin/logistics",
          icon: MapPin,
        },
        {
          label: "Returns & Disputes",
          href: "/dashboard/admin/disputes",
          icon: RotateCcw,
        },
        {
          label: "Analytics",
          href: "/dashboard/admin/analytics",
          icon: BarChart3,
        },
      ],
    },
  ],
};