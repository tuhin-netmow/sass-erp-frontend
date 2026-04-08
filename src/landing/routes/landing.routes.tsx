/**
 * Landing Page Routes
 * Public marketing pages
 */

import type { RouteObject } from "react-router";

// Import landing pages
import Home from "@/landing/pages/Home";
import Features from "@/landing/pages/Features";
import Pricing from "@/landing/pages/Pricing";
import About from "@/landing/pages/About";
import Contact from "@/landing/pages/Contact";
import Privacy from "@/landing/pages/Privacy";
import Terms from "@/landing/pages/Terms";
import ModuleDocs from "@/landing/pages/ModuleDocs";
import ModulePage from "@/landing/pages/ModulePage";


/**
 * Landing Routes Configuration
 */
export const landingRoutes: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: "features", element: <Features /> },
  { path: "pricing", element: <Pricing /> },
  { path: "about", element: <About /> },
  { path: "contact", element: <Contact /> },
  { path: "privacy", element: <Privacy /> },
  { path: "terms", element: <Terms /> },
  { path: "modules/:module", element: <ModulePage /> },
  { path: "module-docs/:moduleId", element: <ModuleDocs /> },
];
