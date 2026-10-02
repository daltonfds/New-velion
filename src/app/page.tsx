import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

const steps = [
  {
    number: "1",
    title: "Create your account",
    text: "Free sign-up in under 2 minutes. We automatically detect your country so you get the right payout methods from day one.",
  },
  {
    number: "2",
    title: "Pick products & share",
    text: "Browse the marketplace, see the commission on each product and affiliate in one click. Get a unique link ready to share on WhatsApp and social media.",
  },
  {
    number: "3",
    title: "Get paid",
    text: "Every sale through your link lands in your wallet. Track everything in real time on the dashboard and withdraw anytime by bank transfer or mobile money.",
  },
];

const features = [
  ["stock", "No stock, no shipping.", "The platform handles logistics and delivery."],
  ["checkout", "Ready-made checkout.", "Every product has its own sales page and payment flow."],
  ["cookie", "30-day cookie.", "If the customer buys within 30 days of clicking, the sale is yours."],
  ["dashboard", "Full dashboard.", "Sales, clicks, conversion rate and earnings in real time."],
  ["shield", "Fraud-proof links.", "Fake clicks and self-purchases are blocked automatically."],
];

const tools = [
  ["↗", "Performance charts", "Sales and commissions over time, top products and click-to-sale conversion."],
  ["◎", "Transparent wallet", "Available and held balances, with a detailed statement for every sale and release."],
  ["⛓", "Smart links", "A unique link per product with one-tap sharing to WhatsApp and social media."],
  ["◉", "Real-time notifications", "Know the moment you sell, when a commission is released and when a payout lands."],
];



const faqs = [
  [
    "Do I need to pay anything to start?",
    "No. Sign-up is free with no monthly fees. The platform is funded by a share of each sale's margin — you only earn.",
  ],
  [
    "How long until I receive my commission?",
    "Your commission lands in your wallet as soon as the sale is confirmed. A small portion is held for 7 days as buyer protection and released automatically. Withdrawals take 2 to 30 days depending on the method and country.",
  ],
  [
    "What are the fees?",
    "Per sale, 10% covers the payment gateway fee and 10% is held as buyer protection (released in 7 days). On withdrawal we charge 5% + R10 flat. Everything is shown transparently in your statement.",
  ],
  [
    "What if the customer requests a refund?",
    "The buyer has 7 days of protection. If a refund happens within that window, the matching commission is reversed from your held balance — your available balance is never affected.",
  ],
  [
    "Do I need a registered business?",
    "No. Any adult can sell. To withdraw, simply confirm your personal details (KYC) with the same name as your bank account or mobile wallet.",
  ],
  [
    "Can I sell to customers in another country?",
    "Yes. Delivery is handled by the platform's logistics. You receive your commission in the currency and payout method of your registered country.",
  ],
];

function Icon({ type }: { type: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "stock")
    return (
      <svg {...common}>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </svg>
    );

  if (type === "checkout")
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 14h4" />
        <path d="M7 17h7" />
      </svg>
    );

  if (type === "cookie")
    return (
      <svg {...common}>
        <path d="M20 13a7 7 0 1 1-9-9 5 5 0 0 0 9 9Z" />
        <circle cx="8" cy="14" r="1" />
        <circle cx="11" cy="17" r="1" />
        <circle cx="7" cy="10" r="1" />
      </svg>
    );

  if (type === "dashboard")
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6" height="7" rx="1" />
        <rect x="14" y="4" width="6" height="4" rx="1" />
        <rect x="14" y="12" width="6" height="8" rx="1" />
        <rect x="4" y="15" width="6" height="5" rx="1" />
      </svg>
    );

  return (
    <svg {...common}>
      <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <details className="relative">
              <summary
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Open menu"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                </span>
              </summary>

              <div className="absolute left-0 top-full z-50 mt-2 w-72 border border-slate-200 bg-white p-3">
                <div className="border-b border-slate-100 pb-3">
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8A8570]">
                    Platform
                  </p>

                  <Link href="#how-it-works" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    How it works
                  </Link>
                  <Link href="/marketplace" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Marketplace
                  </Link>
                  <Link href="#seller" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    For Sellers
                  </Link>
                  <Link href="#supplier" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    For Suppliers
                  </Link>
                  <Link href="#earnings" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Earnings
                  </Link>
                </div>

                <div className="border-b border-slate-100 py-3">
                  <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8A8570]">
                    Resources
                  </p>

                  <Link href="#faq" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    FAQ
                  </Link>
                  <Link href="#payouts" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Payouts
                  </Link>
                  <a href="mailto:contact@newvelion.com" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Help Center
                  </a>
                </div>

                <a
                  href="mailto:contact@newvelion.com"
                  className="mt-2 block rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Support
                </a>
              </div>
            </details>

            <Link href="/" aria-label="Newvelion home" className="shrink-0">
              <NewvelionBrand size="sm" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      <section id="earnings" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              Commission-based sales platform
            </p>

            <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-[#16294F] sm:text-6xl lg:text-7xl">
              Sell products.
              <br />
              We handle the rest.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Pick products from the marketplace, share your personal link and
              earn commission on every sale. Payments, buyer protection and
              logistics are on us.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Start selling free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                See how it works
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 border-t border-slate-200 pt-7">
              <div>
                <p className="text-2xl font-bold text-[#16294F]">12+</p>
                <p className="mt-1 text-xs text-slate-500">active products</p>
              </div>
              <div className="border-l border-slate-200 pl-5">
                <p className="text-2xl font-bold text-[#16294F]">Up to 30%</p>
                <p className="mt-1 text-xs text-slate-500">commission</p>
              </div>
              <div className="border-l border-slate-200 pl-5">
                <p className="text-2xl font-bold text-[#16294F]">2</p>
                <p className="mt-1 text-xs text-slate-500">countries</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full border border-slate-200 bg-[#f7f8fa] p-4 sm:p-6">
              <div className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Dashboard
                    </p>
                    <p className="mt-1 text-base font-bold text-[#16294F]">
                      Dalton · Seller 🇲🇿
                    </p>
                  </div>
                  <span className="border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Live
                  </span>
                </div>

                <div className="p-5">
                  <div className="border border-slate-200 p-5">
                    <p className="text-xs font-medium text-slate-500">
                      Available balance
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-[#16294F]">
                      R4,275
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Sales (30d)</p>
                      <p className="mt-2 text-xl font-bold text-[#16294F]">
                        38
                      </p>
                    </div>
                    <div className="border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Commissions (30d)</p>
                      <p className="mt-2 text-xl font-bold text-[#16294F]">
                        R6,120
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Sales performance
                      </p>
                      <span className="text-xs font-semibold text-[#8A8570]">
                        30 days
                      </span>
                    </div>
                    <div className="mt-6 flex h-28 items-end gap-1.5">
                      {[30, 42, 36, 53, 48, 68, 59, 76, 70, 91, 82, 100].map(
                        (height, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-blue-600"
                            style={{ height: `${height}%` }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-slate-200 bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
              Three steps between you and your first commission.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border border-slate-200 bg-white p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-7 text-xl font-bold text-[#16294F]">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              How much can you earn
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
              No monthly fees.
              <br />
              You earn per sale.
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              No complicated subscriptions. You earn a commission when your
              customer buys through your personal link.
            </p>
          </div>

          <div className="border border-slate-200">
            <div className="border-b border-slate-200 bg-[#f7f8fa] px-6 py-4">
              <p className="text-sm font-bold text-[#16294F]">
                Earnings simulator
              </p>
              <p className="mt-1 text-xs text-slate-500">
                See exactly what lands in your wallet per sale.
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sale value
                </p>
                <p className="mt-2 text-2xl font-bold text-[#16294F]">
                  R1,000
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product commission
                </p>
                <p className="mt-2 text-2xl font-bold text-[#16294F]">25%</p>
              </div>
              <div className="border-t border-slate-200 pt-5">
                <p className="text-xs text-slate-500">Gross commission</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  R250.00
                </p>
              </div>
              <div className="border-t border-slate-200 pt-5">
                <p className="text-xs text-slate-500">
                  Withdrawal fee (5% + R10)*
                </p>
                <p className="mt-1 text-lg font-bold text-slate-700">
                  −R22.50
                </p>
              </div>
              <div className="border-t border-slate-200 pt-5 sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500">
                  You receive per sale
                </p>
                <p className="mt-1 text-3xl font-bold text-[#16294F]">
                  R227.50
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  *The withdrawal fee applies only when you withdraw. R4,000/month
                  in sales at 25% ≈ R910.00 net.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-slate-200 px-5 py-14 lg:px-8">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, title, text]) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 text-[#16294F]">
                  <Icon type={icon} />
                </div>
                <div>
                  <h3 className="font-bold text-[#16294F]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              Built for commerce
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
              One platform. Two ways to grow.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              NewVelion brings sellers and suppliers together in one connected
              commerce ecosystem.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div id="seller" className="border border-slate-200 bg-[#f7f8fa] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                For Sellers
              </p>
              <h3 className="mt-4 text-2xl font-bold text-[#16294F]">
                Sell without holding stock.
              </h3>
              <p className="mt-4 leading-7 text-slate-600">
                Browse products, choose what you want to promote, get your
                personal affiliate link and earn a commission when customers
                buy through you.
              </p>

              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                <li>✓ Product marketplace with transparent commissions</li>
                <li>✓ Personal tracking and sales links</li>
                <li>✓ Sales, clicks and conversion analytics</li>
                <li>✓ Wallet and withdrawal management</li>
              </ul>

              <Link
                href="/register"
                className="mt-8 inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Start selling
              </Link>
            </div>

            <div id="supplier" className="border border-slate-200 bg-white p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                For Suppliers
              </p>
              <h3 className="mt-4 text-2xl font-bold text-[#16294F]">
                Turn products into a sales network.
              </h3>
              <p className="mt-4 leading-7 text-slate-600">
                Add your products, define pricing and commissions, provide
                checkout information and let sellers promote your catalog.
              </p>

              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                <li>✓ Manage products, prices and stock</li>
                <li>✓ Set commissions for sellers</li>
                <li>✓ Track orders and product performance</li>
                <li>✓ Manage settlements and withdrawals</li>
              </ul>

              <a
                href="mailto:contact@newvelion.com"
                className="mt-8 inline-flex items-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600"
              >
                Talk to NewVelion
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="payouts" className="border-b border-slate-200 bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              How NewVelion works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
              One platform. The entire commerce flow.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              NewVelion connects products, sellers, suppliers and customers in
              one simple system — from discovery to payout.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-4">
            {[
              ["01", "Discover", "Find products with clear pricing, offers and affiliate commissions."],
              ["02", "Promote", "Choose products and get your unique sales links and promotional assets."],
              ["03", "Sell", "Share your links and turn your audience into measurable customers."],
              ["04", "Earn", "Track clicks, conversions, sales and commissions from your dashboard."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="group bg-white p-7 transition-colors hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600">{number}</span>
                  {number !== "04" && (
                    <span className="hidden text-xl text-slate-300 md:block">→</span>
                  )}
                </div>

                <h3 className="mt-12 text-xl font-bold text-[#16294F]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-between gap-5 border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-[#16294F]">
                Built for the whole commerce ecosystem.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Suppliers provide the products. Sellers create demand.
                NewVelion connects the two.
              </p>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Explore marketplace →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
            Withdraw your way, in your country
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
            Payout methods configured for your location
          </h2>
          <p className="mt-4 text-slate-600">
            Processed within 2 to 30 days.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="border border-slate-200 bg-white p-7">
              <h3 className="text-xl font-bold text-[#16294F]">
                🇿🇦 South Africa
              </h3>
              <div className="mt-7 space-y-5">
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">BANK</span>
                  <div>
                    <p className="font-semibold text-slate-800">Bank transfer</p>
                    <p className="mt-1 text-sm text-slate-500">
                      All major banks, credited within 30 days
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">KYC</span>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Account holder verification
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Account holder name must match your verified profile
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">ZAR</span>
                  <div>
                    <p className="font-semibold text-slate-800">
                      South African Rand
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Earnings in ZAR
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-7">
              <h3 className="text-xl font-bold text-[#16294F]">
                🇲🇿 Mozambique
              </h3>
              <div className="mt-7 space-y-5">
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">BANK</span>
                  <div>
                    <p className="font-semibold text-slate-800">Bank transfer</p>
                    <p className="mt-1 text-sm text-slate-500">
                      NIB, credited within 30 days
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">M</span>
                  <div>
                    <p className="font-semibold text-slate-800">M-Pesa</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Straight to your mobile number
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">e</span>
                  <div>
                    <p className="font-semibold text-slate-800">e-Mola</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Straight to your mobile number
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-[#8A8570]">MZN</span>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Mozambican Metical
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Earnings in MZN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
              Platform
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16294F] sm:text-4xl">
              Everything under control, in one panel
            </h2>
            <p className="mt-4 text-slate-600">
              Business-grade tools to run your sales like a company.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {tools.map(([symbol, title, text]) => (
              <div key={title} className="border-t border-slate-200 pt-6">
                <span className="text-2xl font-light text-[#8A8570]">
                  {symbol}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#16294F]">
                  {title}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#8A8570]">
            Frequently asked questions
          </p>

          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-[#16294F]">
                  <span>{question}</span>
                  <span className="text-xl font-normal text-slate-400 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pr-8 text-sm leading-7 text-slate-600">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
            Start selling
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your first commission is one click away
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Free sign-up, no credit card. Pick a product now and start sharing
            today.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-[#16294F] hover:bg-slate-100"
          >
            Create free account →
          </Link>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_.6fr_.8fr]">
            <div>
              <NewvelionBrand size="md" showTagline={false} />
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                The commission-based commerce platform for South Africa and
                Mozambique. Sell without stock, get paid without hassle.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#16294F]">Platform</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <a href="#how-it-works" className="hover:text-blue-600">
                  How it works
                </a>
                <a href="#how-it-works" className="hover:text-blue-600">
                  Earnings simulator
                </a>
                <a href="#how-it-works" className="hover:text-blue-600">
                  Payout methods
                </a>
                <a href="#how-it-works" className="hover:text-blue-600">
                  FAQ
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#16294F]">Contact</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <a href="mailto:contact@newvelion.com" className="hover:text-blue-600">
                  ✉ contact@newvelion.com
                </a>
                <a
                  href="https://instagram.com/newvelion"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600"
                >
                  ◈ Instagram @newvelion
                </a>
                <a href="tel:+27722958915" className="hover:text-blue-600">
                  ☏ +27 72 295 8915
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Newvelion · Commerce Infrastructure</span>
            <div className="flex gap-5">
              <Link href="/terms" className="hover:text-blue-600">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-blue-600">
                Privacy
              </Link>
              <a href="mailto:contact@newvelion.com" className="hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
