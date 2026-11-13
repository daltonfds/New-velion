"use client";

/**
 * NEWVELION UI · TELAS DO REDESIGN (ficheiro único)
 * ---------------------------------------------------------------------------------
 * Onde colocar: src/components/ui-kit/newvelion-ui.tsx
 * Depende só de: next/link, react, "@/lib/cn" (já existe) e dos tokens do Tailwind
 * (brand-* e ink-*, já definidos em tailwind.config.mjs).
 *
 * ESCOPO: SÓ VISUAL. Estes componentes não buscam dados, não chamam APIs, não
 * leem Supabase e não têm regras de negócio. Recebem tudo por props ou por slots
 * (ReactNode). Cada página existente mantém a sua lógica atual (estado, fetch,
 * permissões, pagamentos) e apenas passa os dados reais para estes componentes.
 *
 * REGRAS PARA QUEM IMPLEMENTA
 *  1. Não inventar dados. Os objetos DEMO_* no fim do ficheiro servem só para
 *     pré-visualização; nunca os importe numa página de produção.
 *  2. Não mudar rotas, APIs, schema, props públicas de componentes de negócio.
 *  3. Textos: cada página passa os seus próprios textos (o app traduz EN→PT pelo
 *     ThemeLanguageProvider). Se mudar um texto, atualize a chave do dicionário.
 *  4. Formulários e botões com lógica entram pelos slots (children, form, actions,
 *     image...). Use <Field /> e <PrimaryButton /> para o mesmo aspeto.
 *
 * MAPA TELA → ROTA(S) EXISTENTE(S)
 *  HomeScreen ............ src/app/(marketing)/page.tsx
 *  AuthLayout ............ src/app/login/page.tsx, src/app/register/page.tsx
 *  ProductScreen ......... src/app/produto/[slug]/page.tsx
 *  CheckoutScreen ........ src/app/checkout/page.tsx e src/app/entrega/page.tsx
 *  SellerDashboardScreen . src/app/dashboard/seller/page.tsx
 *  WalletScreen .......... src/app/dashboard/seller/wallet/page.tsx
 *  IntegrationsScreen .... src/app/dashboard/seller/integrations/page.tsx
 *  SupplierOrdersScreen .. src/app/dashboard/supplier/orders/page.tsx
 *  AdminOrdersScreen ..... src/app/dashboard/admin/checkout-sessions/page.tsx
 *  TrackingScreen ........ src/app/rastreio/[token]/page.tsx
 *  AppFrame .............. substitui o JSX do AppShell (a lógica do AppShell fica)
 *
 * EXEMPLO DE LIGAÇÃO (src/app/dashboard/seller/page.tsx; toda a lógica atual fica):
 *   const pathname = usePathname();
 *   return (
 *     <SellerDashboardScreen
 *       frame={{ nav: withActive(SELLER_NAV, pathname), initial: profileInitial, actions: <NotificationCenter />, bottomNav: withActive([{ label: "", items: SELLER_BOTTOM_NAV }], pathname)[0].items }}
 *       greeting={`Welcome back, ${userName}`} subtitle="..." loading={loading}
 *       kpis={[{ label: "Available balance", shortLabel: "Available", value: money(wallet.disponivel), note: "Ready for withdrawal" }, ...]}
 *       chart={{ title: "Daily commission", points: dailyPerformance.map(d => d.commission), ariaLabel: "..." }}
 *       goal={{ title: "30-day goal", current: money(commissionLast30Days), of: `of ${money(goalTarget)}`, percent: goalProgress, caption: "...", editor: <GoalInput/> }}
 *       sales={recentSales.map(s => ({ id: s.id, date: ..., product: ..., value: money(...), commission: money(...), status: { tone: "success", label: "Paid" } }))}
 *     />
 *   );
 *
 * NOTAS: CheckoutScreen.step só deve ser passado se o checkout atual tiver passos
 * (o desenho mobile mostra "Passo 2 de 3"); caso contrário omita. Idioma dos rótulos
 * dos DEMO: PT (como no desenho); no app use os textos EN atuais.
 *
 * RESPONSIVO: desktop ≥1024px (lg) e mobile abaixo. No mobile a sidebar vira gaveta,
 * o painel do vendedor ganha barra inferior e os KPIs passam a grelha 2×2.
 * ---------------------------------------------------------------------------------
 */

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ============================== PRIMITIVOS ============================== */

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className="flex h-[22px] items-end gap-[3px]">
        <i className="block h-[9px] w-[5px] rounded-sm bg-brand-600" />
        <i className="block h-[15px] w-[5px] rounded-sm bg-brand-600" />
        <i className="block h-[22px] w-[5px] rounded-sm bg-brand-600" />
      </span>
      <span className="text-[21px] font-bold tracking-[-0.04em] text-brand-600">newvelion</span>
    </span>
  );
}

export type Tone = "success" | "warning" | "danger" | "info";
const TONES: Record<Tone, string> = {
  success: "bg-[#E3F4EC] text-[#0B5F43]",
  warning: "bg-[#FBF0D9] text-[#7A4E00]",
  danger: "bg-[#FBE5E5] text-[#8A1F1F]",
  info: "bg-brand-50 text-brand-600",
};

/** Estado sempre com texto (nunca só cor). */
export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-[3px] text-xs font-semibold", TONES[tone])}>
      {children}
    </span>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-ink-200 bg-white", className)}>{children}</div>;
}

const BTN =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const BTN_PRIMARY = "bg-brand-600 text-white hover:bg-brand-700";
const BTN_SECONDARY = "border border-ink-300 bg-white text-ink-900 hover:bg-ink-50";

/** Link com aspeto de botão. */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(BTN, variant === "primary" ? BTN_PRIMARY : BTN_SECONDARY, className)}>
      {children}
    </Link>
  );
}

/** <button> com o mesmo aspeto (para formulários). */
export function PrimaryButton({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & { variant?: "primary" | "secondary" }) {
  return <button className={cn(BTN, variant === "primary" ? BTN_PRIMARY : BTN_SECONDARY, className)} {...props} />;
}

/** Campo de formulário (altura 44px). Aceita todas as props de <input>. */
export function Field({
  label,
  error,
  className,
  id,
  ...props
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className="mb-3.5">
      <label htmlFor={inputId} className="block text-[13px] font-medium text-ink-900">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mt-1.5 block h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900 transition-colors duration-150 placeholder:text-ink-400 hover:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
          error ? "border-red-600" : "border-ink-300",
          className,
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-[13px] text-red-700">{error}</p> : null}
    </div>
  );
}

const TH = "px-5 py-3 text-left text-xs font-medium text-ink-500 bg-[#FAFAFC]";
const TD = "border-t border-ink-100 px-5 py-3.5 text-sm";

/** Tabela com cabeçalho cinza claro e linhas com hover. */
export function DataTable({ head, children, className }: { head: ReactNode[]; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ className, ...p }: React.ComponentProps<"td">) => <td className={cn(TD, className)} {...p} />;
export const Tr = ({ className, ...p }: React.ComponentProps<"tr">) => (
  <tr className={cn("transition-colors duration-150 hover:bg-ink-50", className)} {...p} />
);

export function KpiCard({ label, shortLabel, value, note }: { label: string; shortLabel?: string; value: ReactNode; note: string }) {
  return (
    <Surface className="p-4 lg:p-5">
      <div className="text-xs text-ink-500 lg:text-[13px]">
        {shortLabel ? (
          <>
            <span className="lg:hidden">{shortLabel}</span>
            <span className="hidden lg:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-ink-900 lg:mt-2.5 lg:text-[26px]">{value}</div>
      <div className="mt-1 hidden text-xs text-ink-500 lg:block">{note}</div>
    </Surface>
  );
}

export function PageHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-ink-900 lg:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ============================ ESTRUTURA (APP) ============================ */

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}
export type BottomNavItem = NavItem;

function SidebarNav({ nav, onNavigate }: { nav: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 pb-4">
      {nav.map((group, gi) => (
        <div key={group.label} className={gi === 0 ? "pt-2" : ""}>
          <p className="px-3 pb-1.5 pt-[18px] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-500">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "block rounded-lg px-3 py-[9px] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                item.active ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export interface AppFrameProps {
  nav: NavGroup[];
  title: string;
  children: ReactNode;
  /** Letra do avatar. */
  initial?: string;
  /** Slot do topo à direita: seletor de idioma, NotificationCenter, etc. */
  actions?: ReactNode;
  /** Barra inferior (só mobile). Máx. 5 itens. */
  bottomNav?: BottomNavItem[];
  /** Largura máxima do conteúdo. */
  maxWidth?: string;
}

/**
 * Casca dos dashboards: sidebar 248px (desktop), gaveta (mobile), topo de 72px,
 * conteúdo com 32px de padding. Substitui só o JSX do AppShell.
 */
export function AppFrame({ nav, title, children, initial = "A", actions, bottomNav, maxWidth = "max-w-[1100px]" }: AppFrameProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-600 focus:shadow-lg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-ink-200 bg-white lg:flex">
        <div className="flex h-[72px] items-center px-6">
          <Logo />
        </div>
        <SidebarNav nav={nav} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white shadow-xl">
            <div className="flex h-[60px] items-center px-6">
              <Logo />
            </div>
            <SidebarNav nav={nav} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-ink-200 bg-white px-4 lg:h-[72px] lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-300 text-ink-700 transition-colors duration-150 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
            >
              <span aria-hidden className="block h-0.5 w-4 bg-current shadow-[0_5px_0_currentColor,0_-5px_0_currentColor]" />
            </button>
            <strong className="text-[17px] tracking-[-0.02em] lg:text-lg">{title}</strong>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600">{initial}</span>
          </div>
        </header>

        <main id="main-content" className={cn("p-4 lg:p-8", bottomNav ? "pb-24 lg:pb-8" : "", maxWidth)}>
          {children}
        </main>
      </div>

      {bottomNav ? (
        <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-200 bg-white lg:hidden">
          {bottomNav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex-1 py-3.5 text-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600",
                item.active ? "font-semibold text-brand-600" : "font-medium text-ink-500",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

/** Casca das páginas públicas (home, produto, checkout, rastreio). */
export function PublicShell({
  children,
  nav,
  right,
}: {
  children: ReactNode;
  nav?: { label: string; href: string }[];
  right?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-ink-900">
      <header className="border-b border-ink-200">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-10 px-5 lg:px-8">
          <Link href="/" aria-label="Newvelion">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden flex-1 gap-7 text-sm font-medium text-ink-700 lg:flex">
            {nav?.map((n) => (
              <Link key={n.href + n.label} href={n.href} className="transition-colors duration-150 hover:text-brand-600">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 lg:ml-0">{right}</div>
        </div>
      </header>
      {children}
    </div>
  );
}

/* =============================== PÁGINAS PÚBLICAS =============================== */

interface ShellProps {
  shellNav?: { label: string; href: string }[];
  shellRight?: ReactNode;
}

/* ---------- Home ---------- */

export interface HomeScreenProps {
  navLinks?: { label: string; href: string }[];
  loginHref?: string;
  signupHref?: string;
  sellHref?: string;
  supplierHref?: string;
}

export function HomeScreen({
  navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Para vendedores", href: "/register" },
    { label: "Para fornecedores", href: "/become-supplier" },
    { label: "Logística 3PL", href: "/fornecedores" },
    { label: "Preços", href: "/#precos" },
  ],
  loginHref = "/login",
  signupHref = "/register",
  sellHref = "/register",
  supplierHref = "/become-supplier",
}: HomeScreenProps) {
  const rows: [string, string, Tone, string][] = [
    ["NV-20418", "Maputo → Xai-Xai", "info", "Em trânsito"],
    ["NV-20417", "Joanesburgo → Pretória", "success", "Entregue"],
    ["NV-20416", "Luanda → Luanda", "warning", "A preparar"],
  ];
  return (
    <PublicShell
      nav={navLinks}
      right={
        <>
          <Link href={loginHref} className="text-sm font-medium hover:text-brand-600">
            Entrar
          </Link>
          <ButtonLink href={signupHref} className="min-h-10">
            Criar conta
          </ButtonLink>
        </>
      }
    >
      <section className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-[72px] lg:px-8 lg:pb-[72px] lg:pt-[88px]">
        <div>
          <p className="mb-5 text-[13px] font-semibold tracking-[0.02em] text-brand-600">Comércio e logística para a África Austral</p>
          <h1 className="text-[34px] font-bold leading-[1.08] tracking-[-0.045em] lg:text-[54px]">
            Venda, armazene e entregue em Moçambique, África do Sul e Angola.
          </h1>
          <p className="mt-6 max-w-[500px] text-[17px] leading-[1.65] text-ink-600">
            Uma só plataforma liga fornecedores, vendedores e clientes, com stock, pagamentos e entregas no mesmo painel.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={sellHref} className="min-h-12 px-[22px] text-[15px]">
              Começar a vender
            </ButtonLink>
            <ButtonLink href={supplierHref} variant="secondary" className="min-h-12 px-[22px] text-[15px]">
              Tornar-me fornecedor
            </ButtonLink>
          </div>
          <p className="mt-8 text-[13px] text-ink-500">Maputo · Xai-Xai · Joanesburgo · Pretória · Luanda</p>
        </div>

        {/* Pré-visualização ilustrativa do painel (marcada como exemplo) */}
        <div className="rounded-[14px] border border-ink-200 bg-white shadow-[0_24px_48px_-28px_rgba(16,6,159,0.35),0_1px_2px_rgba(18,19,43,0.06)]">
          <div className="flex justify-between border-b border-ink-100 px-[22px] py-[18px]">
            <strong className="text-[15px]">Encomendas de hoje</strong>
            <span className="text-[13px] text-ink-500">Exemplo</span>
          </div>
          <table className="w-full border-collapse">
            <tbody>
              {rows.map(([ref, route, tone, label]) => (
                <tr key={ref}>
                  <Td className="first:pl-[22px]">{ref}</Td>
                  <Td className="text-ink-500">{route}</Td>
                  <Td>
                    <StatusBadge tone={tone}>{label}</StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="grid grid-cols-3 gap-3 border-t border-ink-100 px-[22px] py-[18px]">
            {[
              ["Stock", "Em tempo real"],
              ["Moedas", "MZN · ZAR · AOA"],
              ["Rastreio", "Por pedido"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-ink-500">{k}</dt>
                <dd className="text-sm font-semibold lg:text-lg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="precos" className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-14 lg:grid-cols-3 lg:px-8 lg:py-[72px]">
          {[
            ["Marketplace B2B", "Catálogo de fornecedores verificados, com preços e comissões visíveis antes de vender."],
            ["Logística terceirizada", "Reserva de stock, expedição e estado do pedido sem folhas de cálculo."],
            ["Integrações e carteira", "Ligue a sua loja Shopify e acompanhe saldo, garantia e levantamentos em moeda local."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="mb-2.5 text-lg font-semibold tracking-[-0.02em]">{t}</h3>
              <p className="text-[15px] leading-[1.65] text-ink-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

/* ---------- Login / Registo ---------- */

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  /** O formulário existente (com a sua lógica). Use <Field/> e <PrimaryButton/>. */
  children: ReactNode;
  /** Ex.: "Ainda não tem conta? Criar conta". */
  footer?: ReactNode;
  panelTitle?: string;
  panelText?: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  panelTitle = "Uma conta para vender, fornecer e afiliar.",
  panelText = "Stock, pagamentos e entregas no mesmo painel, em Moçambique, África do Sul e Angola.",
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-white text-ink-900 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-[12%]">
        <div className="mb-10">
          <Link href="/" aria-label="Newvelion">
            <Logo />
          </Link>
        </div>
        <h1 className="text-[30px] font-semibold tracking-[-0.03em]">{title}</h1>
        {subtitle ? <p className="mb-7 mt-2 text-sm text-ink-500">{subtitle}</p> : <div className="mb-7" />}
        {children}
        {footer ? <div className="mt-5 text-sm text-ink-500">{footer}</div> : null}
      </div>
      <aside className="hidden flex-col justify-center bg-brand-600 px-[12%] text-white lg:flex">
        <h2 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.035em] text-white">{panelTitle}</h2>
        <p className="mt-[18px] max-w-[420px] text-base leading-[1.65] text-[#DDD9FF]">{panelText}</p>
      </aside>
    </main>
  );
}

/* ---------- Produto ---------- */

export interface ProductScreenProps extends ShellProps {
  breadcrumb: string;
  supplierLabel: string;
  name: string;
  price: string;
  availability: string;
  /** Galeria/imagem real. */
  image: ReactNode;
  /** Botões com lógica (comprar, adicionar ao carrinho). */
  actions: ReactNode;
  benefits: string[];
}

export function ProductScreen({ shellNav, shellRight, breadcrumb, supplierLabel, name, price, availability, image, actions, benefits }: ProductScreenProps) {
  return (
    <PublicShell nav={shellNav} right={shellRight}>
      <main className="mx-auto grid max-w-[1200px] gap-10 px-5 py-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-14 lg:px-8">
        <div>
          <p className="mb-5 text-[13px] text-ink-500">{breadcrumb}</p>
          <div className="overflow-hidden rounded-[14px] border border-ink-200 bg-brand-50 lg:h-[520px] [&>*]:h-full [&>*]:w-full [&_img]:object-cover">{image}</div>
        </div>
        <div className="lg:pt-9">
          <p className="text-[13px] text-ink-500">{supplierLabel}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-[1.15] tracking-[-0.035em] lg:text-[32px]">{name}</h1>
          <div className="mt-5 text-[30px] font-semibold tracking-[-0.03em]">{price}</div>
          <p className="mb-6 mt-2 text-sm font-semibold text-[#0B5F43]">{availability}</p>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row [&>*]:flex-1">{actions}</div>
          <ul className="mt-7 space-y-0 border-t border-ink-200 pt-5 text-sm leading-8 text-ink-600">
            {benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </main>
    </PublicShell>
  );
}

/* ---------- Checkout (desktop e mobile) ---------- */

export function CheckoutSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-xl border border-ink-200 bg-white p-4 lg:p-6">
      <h2 className="mb-4 text-base font-semibold lg:mb-[18px]">{title}</h2>
      {children}
    </section>
  );
}

export interface CheckoutScreenProps extends ShellProps {
  /** Mobile: "Passo 2 de 3 · Entrega". */
  step?: { current: number; total: number; label: string };
  /** Os formulários existentes, cada um dentro de um <CheckoutSection/>. */
  children: ReactNode;
  lines: { label: string; amount: string }[];
  shipping?: { label: string; amount: string };
  total: { label: string; amount: string };
  /** Botão de submissão existente (aparece fixo ao fundo no mobile). */
  submit: ReactNode;
}

export function CheckoutScreen({ shellNav, shellRight, step, children, lines, shipping, total, submit }: CheckoutScreenProps) {
  return (
    <PublicShell nav={shellNav} right={shellRight}>
      <main className="mx-auto grid max-w-[1100px] items-start gap-8 px-4 py-6 pb-32 lg:grid-cols-[1.3fr_.7fr] lg:px-8 lg:py-10 lg:pb-10">
        <div>
          {step ? (
            <div className="mb-5 lg:hidden">
              <p className="mb-3 text-[13px] text-ink-500">
                Passo {step.current} de {step.total} · {step.label}
              </p>
              <div className="h-1.5 rounded-full bg-ink-200" role="progressbar" aria-valuemin={1} aria-valuemax={step.total} aria-valuenow={step.current}>
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${(step.current / step.total) * 100}%` }} />
              </div>
            </div>
          ) : null}
          {children}
        </div>
        <aside className="lg:sticky lg:top-6">
          <Surface className="p-4 lg:p-6">
            <strong className="text-base">Resumo</strong>
            <div className="mt-4 space-y-2.5 text-sm lg:mt-[18px]">
              {lines.map((l) => (
                <div key={l.label} className="flex justify-between">
                  <span>{l.label}</span>
                  <span>{l.amount}</span>
                </div>
              ))}
              {shipping ? (
                <div className="flex justify-between text-ink-500">
                  <span>{shipping.label}</span>
                  <span>{shipping.amount}</span>
                </div>
              ) : null}
            </div>
            <div className="mt-[18px] hidden items-center justify-between border-t border-ink-200 pt-[18px] text-lg font-semibold lg:flex">
              <span>{total.label}</span>
              <span>{total.amount}</span>
            </div>
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white p-3 lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:p-0 [&>*]:w-full">
              <div className="mb-2.5 flex justify-between font-semibold lg:hidden">
                <span>{total.label}</span>
                <span>{total.amount}</span>
              </div>
              {submit}
            </div>
          </Surface>
        </aside>
      </main>
    </PublicShell>
  );
}

/* ---------- Rastreio público ---------- */

export interface TrackingScreenProps extends ShellProps {
  reference: string;
  headline: string;
  steps: { label: string; done: boolean }[];
  events: { when: string; text: string }[];
}

export function TrackingScreen({ shellNav, shellRight, reference, headline, steps, events }: TrackingScreenProps) {
  return (
    <PublicShell nav={shellNav} right={shellRight}>
      <main className="mx-auto max-w-[760px] px-5 py-12 lg:px-8 lg:py-14">
        <p className="text-[13px] text-ink-500">{reference}</p>
        <h1 className="mb-8 mt-1.5 text-[28px] font-bold tracking-[-0.035em] lg:text-[32px]">{headline}</h1>
        <ol className="flex gap-2.5">
          {steps.map((s) => (
            <li key={s.label} className="flex-1" aria-current={s.done ? "step" : undefined}>
              <div className={cn("h-2.5 rounded-full", s.done ? "bg-brand-600" : "bg-ink-200")} />
              <div className={cn("mt-2.5 text-sm", s.done ? "font-semibold text-ink-900" : "font-medium text-ink-500")}>{s.label}</div>
            </li>
          ))}
        </ol>
        <Surface className="mt-10 p-6">
          <strong className="text-[15px]">Histórico</strong>
          <ul className="mt-4 space-y-0 text-sm leading-[2.1] text-ink-600">
            {events.map((e) => (
              <li key={e.when + e.text}>
                <strong className="text-ink-900">{e.when}</strong> · {e.text}
              </li>
            ))}
          </ul>
        </Surface>
      </main>
    </PublicShell>
  );
}

/* =============================== DASHBOARDS =============================== */

export type FrameProps = Pick<AppFrameProps, "nav" | "initial" | "actions" | "bottomNav">;

export interface Cell {
  tone: Tone;
  label: string;
}

function Skel({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-ink-100", className)} />;
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-ink-500">{children}</p>;
}

/* ---------- Painel do vendedor ---------- */

export interface SaleRow {
  id: string;
  date: string;
  product: string;
  value: string;
  commission: string;
  status: Cell;
}

export interface SellerDashboardScreenProps {
  frame: FrameProps;
  greeting: string;
  subtitle: string;
  cta?: { label: string; href: string };
  kpis: { label: string; shortLabel?: string; value: ReactNode; note: string }[];
  /** Valores diários (30 pontos). Sem dados reais, não passe nada. */
  chart?: { title: string; points: number[]; ariaLabel: string; xLabels?: string[] };
  goal?: { title: string; current: string; of: string; percent: number; caption: string; editor?: ReactNode };
  salesTitle?: string;
  salesHeader?: { date: string; product: string; value: string; commission: string; status: string };
  salesLink?: { label: string; href: string };
  sales: SaleRow[];
  emptyText?: string;
  loading?: boolean;
}

function Chart({ points, ariaLabel, xLabels }: { points: number[]; ariaLabel: string; xLabels?: string[] }) {
  const max = Math.max(...points, 1);
  const n = Math.max(points.length - 1, 1);
  const pts = points.map((v, i) => [(i / n) * 600, 195 - (v / max) * 165] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  return (
    <div>
      <svg viewBox="0 0 600 200" className="mt-3 h-[220px] w-full" role="img" aria-label={ariaLabel} preserveAspectRatio="none">
        <g stroke="#EEEFF4">
          {[30, 85, 140, 195].map((y) => (
            <line key={y} x1="0" x2="600" y1={y} y2={y} />
          ))}
        </g>
        {pts.length > 1 ? (
          <>
            <path d={`${line}L600 195L0 195Z`} fill="#10069F" fillOpacity=".07" />
            <path d={line} fill="none" stroke="#10069F" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </>
        ) : null}
      </svg>
      {xLabels?.length ? (
        <div className="mt-2 flex justify-between text-xs text-ink-500">
          {xLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SellerDashboardScreen({
  frame,
  greeting,
  subtitle,
  cta,
  kpis,
  chart,
  goal,
  salesTitle = "Vendas recentes",
  salesHeader = { date: "Data", product: "Produto", value: "Valor", commission: "Comissão", status: "Estado" },
  salesLink,
  sales,
  emptyText = "Ainda não há vendas pagas.",
  loading,
}: SellerDashboardScreenProps) {
  return (
    <AppFrame {...frame} title="Painel">
      <PageHeading
        title={greeting}
        subtitle={subtitle}
        action={cta ? <ButtonLink href={cta.href} className="hidden md:inline-flex">{cta.label}</ButtonLink> : undefined}
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <Surface key={i} className="p-4 lg:p-5">
                <Skel className="h-3 w-24" />
                <Skel className="mt-3 h-7 w-28" />
              </Surface>
            ))
          : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {(chart || goal) && (
        <div className={cn("mt-4 grid gap-4", chart && goal ? "lg:grid-cols-[1.7fr_1fr]" : "")}>
          {chart ? (
            <Surface className="hidden p-[22px] lg:block">
              <strong className="text-[15px]">{chart.title}</strong>
              {loading ? <Skel className="mt-3 h-[220px] w-full" /> : <Chart points={chart.points} ariaLabel={chart.ariaLabel} xLabels={chart.xLabels} />}
            </Surface>
          ) : null}
          {goal ? (
            <Surface className="p-4 lg:p-[22px]">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm lg:text-[15px]">{goal.title}</strong>
                {goal.editor}
              </div>
              <div className="mt-3.5 text-[22px] font-semibold tracking-[-0.03em] lg:mt-4 lg:text-[26px]">
                {goal.current} <span className="text-sm font-normal text-ink-500">{goal.of}</span>
              </div>
              <div
                className="mt-4 h-2 rounded-full bg-brand-50"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(goal.percent)}
              >
                <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${Math.min(100, goal.percent)}%` }} />
              </div>
              <p className="mt-3 text-[13px] text-ink-500">{goal.caption}</p>
            </Surface>
          ) : null}
        </div>
      )}

      <Surface className="mt-4 overflow-hidden">
        <div className="flex justify-between px-4 py-[18px] lg:px-5">
          <strong className="text-sm lg:text-[15px]">{salesTitle}</strong>
          {salesLink ? (
            <Link href={salesLink.href} className="text-[13px] font-semibold text-brand-600 hover:underline">
              {salesLink.label}
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="space-y-3 px-5 pb-5" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skel key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <EmptyNote>{emptyText}</EmptyNote>
        ) : (
          <>
            {/* mobile: cartões */}
            <ul className="divide-y divide-ink-100 border-t border-ink-100 md:hidden">
              {sales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
                  <span>
                    {s.product}
                    <br />
                    <span className="text-xs text-ink-500">{s.value}</span>
                  </span>
                  <StatusBadge tone={s.status.tone}>{s.status.label}</StatusBadge>
                </li>
              ))}
            </ul>
            {/* desktop: tabela */}
            <DataTable className="hidden md:block" head={[salesHeader.date, salesHeader.product, salesHeader.value, salesHeader.commission, salesHeader.status]}>
              {sales.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.date}</Td>
                  <Td>{s.product}</Td>
                  <Td>{s.value}</Td>
                  <Td>{s.commission}</Td>
                  <Td>
                    <StatusBadge tone={s.status.tone}>{s.status.label}</StatusBadge>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          </>
        )}
      </Surface>
    </AppFrame>
  );
}

/* ---------- Carteira ---------- */

export interface WalletScreenProps {
  frame: FrameProps;
  title: string;
  subtitle: string;
  balance: { label: string; value: string; action: ReactNode };
  breakdown: { label: string; value: string }[];
  movementsTitle?: string;
  movementsHead?: string[];
  movements: { id: string; date: string; type: string; amount: string; status: Cell }[];
  emptyText?: string;
  loading?: boolean;
}

export function WalletScreen({ frame, title, subtitle, balance, breakdown, movementsTitle = "Movimentos", movementsHead = ["Data", "Tipo", "Valor", "Estado"], movements, emptyText = "Ainda não há movimentos.", loading }: WalletScreenProps) {
  return (
    <AppFrame {...frame} title={title}>
      <PageHeading title={title} subtitle={subtitle} />
      <div className="grid items-start gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <Surface className="p-6 lg:p-[26px]">
          <div className="text-[13px] text-ink-500">{balance.label}</div>
          {loading ? <Skel className="my-3 h-10 w-44" /> : <div className="mb-5 mt-2.5 text-[34px] font-semibold tracking-[-0.04em] lg:text-[38px]">{balance.value}</div>}
          <div className="[&>*]:w-full">{balance.action}</div>
          <dl className="mt-[22px] space-y-0 border-t border-ink-200 pt-4 text-sm leading-[2.2] text-ink-600">
            {breakdown.map((b) => (
              <div key={b.label} className="flex justify-between">
                <dt>{b.label}</dt>
                <dd className="font-semibold text-ink-900">{b.value}</dd>
              </div>
            ))}
          </dl>
        </Surface>

        <Surface className="overflow-hidden">
          <div className="px-5 py-[18px]">
            <strong className="text-[15px]">{movementsTitle}</strong>
          </div>
          {loading ? (
            <div className="space-y-3 px-5 pb-5" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <Skel key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <EmptyNote>{emptyText}</EmptyNote>
          ) : (
            <DataTable head={movementsHead}>
              {movements.map((m) => (
                <Tr key={m.id}>
                  <Td>{m.date}</Td>
                  <Td>{m.type}</Td>
                  <Td>{m.amount}</Td>
                  <Td>
                    <StatusBadge tone={m.status.tone}>{m.status.label}</StatusBadge>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          )}
        </Surface>
      </div>
    </AppFrame>
  );
}

/* ---------- Integrações ---------- */

export interface IntegrationsScreenProps {
  frame: FrameProps;
  title: string;
  subtitle: string;
  connection: { name: string; status: Cell; detail: string; actions: ReactNode };
  mappingTitle?: string;
  mappingHead?: string[];
  mappings: { id: string; shop: string; product: string; status: Cell }[];
}

export function IntegrationsScreen({ frame, title, subtitle, connection, mappingTitle = "Mapeamento de produtos", mappingHead = ["Produto na loja", "Produto Newvelion", "Estado"], mappings }: IntegrationsScreenProps) {
  return (
    <AppFrame {...frame} title={title}>
      <PageHeading title={title} subtitle={subtitle} />
      <Surface className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <strong className="mr-2 text-base">{connection.name}</strong>
            <StatusBadge tone={connection.status.tone}>{connection.status.label}</StatusBadge>
            <p className="mt-1.5 text-sm text-ink-500">{connection.detail}</p>
          </div>
          <div className="flex gap-2.5">{connection.actions}</div>
        </div>
      </Surface>
      <Surface className="mt-4 overflow-hidden">
        <div className="px-5 py-[18px]">
          <strong className="text-[15px]">{mappingTitle}</strong>
        </div>
        <DataTable head={mappingHead}>
          {mappings.map((m) => (
            <Tr key={m.id}>
              <Td>{m.shop}</Td>
              <Td>{m.product}</Td>
              <Td>
                <StatusBadge tone={m.status.tone}>{m.status.label}</StatusBadge>
              </Td>
            </Tr>
          ))}        </DataTable>
      </Surface>
    </AppFrame>
  );
}

/* ---------- Fornecedor: pedidos ---------- */

export interface SupplierOrdersScreenProps {
  frame: FrameProps;
  title: string;
  subtitle: string;
  /** Linha pequena sob o título (ex.: aviso de dados de exemplo; normalmente omitir). */
  note?: string;
  kpis: { label: string; value: ReactNode; note: string }[];
  head?: string[];
  orders: { id: string; ref: string; product: string; destination: string; status: Cell; action?: ReactNode }[];
  emptyText?: string;
  loading?: boolean;
}

export function SupplierOrdersScreen({ frame, title, subtitle, note, kpis, head = ["Pedido", "Produto", "Destino", "Estado", ""], orders, emptyText = "Não há pedidos a expedir.", loading }: SupplierOrdersScreenProps) {
  return (
    <AppFrame {...frame} title={title}>
      <PageHeading title={subtitle} subtitle={note} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <Surface className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skel key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyNote>{emptyText}</EmptyNote>
        ) : (
          <DataTable head={head}>
            {orders.map((o) => (
              <Tr key={o.id}>
                <Td>
                  <strong>{o.ref}</strong>
                </Td>
                <Td>{o.product}</Td>
                <Td>{o.destination}</Td>
                <Td>
                  <StatusBadge tone={o.status.tone}>{o.status.label}</StatusBadge>
                </Td>
                <Td>{o.action}</Td>
              </Tr>
            ))}
          </DataTable>
        )}
      </Surface>
    </AppFrame>
  );
}

/* ---------- Admin: encomendas ---------- */

export interface AdminOrdersScreenProps {
  frame: FrameProps;
  title: string;
  tabs: { label: string; href: string; active?: boolean }[];
  /** O campo de pesquisa existente (usa <Field/> ou um <input> próprio). */
  search: ReactNode;
  exportAction?: ReactNode;
  head?: string[];
  rows: { id: string; ref: string; customer: string; country: string; amount: string; payment: Cell; logistics: Cell; action: ReactNode }[];
  emptyText?: string;
  loading?: boolean;
}

export function AdminOrdersScreen({ frame, title, tabs, search, exportAction, head = ["Pedido", "Cliente", "País", "Valor", "Pagamento", "Logística", ""], rows, emptyText = "Nenhuma encomenda encontrada.", loading }: AdminOrdersScreenProps) {
  return (
    <AppFrame {...frame} title={title} maxWidth="max-w-[1160px]">
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
              t.active ? "bg-brand-50 text-brand-600" : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mb-4 flex gap-3">
        <div className="flex-1 [&_div]:mb-0">{search}</div>
        {exportAction}
      </div>
      <Surface className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <Skel key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyNote>{emptyText}</EmptyNote>
        ) : (
          <DataTable head={head}>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <strong>{r.ref}</strong>
                </Td>
                <Td>{r.customer}</Td>
                <Td>{r.country}</Td>
                <Td>{r.amount}</Td>
                <Td>
                  <StatusBadge tone={r.payment.tone}>{r.payment.label}</StatusBadge>
                </Td>
                <Td>
                  <StatusBadge tone={r.logistics.tone}>{r.logistics.label}</StatusBadge>
                </Td>
                <Td>{r.action}</Td>
              </Tr>
            ))}
          </DataTable>
        )}
      </Surface>
    </AppFrame>
  );
}

/* ============================ NAVEGAÇÃO (referência) ============================
 * Hrefs reais do app. Os rótulos estão em PT como no desenho; no app os rótulos
 * continuam a ser os atuais (EN) e o dicionário traduz. Marque o item ativo com
 * withActive(NAV, usePathname()).
 */

export function withActive(nav: NavGroup[], pathname: string): NavGroup[] {
  return nav.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, active: pathname === i.href })) }));
}

export const SELLER_NAV: NavGroup[] = [
  { label: "Visão geral", items: [{ label: "Painel", href: "/dashboard/seller" }] },
  {
    label: "Vender",
    items: [
      { label: "Marketplace", href: "/dashboard/seller/marketplace" },
      { label: "Meus produtos", href: "/dashboard/seller/products" },
      { label: "Pedidos e vendas", href: "/dashboard/seller/sales" },
      { label: "Links", href: "/dashboard/seller/links" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Comissões", href: "/dashboard/seller/commissions" },
      { label: "Carteira", href: "/dashboard/seller/wallet" },
      { label: "Levantamentos", href: "/dashboard/seller/withdrawals" },
    ],
  },
  {
    label: "Crescer",
    items: [
      { label: "Análises", href: "/dashboard/seller/performance" },
      { label: "Ranking", href: "/dashboard/seller/ranking" },
      { label: "Integrações", href: "/dashboard/seller/integrations" },
    ],
  },
];

export const SUPPLIER_NAV: NavGroup[] = [
  {
    label: "Operação",
    items: [
      { label: "Painel", href: "/dashboard/supplier" },
      { label: "Produtos", href: "/dashboard/supplier/products" },
      { label: "Pedidos e logística", href: "/dashboard/supplier/orders" },
      { label: "Envio", href: "/dashboard/supplier/shipping" },
    ],
  },
  { label: "Financeiro", items: [{ label: "Levantamentos", href: "/dashboard/supplier/withdrawals" }] },
  {
    label: "Conta",
    items: [
      { label: "Definições", href: "/dashboard/supplier/settings" },
      { label: "Perfil", href: "/dashboard/supplier/profile" },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Operação",
    items: [
      { label: "Painel", href: "/dashboard/admin" },
      { label: "Encomendas", href: "/dashboard/admin/checkout-sessions" },
      { label: "Transações", href: "/dashboard/admin/transactions" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Produtos", href: "/dashboard/admin/products" },
      { label: "Revisão de produtos", href: "/dashboard/admin/products/review" },
      { label: "Categorias", href: "/dashboard/admin/categories" },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { label: "Utilizadores", href: "/dashboard/admin/users" },
      { label: "Vendedores", href: "/dashboard/admin/sellers" },
      { label: "Fornecedores", href: "/dashboard/admin/suppliers" },
    ],
  },
  {
    label: "Finanças",
    items: [
      { label: "Comissões", href: "/dashboard/admin/commissions" },
      { label: "Levantamentos", href: "/dashboard/admin/withdrawals" },
      { label: "KYC", href: "/dashboard/admin/kyc" },
    ],
  },
];

export const SELLER_BOTTOM_NAV: BottomNavItem[] = [
  { label: "Painel", href: "/dashboard/seller" },
  { label: "Mercado", href: "/dashboard/seller/marketplace" },
  { label: "Vendas", href: "/dashboard/seller/sales" },
  { label: "Carteira", href: "/dashboard/seller/wallet" },
  { label: "Mais", href: "/dashboard/seller/settings" },
];

/* ============================ PRÉ-VISUALIZAÇÃO (DEMO) ============================
 * SÓ para comparar com o desenho numa página temporária (ex.: /ui-preview).
 * NUNCA importe UI_DEMOS numa página de produção: os valores são fictícios.
 */

const demoFrame = (nav: NavGroup[], active: string, bottom = false): FrameProps => ({
  nav: withActive(nav, active),
  initial: "A",
  bottomNav: bottom ? withActive([{ label: "", items: SELLER_BOTTOM_NAV }], active)[0].items : undefined,
  actions: (
    <>
      <span className="flex h-10 items-center rounded-lg border border-ink-300 bg-white px-3.5 text-[13px] font-semibold">PT</span>
      <span aria-label="Notificações" className="hidden h-10 w-10 rounded-lg border border-ink-300 bg-white lg:block" />
    </>
  ),
});

const demoShell: ShellProps = {
  shellNav: [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Rastrear pedido", href: "/rastreio" },
    { label: "Suporte", href: "/#suporte" },
  ],
  shellRight: <Link href="/cart" className="text-sm font-medium">Carrinho</Link>,
};

export const UI_DEMOS: Record<string, () => ReactNode> = {
  home: () => <HomeScreen />,
  login: () => (
    <AuthLayout title="Entrar na sua conta" subtitle="Aceda ao painel de vendedor, fornecedor ou afiliado." footer={<>Ainda não tem conta? <Link href="/register" className="font-semibold text-brand-600">Criar conta</Link></>}>
      <Field label="Email" type="email" placeholder="nome@empresa.com" />
      <Field label="Palavra-passe" type="password" placeholder="••••••••" />
      <PrimaryButton type="button" className="w-full">Entrar</PrimaryButton>
    </AuthLayout>
  ),
  produto: () => (
    <ProductScreen
      {...demoShell}
      breadcrumb="Marketplace / Saúde e bem-estar"
      supplierLabel="Fornecedor verificado"
      name="Kit de ervas, 60 unidades"
      price="R 1 240"
      availability="Em stock · envio em 2 dias úteis"
      image={<div className="flex items-center justify-center text-sm font-semibold text-brand-600">Imagem do produto</div>}
      actions={<><PrimaryButton type="button">Comprar agora</PrimaryButton><PrimaryButton type="button" variant="secondary">Adicionar ao carrinho</PrimaryButton></>}
      benefits={["Entrega com código de rastreio", "Pagamento confirmado antes do envio", "Avaliações apenas de compradores verificados"]}
    />
  ),
  checkout: () => (
    <CheckoutScreen
      {...demoShell}
      step={{ current: 2, total: 3, label: "Entrega" }}
      lines={[{ label: "Kit de ervas × 1", amount: "R 1 240" }]}
      shipping={{ label: "Envio", amount: "R 85" }}
      total={{ label: "Total", amount: "R 1 325" }}
      submit={<PrimaryButton type="button">Confirmar pedido</PrimaryButton>}
    >
      <CheckoutSection title="1. Contacto"><Field label="Email" placeholder="nome@email.com" /><Field label="Telemóvel" placeholder="+258 …" /></CheckoutSection>
      <CheckoutSection title="2. Entrega"><Field label="Morada" placeholder="Rua, número, bairro" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Cidade" placeholder="Xai-Xai" /><Field label="País" placeholder="Moçambique" /></div></CheckoutSection>
      <CheckoutSection title="3. Pagamento"><div className="rounded-lg border border-brand-600 bg-[#F6F5FE] px-4 py-3.5 text-sm font-semibold">Pagamento local</div><div className="mt-2.5 rounded-lg border border-ink-300 px-4 py-3.5 text-sm">Cartão</div></CheckoutSection>
    </CheckoutScreen>
  ),
  rastreio: () => (
    <TrackingScreen
      {...demoShell}
      reference="Pedido NV-20418"
      headline="A caminho de Xai-Xai"
      steps={[{ label: "Confirmado", done: true }, { label: "Preparado", done: true }, { label: "Em trânsito", done: true }, { label: "Entregue", done: false }]}
      events={[{ when: "09/11, 14:10", text: "Saiu do armazém de Maputo" }, { when: "09/11, 09:40", text: "Pedido preparado" }, { when: "08/11, 18:02", text: "Pagamento confirmado" }]}
    />
  ),
  vendedor: () => (
    <SellerDashboardScreen
      frame={demoFrame(SELLER_NAV, "/dashboard/seller", true)}
      greeting="Olá, Ana"
      subtitle="O resumo do seu negócio nos últimos 30 dias. Dados de exemplo."
      cta={{ label: "Explorar marketplace", href: "/dashboard/seller/marketplace" }}
      kpis={[{ label: "Saldo disponível", shortLabel: "Disponível", value: "R 12 480", note: "Pronto a levantar" }, { label: "Em garantia", value: "R 3 150", note: "Libertado após a entrega" }, { label: "Comissão", value: "R 8 920", note: "Vendas pagas" }, { label: "Vendas pagas", value: "142", note: "Últimos 30 dias" }]}
      chart={{ title: "Comissão diária", points: [150, 140, 148, 110, 120, 90, 100, 70, 82, 52, 60, 34, 40].map((y) => 195 - y), ariaLabel: "Comissão diária em crescimento nos últimos 30 dias" }}
      goal={{ title: "Meta de 30 dias", current: "R 8 920", of: "de R 10 000", percent: 89, caption: "89% concluído. Faltam R 1 080." }}
      salesLink={{ label: "Ver todas", href: "/dashboard/seller/sales" }}
      sales={[
        { id: "1", date: "09/11/2026", product: "Kit de ervas, 60 un.", value: "R 1 240", commission: "R 186", status: { tone: "success", label: "Pago" } },
        { id: "2", date: "09/11/2026", product: "Chá detox, caixa", value: "R 680", commission: "R 102", status: { tone: "warning", label: "Pendente" } },
        { id: "3", date: "08/11/2026", product: "Suplemento ómega 3", value: "R 920", commission: "R 138", status: { tone: "danger", label: "Reembolsado" } },
      ]}
    />
  ),
  carteira: () => (
    <WalletScreen
      frame={demoFrame(SELLER_NAV, "/dashboard/seller/wallet")}
      title="Carteira"
      subtitle="Saldo das vendas, separado das recompensas de afiliado."
      balance={{ label: "Disponível para levantar", value: "R 12 480", action: <PrimaryButton type="button">Levantar saldo</PrimaryButton> }}
      breakdown={[{ label: "Em garantia", value: "R 3 150" }, { label: "Reservado", value: "R 0" }]}
      movements={[
        { id: "1", date: "09/11", type: "Comissão", amount: "+ R 186", status: { tone: "success", label: "Confirmado" } },
        { id: "2", date: "07/11", type: "Levantamento", amount: "− R 2 000", status: { tone: "warning", label: "Em processamento" } },
        { id: "3", date: "05/11", type: "Reversão", amount: "− R 138", status: { tone: "danger", label: "Reembolsado" } },
      ]}
    />
  ),
  integracoes: () => (
    <IntegrationsScreen
      frame={demoFrame(SELLER_NAV, "/dashboard/seller/integrations")}
      title="Integrações"
      subtitle="Ligue a sua loja e sincronize pedidos e stock."
      connection={{ name: "Shopify", status: { tone: "success", label: "Ligado" }, detail: "minha-loja.myshopify.com · última sincronização há 12 min", actions: <><PrimaryButton type="button">Sincronizar</PrimaryButton><PrimaryButton type="button" variant="secondary">Desligar</PrimaryButton></> }}
      mappings={[
        { id: "1", shop: "Kit de ervas 60", product: "Kit de ervas, 60 un.", status: { tone: "success", label: "Mapeado" } },
        { id: "2", shop: "Chá detox", product: "Chá detox, caixa", status: { tone: "success", label: "Mapeado" } },
        { id: "3", shop: "Ómega 3 premium", product: "—", status: { tone: "warning", label: "Por mapear" } },
      ]}
    />
  ),
  fornecedor: () => (
    <SupplierOrdersScreen
      frame={demoFrame(SUPPLIER_NAV, "/dashboard/supplier/orders")}
      title="Pedidos e logística"
      subtitle="Pedidos a expedir"
      note="Dados de exemplo."
      kpis={[{ label: "A preparar", value: "12", note: "Aguardam expedição" }, { label: "Em trânsito", value: "8", note: "Com código de rastreio" }, { label: "Entregues", value: "214", note: "Este mês" }]}
      orders={[
        { id: "1", ref: "NV-20418", product: "Kit de ervas ×2", destination: "Xai-Xai", status: { tone: "warning", label: "A preparar" }, action: <a href="#" className="font-semibold text-brand-600">Marcar como enviado</a> },
        { id: "2", ref: "NV-20417", product: "Chá detox ×5", destination: "Pretória", status: { tone: "info", label: "Em trânsito" }, action: <a href="#" className="font-semibold text-brand-600">Ver rastreio</a> },
        { id: "3", ref: "NV-20412", product: "Ómega 3 ×1", destination: "Luanda", status: { tone: "success", label: "Entregue" } },
      ]}
    />
  ),
  admin: () => (
    <AdminOrdersScreen
      frame={demoFrame(ADMIN_NAV, "/dashboard/admin/checkout-sessions")}
      title="Encomendas"
      tabs={[{ label: "Todas", href: "#", active: true }, { label: "Aguardam aprovação", href: "#" }, { label: "Em expedição", href: "#" }, { label: "Concluídas", href: "#" }]}
      search={<Field label="Pesquisar encomendas" placeholder="Pesquisar por pedido, cliente ou país" className="mt-0" />}
      exportAction={<PrimaryButton type="button" variant="secondary" className="h-11">Exportar</PrimaryButton>}
      rows={[
        { id: "1", ref: "NV-20418", customer: "Carlos M.", country: "Moçambique", amount: "MZN 4 800", payment: { tone: "success", label: "Confirmado" }, logistics: { tone: "info", label: "Em trânsito" }, action: <a href="#" className="font-semibold text-brand-600">Abrir</a> },
        { id: "2", ref: "NV-20417", customer: "Thandi N.", country: "África do Sul", amount: "R 1 240", payment: { tone: "success", label: "Confirmado" }, logistics: { tone: "success", label: "Entregue" }, action: <a href="#" className="font-semibold text-brand-600">Abrir</a> },
        { id: "3", ref: "NV-20416", customer: "João P.", country: "Angola", amount: "AOA 38 500", payment: { tone: "warning", label: "Aguarda aprovação" }, logistics: { tone: "warning", label: "A preparar" }, action: <a href="#" className="font-semibold text-brand-600">Abrir</a> },
        { id: "4", ref: "NV-20415", customer: "Lina S.", country: "Moçambique", amount: "MZN 2 150", payment: { tone: "danger", label: "Falhou" }, logistics: { tone: "danger", label: "Cancelado" }, action: <a href="#" className="font-semibold text-brand-600">Abrir</a> },
      ]}
    />
  ),
};