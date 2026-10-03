import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/marketplace"
          className="flex items-center gap-3"
        >
          <span className="flex items-end gap-1" aria-hidden="true">
            <span className="h-3 w-2 rounded-sm bg-[#C99A2E]" />
            <span className="h-4 w-2 rounded-sm bg-[#C99A2E]" />
            <span className="h-5 w-2 rounded-sm bg-[#C99A2E]" />
          </span>

          <span className="text-lg font-black tracking-tight text-[#16294F]">
            Newvelion
          </span>
        </Link>

        <Link
          href="/marketplace"
          className="text-xs font-bold text-[#16294F]"
        >
          Marketplace
        </Link>
      </div>
    </header>
  );
}
