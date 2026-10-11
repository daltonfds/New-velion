"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "newvelion-navigation-stack";
const MAX_STACK = 40;

function isInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export default function NavigationHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const popPending = useRef(false);
  const lastPath = useRef("");

  useEffect(() => {
    function onPopState() {
      popPending.current = true;
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!pathname || !isInternalPath(pathname)) return;

    let stack: string[] = [];
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        stack = parsed.filter((item): item is string =>
          typeof item === "string" && isInternalPath(item)
        );
      }
    } catch {
      stack = [];
    }

    const previous = lastPath.current;
    const returning = popPending.current;
    popPending.current = false;

    if (returning) {
      const currentIndex = stack.lastIndexOf(previous || pathname);
      if (currentIndex >= 0) stack = stack.slice(0, currentIndex);
      else if (stack.length > 0 && stack[stack.length - 1] === pathname) stack.pop();

      const rememberedPrevious = stack[stack.length - 1];
      if (pathname === "/" && rememberedPrevious && rememberedPrevious !== "/") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
        lastPath.current = rememberedPrevious;
        router.replace(rememberedPrevious);
        return;
      }
    } else if (!previous) {
      if (stack[stack.length - 1] !== pathname) stack.push(pathname);
    } else if (previous !== pathname) {
      if (stack[stack.length - 1] !== previous) stack.push(previous);
      if (stack[stack.length - 1] !== pathname) stack.push(pathname);
    }

    stack = stack.slice(-MAX_STACK);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
    lastPath.current = pathname;
  }, [pathname, router]);

  return null;
}
