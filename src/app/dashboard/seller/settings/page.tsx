"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { protectedApi } from "@/lib/newvelion-api";

type Tab =
  | "profile"
  | "account"
  | "preferences"
  | "payment"
  | "notifications"
  | "security";

type SettingsData = {
  profile?: {
    id?: string;
    full_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    phone_e164?: string | null;
    country?: string | null;
    country_code?: string | null;
    country_calling_code?: string | null;
    whatsapp_number?: string | null;
    whatsapp_e164?: string | null;
    avatar_url?: string | null;
    preferred_language?: string | null;
    status?: string | null;
    kyc_status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  account?: {
    role?: string | null;
    status?: string | null;
    created_at?: string | null;
    primary_company_id?: string | null;
  };
  preferences?: {
    language?: string | null;
    currency?: string | null;
    email_notifications?: boolean;
    sales_alerts?: boolean;
    commission_alerts?: boolean;
    withdrawal_alerts?: boolean;
  };
  payment_methods?: PaymentMethod[];
};

type PaymentMethod = {
  id?: string;
  method?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  branch_code?: string | null;
  mobile_number?: string | null;
  destination_details?: Record<string, unknown>;
  is_default?: boolean;
  status?: string | null;
};

type SecuritySession = {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
  user_agent?: string | null;
  ip?: string | null;
};

const tabs: {
  key: Tab;
  label: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    key: "profile",
    label: "Profile",
    description: "Personal information",
    icon: UserRound,
  },
  {
    key: "account",
    label: "Account",
    description: "Password and account",
    icon: KeyRound,
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Language and currency",
    icon: Globe2,
  },
  {
    key: "payment",
    label: "Payment",
    description: "Withdrawal details",
    icon: Wallet,
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Alerts and emails",
    icon: Bell,
  },
  {
    key: "security",
    label: "Security",
    description: "Sessions and protection",
    icon: ShieldCheck,
  },
];

const paymentOptions = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "emola", label: "e-Mola" },
  { value: "paypal", label: "PayPal" },
  { value: "other", label: "Other" },
];

function moneyMethodLabel(method?: string | null) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "emola") return "e-Mola";
  if (method === "bank_transfer" || method === "bank") return "Bank Transfer";
  if (method === "paypal") return "PayPal";
  return method || "Payment method";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getInitials(name?: string | null) {
  if (!name) return "S";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function inputClassName() {
  return "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    phone_e164: "",
    country: "",
    country_code: "",
    country_calling_code: "",
    whatsapp_number: "",
    whatsapp_e164: "",
    avatar_url: "",
    preferred_language: "en",
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "ZAR",
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sales_alerts: true,
    commission_alerts: true,
    withdrawal_alerts: true,
  });

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const [payment, setPayment] = useState({
    method: "bank_transfer",
    account_name: "",
    account_number: "",
    bank_name: "",
    branch_code: "",
    mobile_number: "",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const selectedPaymentIsWallet =
    payment.method === "mpesa" || payment.method === "emola";

  const selectedPaymentLabel = moneyMethodLabel(payment.method);

  const currentPayment = useMemo(
    () =>
      settings?.payment_methods?.find((item) => item.is_default) ||
      settings?.payment_methods?.[0] ||
      null,
    [settings],
  );

  async function loadSettings() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = await protectedApi("/seller-settings/settings");

      const data = payload?.data || payload;

      setSettings(data);

      const p = data?.profile || {};
      const pref = data?.preferences || {};
      const pm =
        data?.payment_methods?.find((item: PaymentMethod) => item.is_default) ||
        data?.payment_methods?.[0] ||
        {};

      setProfile({
        full_name: p.full_name || "",
        phone_number: p.phone_number || "",
        phone_e164: p.phone_e164 || "",
        country: p.country || "",
        country_code: p.country_code || "",
        country_calling_code: p.country_calling_code || "",
        whatsapp_number: p.whatsapp_number || "",
        whatsapp_e164: p.whatsapp_e164 || "",
        avatar_url: p.avatar_url || "",
        preferred_language: p.preferred_language || "en",
      });

      setPreferences({
        language: pref.language || p.preferred_language || "en",
        currency: pref.currency || "ZAR",
      });

      setNotifications({
        email_notifications: pref.email_notifications !== false,
        sales_alerts: pref.sales_alerts !== false,
        commission_alerts: pref.commission_alerts !== false,
        withdrawal_alerts: pref.withdrawal_alerts !== false,
      });

      setPayment({
        method: pm.method || "bank_transfer",
        account_name: pm.account_name || "",
        account_number: pm.account_number || "",
        bank_name: pm.bank_name || "",
        branch_code: pm.branch_code || "",
        mobile_number: pm.mobile_number || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSecurity() {
    setSecurityLoading(true);

    try {
      const payload = await protectedApi("/seller-settings/security");
      const data = payload?.data || payload;
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load security data.",
      );
    } finally {
      setSecurityLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "security") {
      void loadSecurity();
    }
  }, [activeTab]);

  async function saveProfile() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await protectedApi("/seller-settings/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });

      setSuccess("Profile updated successfully.");
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await protectedApi("/seller-settings/preferences", {
        method: "PATCH",
        body: JSON.stringify({
          language: preferences.language,
          currency: "ZAR",
          ...notifications,
        }),
      });

      setSuccess("Preferences updated successfully.");
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function savePayment() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (selectedPaymentIsWallet) {
      if (!payment.account_name.trim() || !payment.mobile_number.trim()) {
        setError(
          `${selectedPaymentLabel} requires the account name and wallet number.`,
        );
        setSaving(false);
        return;
      }
    }

    if (!selectedPaymentIsWallet && payment.method === "bank_transfer") {
      if (
        !payment.account_name.trim() ||
        !payment.account_number.trim() ||
        !payment.bank_name.trim()
      ) {
        setError(
          "Bank Transfer requires account name, account number and bank name.",
        );
        setSaving(false);
        return;
      }
    }

    try {
      await protectedApi("/seller-settings/payment", {
        method: "PATCH",
        body: JSON.stringify({
          method: payment.method,
          account_name: payment.account_name,
          account_number: payment.account_number,
          bank_name: payment.bank_name,
          branch_code: payment.branch_code,
          mobile_number: payment.mobile_number,
        }),
      });

      setSuccess("Payment details updated successfully.");
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save payment details.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!passwords.current_password || !passwords.new_password) {
      setError("Current password and new password are required.");
      setSaving(false);
      return;
    }

    if (passwords.new_password.length < 8) {
      setError("The new password must contain at least 8 characters.");
      setSaving(false);
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setError("The new password and confirmation do not match.");
      setSaving(false);
      return;
    }

    try {
      await protectedApi("/seller-settings/password", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setSuccess("Password changed successfully.");
      await loadSecurity();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setSaving(false);
    }
  }

  function renderProfile() {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={CircleUserRound}
          title="Profile"
          description="Manage your personal and contact information."
        />

        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex items-start justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
              {getInitials(profile.full_name)}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Full name
              <input
                className={inputClassName()}
                value={profile.full_name}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    full_name: e.target.value,
                  }))
                }
                placeholder="Your full name"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Email
              <input
                className={`${inputClassName()} bg-slate-50`}
                value={settings?.profile?.email || ""}
                readOnly
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Email is managed by your account authentication.
              </span>
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Phone
              <input
                className={inputClassName()}
                value={profile.phone_number}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="+27..."
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Country
              <input
                className={inputClassName()}
                value={profile.country}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    country: e.target.value,
                  }))
                }
                placeholder="South Africa"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Country code
              <input
                className={inputClassName()}
                value={profile.country_code}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    country_code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="ZA"
                maxLength={3}
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Country calling code
              <input
                className={inputClassName()}
                value={profile.country_calling_code}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    country_calling_code: e.target.value,
                  }))
                }
                placeholder="+27"
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              WhatsApp number
              <input
                className={inputClassName()}
                value={profile.whatsapp_number}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    whatsapp_number: e.target.value,
                  }))
                }
                placeholder="+27..."
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              WhatsApp E.164
              <input
                className={inputClassName()}
                value={profile.whatsapp_e164}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    whatsapp_e164: e.target.value,
                  }))
                }
                placeholder="+27123456789"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    );
  }

  function renderAccount() {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={KeyRound}
          title="Account"
          description="Manage your account password and account status."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role
            </p>
            <p className="mt-2 font-bold capitalize text-slate-900">
              {settings?.account?.role || "Seller"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status
            </p>
            <p className="mt-2 font-bold capitalize text-emerald-600">
              {settings?.account?.status || settings?.profile?.status || "Active"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Member since
            </p>
            <p className="mt-2 font-bold text-slate-900">
              {formatDate(
                settings?.account?.created_at || settings?.profile?.created_at,
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Change password</h3>
              <p className="text-sm text-slate-500">
                Use a strong password with at least 8 characters.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {[
              ["current", "Current password", "current_password"],
              ["next", "New password", "new_password"],
              ["confirm", "Confirm new password", "confirm_password"],
            ].map(([key, label, field]) => (
              <label
                key={field}
                className="relative text-sm font-semibold text-slate-700"
              >
                {label}
                <input
                  className={`${inputClassName()} pr-12`}
                  type={
                    showPasswords[key as keyof typeof showPasswords]
                      ? "text"
                      : "password"
                  }
                  value={passwords[field as keyof typeof passwords]}
                  onChange={(e) =>
                    setPasswords((current) => ({
                      ...current,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      [key]: !current[key as keyof typeof current],
                    }))
                  }
                  className="absolute right-3 top-9 rounded-lg p-2 text-slate-400 hover:text-slate-700"
                >
                  {showPasswords[key as keyof typeof showPasswords] ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </label>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={changePassword}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
            >
              <KeyRound size={17} />
              {saving ? "Updating..." : "Change password"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderPreferences() {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Globe2}
          title="Preferences"
          description="Choose how your Seller dashboard behaves."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Language
            <select
              className={inputClassName()}
              value={preferences.language}
              onChange={(e) =>
                setPreferences((current) => ({
                  ...current,
                  language: e.target.value,
                }))
              }
            >
              <option value="en">English</option>
              <option value="pt">Portuguese</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Currency
            <input
              className={`${inputClassName()} bg-slate-50`}
              value="ZAR"
              readOnly
            />
            <span className="mt-1 block text-xs font-normal text-slate-400">
              NewVelion uses South African Rand (ZAR).
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <div className="flex gap-3">
            <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
              <Globe2 size={19} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Seller dashboard preferences</p>
              <p className="mt-1 text-sm text-slate-600">
                These preferences are stored in your Seller account and can be
                changed at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </div>
    );
  }

  function renderPayment() {
    const methods = settings?.payment_methods || [];
    const walletMethod =
      payment.method === "mpesa" ||
      payment.method === "emola" ||
      payment.method === "mobile_money";
    const bankMethod =
      payment.method === "bank_transfer" || payment.method === "bank";

    function resetPaymentForm() {
      setPayment({
        method: "bank_transfer",
        account_name: "",
        account_number: "",
        bank_name: "",
        branch_code: "",
        mobile_number: "",
      });
    }

    function editPaymentMethod(item: PaymentMethod) {
      setPayment({
        method: item.method || "bank_transfer",
        account_name: item.account_name || "",
        account_number: item.account_number || "",
        bank_name: item.bank_name || "",
        branch_code: item.branch_code || "",
        mobile_number: item.mobile_number || "",
      });
      setEditingPaymentId(item.id || null);
    }

    async function savePaymentMethod() {
      setSaving(true);
      setError("");
      setSuccess("");

      if (walletMethod) {
        if (!payment.account_name.trim() || !payment.mobile_number.trim()) {
          setError(
            `${moneyMethodLabel(payment.method)} requires Name and Number.`,
          );
          setSaving(false);
          return;
        }
      }

      if (bankMethod) {
        if (
          !payment.account_name.trim() ||
          !payment.account_number.trim() ||
          !payment.bank_name.trim()
        ) {
          setError(
            "Bank Transfer requires Account name, Account number and Bank name.",
          );
          setSaving(false);
          return;
        }
      }

      if (payment.method === "paypal" && !payment.account_name.trim()) {
        setError("PayPal requires the PayPal account email or name.");
        setSaving(false);
        return;
      }

      try {
        const body = {
          method: payment.method,
          account_name: payment.account_name,
          account_number: payment.account_number,
          bank_name: payment.bank_name,
          branch_code: payment.branch_code,
          mobile_number: payment.mobile_number,
        };

        if (editingPaymentId) {
          await protectedApi(
            `/seller-settings/payment/${editingPaymentId}`,
            {
              method: "PATCH",
              body: JSON.stringify(body),
            },
          );
          setSuccess("Payment method updated successfully.");
        } else {
          await protectedApi("/seller-settings/payment", {
            method: "POST",
            body: JSON.stringify(body),
          });
          setSuccess("Payment method added successfully.");
        }

        setEditingPaymentId(null);
        resetPaymentForm();
        await loadSettings();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save payment method.",
        );
      } finally {
        setSaving(false);
      }
    }

    async function removePaymentMethod(id?: string) {
      if (!id) return;

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        await protectedApi(`/seller-settings/payment/${id}`, {
          method: "DELETE",
        });

        if (editingPaymentId === id) {
          setEditingPaymentId(null);
          resetPaymentForm();
        }

        setSuccess("Payment method removed successfully.");
        await loadSettings();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to remove payment method.",
        );
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className="space-y-6">
        <SectionHeader
          icon={CreditCard}
          title="Payment"
          description="Manage all payment methods available for your withdrawals."
        />

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
              <Wallet size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                Multiple payment methods
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Save as many payment methods as you need. Adding a new method
                does not replace or delete existing methods. You will choose
                the payment method when requesting a withdrawal.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Saved payment methods
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {methods.length} saved method{methods.length === 1 ? "" : "s"}.
            </p>
          </div>

          {methods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Wallet className="mx-auto text-slate-300" size={34} />
              <p className="mt-3 font-bold text-slate-800">
                No payment methods saved
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first payment method below.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {methods.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        {item.method === "mpesa" ||
                        item.method === "emola" ||
                        item.method === "mobile_money" ? (
                          <Smartphone size={20} />
                        ) : (
                          <CreditCard size={20} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">
                          {moneyMethodLabel(item.method)}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.status === "disabled"
                              ? "bg-slate-100 text-slate-500"
                              : item.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.status || "active"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => editPaymentMethod(item)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void removePaymentMethod(item.id)}
                        disabled={saving}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                    {item.account_name && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Name</span>
                        <span className="text-right font-semibold text-slate-800">
                          {item.account_name}
                        </span>
                      </div>
                    )}

                    {item.mobile_number && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Number</span>
                        <span className="text-right font-semibold text-slate-800">
                          {item.mobile_number}
                        </span>
                      </div>
                    )}

                    {item.account_number && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Account</span>
                        <span className="text-right font-semibold text-slate-800">
                          {item.account_number}
                        </span>
                      </div>
                    )}

                    {item.bank_name && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Bank</span>
                        <span className="text-right font-semibold text-slate-800">
                          {item.bank_name}
                        </span>
                      </div>
                    )}

                    {item.branch_code && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Branch</span>
                        <span className="text-right font-semibold text-slate-800">
                          {item.branch_code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                {editingPaymentId
                  ? "Edit payment method"
                  : "Add payment method"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {editingPaymentId
                  ? "Update the selected payment method."
                  : "Add another payment method without removing existing ones."}
              </p>
            </div>

            {editingPaymentId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPaymentId(null);
                  resetPaymentForm();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Payment method
              <select
                className={inputClassName()}
                value={payment.method}
                onChange={(e) =>
                  setPayment((current) => ({
                    ...current,
                    method: e.target.value,
                  }))
                }
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {walletMethod ? (
              <>
                <label className="text-sm font-semibold text-slate-700">
                  Name
                  <input
                    className={inputClassName()}
                    value={payment.account_name}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        account_name: e.target.value,
                      }))
                    }
                    placeholder="Account holder name"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Number
                  <input
                    className={inputClassName()}
                    value={payment.mobile_number}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        mobile_number: e.target.value,
                      }))
                    }
                    placeholder="Wallet number"
                    inputMode="tel"
                  />
                </label>
              </>
            ) : bankMethod ? (
              <>
                <label className="text-sm font-semibold text-slate-700">
                  Account name
                  <input
                    className={inputClassName()}
                    value={payment.account_name}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        account_name: e.target.value,
                      }))
                    }
                    placeholder="Account holder"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Account number
                  <input
                    className={inputClassName()}
                    value={payment.account_number}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        account_number: e.target.value,
                      }))
                    }
                    placeholder="Account number"
                    inputMode="numeric"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Bank name
                  <input
                    className={inputClassName()}
                    value={payment.bank_name}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        bank_name: e.target.value,
                      }))
                    }
                    placeholder="Bank name"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Branch code
                  <input
                    className={inputClassName()}
                    value={payment.branch_code}
                    onChange={(e) =>
                      setPayment((current) => ({
                        ...current,
                        branch_code: e.target.value,
                      }))
                    }
                    placeholder="Branch code"
                  />
                </label>
              </>
            ) : (
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">
                {payment.method === "paypal"
                  ? "PayPal account email"
                  : "Destination details"}
                <input
                  className={inputClassName()}
                  value={payment.account_name}
                  onChange={(e) =>
                    setPayment((current) => ({
                      ...current,
                      account_name: e.target.value,
                    }))
                  }
                  placeholder={
                    payment.method === "paypal"
                      ? "PayPal email"
                      : "Account or destination"
                  }
                />
              </label>
            )}
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => void savePaymentMethod()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {editingPaymentId
                ? "Update payment method"
                : "Add payment method"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    const items = [
      {
        key: "email_notifications" as const,
        title: "Email notifications",
        description: "Receive important account and platform emails.",
        icon: Mail,
      },
      {
        key: "sales_alerts" as const,
        title: "Sales alerts",
        description: "Receive notifications when a sale is attributed to you.",
        icon: Check,
      },
      {
        key: "commission_alerts" as const,
        title: "Commission alerts",
        description: "Receive notifications about commissions generated by your sales.",
        icon: Wallet,
      },
      {
        key: "withdrawal_alerts" as const,
        title: "Withdrawal alerts",
        description: "Receive updates about withdrawal requests and their status.",
        icon: Bell,
      },
    ];

    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Bell}
          title="Notifications"
          description="Control the alerts you receive from NewVelion."
        />

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {items.map((item) => {
            const Icon = item.icon;
            const enabled = notifications[item.key];

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-5 p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Toggle ${item.title}`}
                  onClick={() =>
                    setNotifications((current) => ({
                      ...current,
                      [item.key]: !enabled,
                    }))
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    enabled ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save notifications"}
          </button>
        </div>
      </div>
    );
  }

  function renderSecurity() {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={ShieldCheck}
          title="Security"
          description="Review active sessions and protect your Seller account."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <ShieldCheck className="text-emerald-600" size={22} />
            <p className="mt-3 font-bold text-slate-900">Account security</p>
            <p className="mt-1 text-sm text-slate-600">
              Your Seller account is active.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <Smartphone className="text-blue-600" size={22} />
            <p className="mt-3 font-bold text-slate-900">Active sessions</p>
            <p className="mt-1 text-sm text-slate-600">
              {sessions.length} session{sessions.length === 1 ? "" : "s"} detected.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <Lock className="text-violet-600" size={22} />
            <p className="mt-3 font-bold text-slate-900">Password</p>
            <p className="mt-1 text-sm text-slate-600">
              Change your password from Account.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-bold text-slate-900">Sessions</h3>
              <p className="mt-1 text-sm text-slate-500">
                Devices and sessions associated with your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadSecurity()}
              disabled={securityLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={securityLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {securityLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <ShieldCheck className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 font-semibold text-slate-700">
                No session records available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Session information will appear here when available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((session, index) => (
                <div
                  key={session.id || index}
                  className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {session.user_agent || "Authenticated session"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        IP: {session.ip || "Unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="text-left text-xs text-slate-500 md:text-right">
                    <p>Last updated</p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {formatDate(session.updated_at || session.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "profile":
        return renderProfile();
      case "account":
        return renderAccount();
      case "preferences":
        return renderPreferences();
      case "payment":
        return renderPayment();
      case "notifications":
        return renderNotifications();
      case "security":
        return renderSecurity();
    }
  }

  return (
    <DashboardShell area="seller" activeKey="settings" title="Settings" subtitle="Manage your Seller account, payments, notifications and security.">
      <div className="min-h-full bg-slate-50/60">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-100">
                  Seller Settings
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Account & preferences
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Manage your profile, account security, payment details,
                  notifications and Seller preferences from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadSettings()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={19} />
              <div>
                <p className="font-bold">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <Check className="mt-0.5 shrink-0" size={19} />
              <div>
                <p className="font-bold">Saved successfully</p>
                <p className="mt-1">{success}</p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/20">
                    {getInitials(profile.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {profile.full_name || "Seller"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {settings?.profile?.email || "Seller account"}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;

                  return (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setError("");
                        setSuccess("");
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">
                          {tab.label}
                        </span>
                        <span
                          className={`mt-0.5 block text-xs ${
                            active ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {tab.description}
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        className={
                          active
                            ? "text-blue-100"
                            : "text-slate-300 group-hover:text-slate-500"
                        }
                      />
                    </button>
                  );
                })}
              </nav>
            </aside>

            <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="text-center">
                    <RefreshCw
                      className="mx-auto animate-spin text-blue-600"
                      size={30}
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      Loading Seller settings...
                    </p>
                  </div>
                </div>
              ) : (
                renderActiveTab()
              )}
            </main>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
