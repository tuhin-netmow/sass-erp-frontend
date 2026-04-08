
import { Outlet } from "react-router";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";

export default function LandingLayout() {
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