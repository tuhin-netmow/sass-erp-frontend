import { useEffect } from "react";

type AppSettings = {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  logoUrl: string;
};

export const useAppSettings = (settings: AppSettings | null|undefined) => {
 useEffect(() => {
  if (!settings) return;

  document.title = settings.companyName;

  let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  favicon.href = settings.logoUrl + `?v=${Date.now()}`;
}, [settings]);

};



