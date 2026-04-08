interface SubdomainInfo {
  isCompanyPortal: boolean;
  subdomain: string | null;
}

/**
 * Get subdomain information from the current window location
 * 
 * @returns Subdomain information including whether it's a company portal
 */
export function getSubdomainInfo(): SubdomainInfo {
  if (typeof window === "undefined") {
    return { isCompanyPortal: false, subdomain: null };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // Check if we're on a subdomain (not www and not the main domain)
  // Assuming the main domain has at least 2 parts (e.g., example.com)
  // and subdomains would have 3+ parts (e.g., company.example.com)
  if (parts.length >= 3 && parts[0] !== "www") {
    const subdomain = parts[0];
    
    // List of known system subdomains that are NOT company portals
    const systemSubdomains = ["admin", "api", "app", "dev", "staging", "test"];
    
    if (!systemSubdomains.includes(subdomain)) {
      return {
        isCompanyPortal: true,
        subdomain,
      };
    }
  }

  return {
    isCompanyPortal: false,
    subdomain: null,
  };
}
