import Link from "next/link";
import { PropsWithChildren } from "react";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="page">
      <Link href="/">
        <a className="logo">
          <img src="/logo.png" alt="logo" />
        </a>
      </Link>
      {children}
    </div>
  );
};
