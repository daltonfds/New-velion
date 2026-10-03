import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-4 py-10 text-center text-xs text-slate-400">
      <div className="flex items-center justify-center gap-2">
        <span className="flex items-end gap-1">
          <span className="h-3 w-2 rounded-sm bg-[#C99A2E]" />
          <span className="h-4 w-2 rounded-sm bg-[#C99A2E]" />
          <span className="h-5 w-2 rounded-sm bg-[#C99A2E]" />
        </span>

        <span className="text-lg font-black text-[#16294F]">
          Newvelion
        </span>
      </div>

      <div className="mt-4 flex justify-center gap-5">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/support">Support</Link>
      </div>

      <p className="mt-5">
        © 2026 Newvelion. All rights reserved.
      </p>
    </footer>
  );
}
