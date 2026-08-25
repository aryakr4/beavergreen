"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useResetHome } from "@/components/ResetBoundary";

export interface HeaderLogoProps {
  logoFontClassName: string;
}

export default function HeaderLogo({ logoFontClassName }: HeaderLogoProps) {
  const pathname = usePathname();
  const resetHome = useResetHome();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      // Already home — a same-route Link navigation wouldn't remount the
      // page, so force a remount to reset local filter state instead.
      e.preventDefault();
      resetHome?.();
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="bevel-raised flex items-center gap-2 rounded-md border border-gold/70 bg-gradient-to-br from-oregon-blue-light via-oregon-blue to-oregon-blue-dark py-1.5 pl-1.5 pr-3"
    >
      <span className="bevel-raised relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gold/80">
        <Image src="/images/logo.jpg" alt="" fill sizes="28px" className="object-cover" />
      </span>
      <span className={`${logoFontClassName} text-emboss text-lg tracking-wide text-gold`}>
        beavergreen
      </span>
    </Link>
  );
}
