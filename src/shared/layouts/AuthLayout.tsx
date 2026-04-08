
import Footer from "@/landing/components/shared/Footer";
import Header from "@/landing/components/shared/Header";

import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
