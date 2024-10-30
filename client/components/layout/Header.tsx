import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Header = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("header", className)}>
      <Link href="/">
        <Image
          src="/assets/icons/logo.svg"
          alt="Logo"
          width={130}
          height={32}
          className="hidden md:block"
        />
        <Image
          src="/assets/icons/logo-icon.svg"
          alt="Logo"
          width={32}
          height={32}
          className="block md:hidden"
        />
      </Link>
      {children}
    </div>
  );
};
