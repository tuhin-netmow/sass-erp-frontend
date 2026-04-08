import { Link, useParams } from "react-router";
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Code, Server, FileText, CheckCircle } from "lucide-react";
import { MermaidDiagram } from "@/shared/components/ui/mermaid-diagram";


const ModuleDocs = () => {
  const { moduleId } = useParams();

  // Complete API documentation for all modules
  const moduleDocs: Record<string, any> = {
    home: {
      name: "Home / Landing Page",
      icon: "🏠",
      description: "Main landing page with pricing plans and features",
      section: "Home & Registration",
      color: "blue",
      ui: {
        component: "App.tsx (Landing Page)",
        file: "/src/App.tsx",
        description: "Main landing page displaying pricing plans, features, and call-to-action buttons",
        code: `// App.tsx Landing Page
const App = () => {
  const { data: plansData } = useGetPublicPlansQuery();

  return (
    <div>
      {/* Hero Section */}
      <h1>ERP SAAS Solution</h1>

      {/* Pricing Cards */}
      {plansData?.data.map(plan => (
        <PricingCard
          key={plan.id}
          plan={plan}
          onSelect={handleSelectPlan}
        />
      ))}

      {/* Features */}
      <FeaturesSection />
    </div>
  );
};`,
        imports: [
          "useGetPublicPlansQuery - Fetch subscription plans",
          "Link - Navigation",
          "useState - Manage selected plan"
        ],
        state: {
          selectedPlan: "Currently selected plan object",
          selectedCycle: "billing cycle (monthly/yearly/etc)",
          loading: "API loading state"
        }
      },
      api: {
        endpoint: "GET /api/v1/saas/plans",
        description: "Fetch all public subscription plans",
        method: "GET",
        auth: false,
        request: "None (public endpoint)",
        response: {
          status: true,
          data: [
            {
              id: 16,
              name: "Starter",
              price: "0.00",
              features: {
                max_products: 50,
                max_users: 2,
                max_staff: 2,
                modules: ["products", "sales", "customers"]
              },
              stripe_price_id: null,
              is_active: true
            },
            {
              id: 22,
              name: "Professional",
              price: "99.00",
              features: {
                max_products: 1000,
                max_users: 20,
                max_staff: null,
                modules: ["products", "sales", "customers", "accounting"]
              },
              stripe_price_id: "price_...",
              is_active: true
            }
          ]
        }
      },
      page: {
        purpose: "Public landing page for marketing and plan selection",
        features: [
          "Display subscription plans",
          "Show pricing and features",
          "Plan comparison",
          "Call-to-action buttons",
          "Feature highlights"
        ],
        access: "Public (no authentication required)",
        route: "/",
        nextSteps: [
          "User clicks 'Choose Plan' button",
          "Redirected to /register?plan=PlanName",
          "Or directly navigates to /register"
        ]
      }
    },

    login: {
      name: "Login Page",
      icon: "🔐",
      description: "User authentication with subdomain routing",
      section: "Home & Registration",
      color: "blue",
      ui: {
        component: "Login.tsx",
        file: "/src/pages/auth/Login.tsx",
        description: "Login form with email/password authentication",
        code: `// Login.tsx
const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email,
        password
      }).unwrap();

      // Store token
      localStorage.setItem('auth_token', result.token);

      // Get company domain from result
      const companyDomain = result.company.domain;

      // Redirect to subdomain
      window.location.href = \`http://\${companyDomain}\`;
    } catch (error) {
      toast.error('Login failed');
    }
  };
};`,
        imports: [
          "useLoginMutation - Login API call",
          "useNavigate - Navigation",
          "toast - Notifications"
        ],
        state: {
          email: "User email input",
          password: "User password input",
          loading: "API loading state",
          error: "Error message"
        }
      },
      api: {
        endpoint: "POST /api/v1/auth/login",
        description: "Authenticate user and receive JWT token",
        method: "POST",
        auth: false,
        request: {
          email: "user@example.com",
          password: "UserPassword123!"
        },
        response: {
          success: true,
          message: "Login successful",
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
              id: 1,
              name: "John Doe",
              email: "user@example.com",
              roleId: 1,
              companyId: 1082
            },
            company: {
              id: 1082,
              name: "Acme Corp",
              domain: "acme-corp.lvh.me"
            }
          }
        }
      },
      page: {
        purpose: "Authenticate existing users and route to their subdomain",
        features: [
          "Email/password authentication",
          "Subdomain routing",
          "Remember me option",
          "Forgot password link",
          "Registration link"
        ],
        access: "Public",
        route: "/login",
        flow: [
          "1. User enters credentials",
          "2. API validates credentials",
          "3. Returns JWT token + company domain",
          "4. Stores token in localStorage",
          "5. Redirects to company subdomain"
        ]
      }
    },

    authState: {
      name: "Redux Auth State",
      icon: "🗃️",
      description: "Authentication state management with company info",
      section: "Home & Registration",
      color: "purple",
      ui: {
        component: "authSlice.ts",
        file: "/src/store/features/auth/authSlice.ts",
        code: `// authSlice.ts - Recent Updates
interface AuthState {
  user: User | null;
  token: string | null;
  company: any | null;  // 🆕 NEW
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get("token") ?? null,
  company: null,  // 🆕 NEW
};

// 🆕 UPDATED: Now accepts company
setCredentials: (
  state,
  action: PayloadAction<{ user: User; token: string; company?: any }>
) => {
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.company = action.payload.company || null;  // 🆕 NEW
  Cookies.set('token', action.payload.token);

  // 🆕 Store company domain in cookie
  if (action.payload.company?.domain) {
    Cookies.set('company_domain', action.payload.company.domain);
  }
},

// 🆕 UPDATED: Clears company on logout
logout: (state) => {
  state.user = null;
  state.token = null;
  state.company = null;  // 🆕 NEW
  Cookies.remove('token');
  Cookies.remove('company_domain');  // 🆕 NEW
}`,
        description: "Redux authentication state with company domain support",
        recentUpdates: [
          "🆕 Added 'company' field to AuthState interface",
          "🆕 Updated setCredentials to accept and store company",
          "🆕 Company domain stored in cookies for persistence",
          "🆕 Updated logout to clear company information",
          "🔧 Enhanced state management for multi-tenant support"
        ]
      },
      api: {
        endpoint: "N/A (Redux State)",
        description: "Client-side state management",
        method: "N/A"
      },
      page: {
        purpose: "Manage authentication state with company domain",
        features: [
          "Store user authentication data",
          "Store JWT token",
          "🆕 Store company information including domain",
          "🆕 Persist company domain in cookies",
          "🆕 Clear all auth data on logout",
          "Support for multi-tenant subdomain routing"
        ],
        access: "N/A (State Management)",
        stateStructure: {
          authState: {
            user: {
              id: 1,
              name: "John Doe",
              email: "john@acmecorp.com",
              roleId: 1,
              companyId: 1082
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            company: {
              id: 1082,
              name: "Acme Corporation",
              domain: "acme-corp.lvh.me",
              plan_id: 22,
              db_type: "dedicated"
            }
          },
          cookies: {
            token: "JWT authentication token",
            company_domain: "acme-corp.lvh.me"
          }
        },
        diagrams: {
          authFlow: `graph TD
    A[Action: setCredentials] -->|Payload| B{user, token, company?}
    B --> C[Update Redux State]
    C --> D[state.user = user]
    C --> E[state.token = token]
    C --> F[state.company = company]

    D --> G[Persist]
    E --> H[Set Cookie: token]
    F --> I{Has company.domain?}
    I -->|Yes| J[Set Cookie: company_domain]
    I -->|No| K[Skip]

    style A fill:#e3f2fd
    style C fill:#fff9c4
    style H fill:#c8e6c9
    style J fill:#c8e6c9`,
          logoutFlow: `graph TD
    A[Action: logout] --> B[Clear Redux State]
    B --> C[state.user = null]
    B --> D[state.token = null]
    B --> E[state.company = null]

    C --> F[Clear Cookies]
    D --> G[Remove Cookie: token]
    E --> H[Remove Cookie: company_domain]

    F --> I[Navigate to Login]
    I --> J[User Logged Out]

    style A fill:#ffebee
    style B fill:#fff9c4
    style G fill:#ffcdd2
    style H fill:#ffcdd2`
        }
      }
    },

    register: {
      name: "Registration Page",
      icon: "📝",
      description: "Company registration with plan selection",
      section: "Home & Registration",
      color: "blue",
      ui: {
        component: "Register.tsx (Layout) + TenantOnboardForm.tsx (Form)",
        file: "/src/pages/auth/Register.tsx",
        description: "Multi-step registration with Stripe checkout",
        code: `// Register.tsx
const RegisterPage = () => {
  const { data: plansData } = useGetPublicPlansQuery();
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan');

  const selectedPlan = plansData?.data?.find(p =>
    p.id === planId
  );

  return (
    <div>
      {/* Plan Summary Sidebar */}
      <PlanSummary plan={selectedPlan} />

      {/* Registration Form */}
      <TenantOnboardForm
        planId={selectedPlan?.id}
        cycle="monthly"
      />
    </div>
  );
};

// TenantOnboardForm.tsx
const TenantOnboardForm = ({ planId, cycle }) => {
  const [onboard, { isLoading }] = useAuthOnboardMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await onboard({
        companyName,
        adminEmail,
        adminPassword,
        planId,
        cycle
      }).unwrap();

      // Redirect to Stripe or complete
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        // Free plan - auto login
        localStorage.setItem('auth_token', result.token);
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed');
    }
  };
};`,
        imports: [
          "useGetPublicPlansQuery - Fetch plans",
          "useAuthOnboardMutation - Registration API",
          "useState - Form data"
        ],
        state: {
          companyName: "Company name input",
          adminEmail: "Admin email input",
          adminPassword: "Password input",
          confirmPassword: "Password confirmation",
          selectedPlan: "Chosen subscription plan"
        }
      },
      api: {
        endpoint: "POST /api/v1/auth/onboard",
        description: "Initiate company registration with Stripe checkout",
        method: "POST",
        auth: false,
        request: {
          companyName: "Acme Corporation",
          adminEmail: "admin@acmecorp.com",
          adminPassword: "SecurePass123!",
          planId: 22,
          cycle: "monthly"
        },
        response: {
          success: true,
          message: "Registration initiated. Complete checkout to activate.",
          data: {
            checkoutUrl: "https://checkout.stripe.com/...",
            pendingId: 123,
            securityToken: "abc123..."
          }
        }
      },
      page: {
        purpose: "Register new companies with payment verification and subdomain setup",
        features: [
          "Plan selection from URL",
          "Plan summary display",
          "Company information form",
          "Admin account creation",
          "Stripe checkout redirect",
          "Automatic subdomain generation",
          "Dedicated database setup for Enterprise"
        ],
        access: "Public",
        route: "/register?plan=Professional&cycle=monthly",
        flow: [
          "1. User selects plan on home page",
          "2. Redirected to /register with plan params",
          "3. Fills company and admin info",
          "4. Submits form",
          "5. Backend generates company domain (e.g., 'acme-corp.lvh.me')",
          "6. Backend creates pending registration",
          "7. Backend creates Stripe checkout session",
          "8. Redirected to Stripe for payment",
          "9. Stripe webhook creates actual account",
          "10. Backend creates dedicated database (Enterprise) or uses shared (Starter/Pro)",
          "11. Backend creates admin user and company record",
          "12. Redirected to /registration/success?token=xxx",
          "13. Frontend completes registration",
          "14. 🎯 Redirects to company subdomain: http://acme-corp.lvh.me:5173/dashboard"
        ],
        subdomainGeneration: {
          description: "Company domain is automatically generated from company name",
          examples: [
            "Acme Corporation → acme-corp.lvh.me",
            "Tech Startup → tech-startup.lvh.me",
            "Retail Store → retail-store.lvh.me",
            "Khairul IT Solution → khairul-it-solution.lvh.me"
          ],
          format: "{company-name-slug}.lvh.me (local) or {company-name-slug}.yourapp.com (production)",
          baseDomain: "lvh.me (local testing - resolves to 127.0.0.1)"
        },
        databaseTypes: {
          starter: {
            plan: "Starter (Free)",
            dbType: "shared",
            database: "erp_data",
            description: "Shares database with other Starter companies"
          },
          professional: {
            plan: "Professional ($99/mo)",
            dbType: "shared",
            database: "erp_data",
            description: "Shares database with other Professional companies"
          },
          enterprise: {
            plan: "Enterprise ($299/mo)",
            dbType: "dedicated",
            database: "company_{id}_db",
            description: "Own dedicated database for complete data isolation"
          }
        },
        diagrams: {
          registrationFlow: `graph TD
    A["User on Home Page"] -->|"Select Plan"| B["Redirect to /register"]
    B -->|"plan=Professional&cycle=monthly"| C["Registration Form"]
    C -->|"Fill Company Info"| D["Submit Form"]
    D -->|"POST /api/v1/auth/onboard"| E["Backend Processing"]
    E -->|"Generate Domain"| F["acme-corp.lvh.me"]
    E -->|"Create Pending"| G["PendingRegistration"]
    E -->|"Stripe Session"| H["Stripe Checkout"]
    H -->|"Payment"| I["Stripe Webhook"]
    I -->|"Payment Success"| J["Create Account"]
    J -->|"Plan Type"| K{"Database Type"}
    K -->|"Starter/Pro"| L["Shared DB: erp_data"]
    K -->|"Enterprise"| M["Dedicated DB: company_1082_db"]
    J -->|"Create User"| N["Admin User"]
    J -->|"Create Company"| O["Company Record"]
    I -->|"Redirect"| P["/registration/success?token=xxx"]
    P -->|"Complete Registration"| Q["API Call"]
    Q -->|"Store Credentials"| R["Redux State"]
    Q -->|"Get Domain"| S["company.domain"]
    S -->|"2s Delay"| T["Show Toast: Redirecting..."]
    T -->|"Redirect"| U["http://acme-corp.lvh.me:5173/dashboard"]
    U -->|"Success"| V["User on Company Subdomain"]

    style A fill:#e3f2fd
    style V fill:#c8e6c9
    style U fill:#fff9c4
    style M fill:#f3e5f5`,
          subdomainGeneration: `graph LR
    A["Company Name"] -->|"Slugify"| B["company-name-slug"]
    B -->|"Add Domain"| C["lvh.me - Local"]
    B -->|"Add Domain"| D["yourapp.com - Production"]
    C -->|"Result"| E["acme-corp.lvh.me"]
    D -->|"Result"| F["acme-corp.yourapp.com"]

    style A fill:#e3f2fd
    style C fill:#fff9c4
    style D fill:#ffccbc
    style E fill:#c8e6c9
    style F fill:#c8e6c9`,
          databaseDecision: `graph TD
    A["User Selects Plan"] --> B{"Plan Type"}
    B -->|"Starter Free"| C["Shared Database"]
    B -->|"Professional 99"| C
    B -->|"Enterprise 299"| D["Dedicated Database"]

    C --> E["erp_data Database"]
    E --> F["Filter by companyId"]
    F --> G["Data Isolation at Row Level"]

    D --> H["company_1082_db"]
    D --> I["company_1083_db"]
    D --> J["company_1084_db"]
    H --> K["Complete Physical Isolation"]
    I --> K
    J --> K

    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style E fill:#fff9c4
    style H fill:#c8e6c9
    style I fill:#c8e6c9
    style J fill:#c8e6c9
    style K fill:#a5d6a7`
        }
      }
    },

    success: {
      name: "Registration Success & Subdomain Redirect",
      icon: "✅",
      description: "Success page with subdomain redirect after Stripe checkout",
      section: "Home & Registration",
      color: "blue",
      ui: {
        component: "RegistrationSuccess.tsx",
        file: "/src/pages/auth/RegistrationSuccess.tsx",
        code: `// RegistrationSuccess.tsx
const RegistrationSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const completeRegistration = async () => {
      const response = await fetch('/api/v1/auth/complete-registration', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
      const result = await response.json();

      if (result.status) {
        setStatus('success');
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
          company: result.data.company
        }));

        // 🎯 REDIRECT TO COMPANY SUBDOMAIN
        const companyDomain = result.data.company?.domain;
        if (companyDomain) {
          toast.info(\`Redirecting to \${companyDomain}...\`);
          setTimeout(() => {
            window.location.href = \`http://\${companyDomain}:5173/dashboard\`;
          }, 2000);
        }
      }
    };
    completeRegistration();
  }, [token]);

  return status === 'loading' ? <Loader /> : <SuccessMessage />;
};`,
        description: "Success page that completes registration and redirects to company subdomain",
        recentUpdates: [
          "🆕 Subdomain redirect: Users now redirected to their company domain",
          "🆕 Company info stored in Redux state and cookies",
          "🆕 Enhanced success message with redirect notification",
          "🔧 Auth state now includes company field"
        ]
      },
      api: {
        endpoint: "POST /api/v1/auth/complete-registration",
        description: "Complete registration using security token, receive company info",
        method: "POST",
        auth: false,
        request: {
          token: "security_token_from_webhook"
        },
        response: {
          status: true,
          message: "Registration completed successfully",
          data: {
            user: {
              id: 1,
              name: "John Doe",
              email: "john@acmecorp.com",
              companyId: 1082
            },
            company: {
              id: 1082,
              name: "Acme Corporation",
              domain: "acme-corp.lvh.me",
              plan_id: 22,
              db_type: "dedicated"
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      },
      page: {
        purpose: "Complete registration and redirect to company subdomain",
        features: [
          "Security token validation",
          "Complete registration in backend",
          "Store user, token, and company in Redux",
          "Show success message",
          "Auto-redirect to company subdomain after 2 seconds",
          "Fallback to local dashboard if no domain"
        ],
        access: "Public (with security token)",
        route: "/registration/success?token=xxx",
        flow: [
          "1. Stripe webhook redirects here with token",
          "2. Frontend calls complete-registration API",
          "3. Backend validates token and creates account",
          "4. Backend returns: user, company, token",
          "5. Frontend stores credentials in Redux",
          "6. Extracts company domain from response",
          "7. Shows toast: 'Redirecting to acme-corp.lvh.me...'",
          "8. Redirects to: http://acme-corp.lvh.me:5173/dashboard",
          "9. User is now on their dedicated subdomain!"
        ],
        redirectFlow: {
          from: "http://localhost:5173/registration/success?token=xxx",
          to: "http://acme-corp.lvh.me:5173/dashboard",
          delay: "2 seconds",
          fallback: "http://localhost:5173/dashboard (if no domain)"
        },
        diagrams: {
          redirectProcess: `sequenceDiagram
    participant User
    participant Frontend as Frontend<br/>(/registration/success)
    participant API as Backend API
    participant Redux as Redux Store
    participant Browser as Browser

    User->>Frontend: Lands on success page with token
    Frontend->>Frontend: Extract token from URL
    Frontend->>API: POST /api/v1/auth/complete-registration
    API->>API: Validate security token
    API->>API: Create/update user account
    API->>API: Get company info with domain
    API-->>Frontend: { user, company: { domain }, token }

    Frontend->>Redux: dispatch(setCredentials)
    Redux->>Redux: Store user, token, company
    Redux->>Browser: Set cookies (token, company_domain)

    Frontend->>Frontend: Extract company.domain
    Frontend->>User: Toast: "Redirecting to acme-corp.lvh.me..."
    Frontend->>Frontend: setTimeout(2s)
    Frontend->>Browser: window.location.href = http://acme-corp.lvh.me:5173/dashboard
    Browser->>User: Navigates to company subdomain

    Note over User,User: User now on their dedicated subdomain`,
          authStateFlow: `graph TD
    A[Registration Success Page] -->|API Response| B[Data Object]
    B --> C{User Object}
    B --> D{Token Object}
    B --> E{Company Object}

    C --> F[id, name, email, roleId]
    D --> G[JWT Token]
    E --> H[id, name, domain, plan_id]

    F --> I[Redux: user]
    G --> J[Redux: token]
    H --> K[Redux: company]

    I --> L[Cookies: token]
    J --> L
    H --> M[Cookies: company_domain]

    K --> N[Extract domain]
    N --> O{Has Domain?}
    O -->|Yes| P[Redirect to Subdomain]
    O -->|No| Q[Redirect to /dashboard]

    P --> R[http://acme-corp.lvh.me:5173/dashboard]
    Q --> S[http://localhost:5173/dashboard]

    style A fill:#e3f2fd
    style R fill:#c8e6c9
    style S fill:#fff9c4`
        }
      }
    },

    dashboard: {
      name: "Dashboard",
      icon: "📊",
      description: "Main analytics dashboard",
      section: "Dashboard",
      color: "indigo",
      ui: {
        component: "Dashboard.tsx",
        file: "/src/pages/dashboard/Dashboard.tsx",
        code: `// Dashboard.tsx
const Dashboard = () => {
  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: recentOrders } = useGetRecentOrdersQuery();

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value={stats?.totalSales}
          icon={DollarSign}
        />
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders}
          icon={ShoppingCart}
        />
        {/* ... more KPIs */}
      </div>

      {/* Charts */}
      <SalesChart data={stats?.salesData} />

      {/* Recent Orders Table */}
      <RecentOrders orders={recentOrders} />
    </div>
  );
};`,
        imports: [
          "useGetStatsQuery - Dashboard statistics",
          "useGetRecentOrdersQuery - Recent activity",
          "KPICard, SalesChart - Components"
        ],
        state: {
          stats: "Dashboard statistics object",
          recentOrders: "Recent orders array",
          dateRange: "Selected date range filter"
        }
      },
      api: {
        endpoint: "GET /api/v1/dashboard/stats",
        description: "Fetch dashboard statistics and KPIs",
        method: "GET",
        auth: true,
        response: {
          totalSales: 125000,
          totalOrders: 450,
          totalCustomers: 120,
          totalProducts: 85,
          recentOrders: "Array of recent order objects",
          salesData: {
            monthly: "Array of monthly sales figures",
            orders: "Array of order counts"
          }
        }
      },
      page: {
        purpose: "Primary business overview dashboard",
        features: [
          "KPI cards (Sales, Orders, Customers, Products)",
          "Sales trend charts",
          "Recent orders table",
          "Quick action buttons",
          "Date range filters"
        ],
        access: "Authenticated users",
        route: "/dashboard"
      }
    },

    "products-list": {
      name: "Products List",
      icon: "📦",
      description: "Browse and manage product catalog",
      section: "Products",
      color: "green",
      ui: {
        component: "Products.tsx",
        file: "/src/pages/products/Products.tsx",
        code: `// Products.tsx
const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetProductsQuery({
    page,
    limit: 10,
    search
  });
  const [deleteProduct] = useDeleteProductMutation();

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchBar
        onSearch={setSearch}
        filters={categoryFilters}
      />

      {/* Products Table */}
      <Table
        columns={columns}
        data={data?.data}
        pagination={{
          total: data?.total,
          page,
          onChange: setPage
        }}
        actions={(product) => (
          <>
            <Link to={\`/dashboard/products/edit/\${product.id}\`}>
              Edit
            </Link>
            <button onClick={() => deleteProduct(product.id)}>
              Delete
            </button>
          </>
        )}
      />
    </div>
  );
};`,
        imports: [
          "useGetProductsQuery - Fetch products",
          "useDeleteProductMutation - Delete product",
          "Table - Data table component"
        ],
        state: {
          products: "Products array",
          search: "Search query string",
          page: "Current page number",
          filters: "Active filters object"
        }
      },
      api: {
        endpoint: "GET /api/v1/products",
        description: "Fetch products with pagination and filtering",
        method: "GET",
        auth: true,
        request: "?page=1&limit=10&search=laptop&category=electronics",
        response: {
          data: [
            {
              id: 1,
              name: "Laptop Pro",
              sku: "LP-001",
              price: 999.99,
              category: "Electronics",
              stock: 50,
              image: "https://..."
            }
          ],
          total: 100,
          page: 1,
          limit: 10
        }
      },
      page: {
        purpose: "Browse and manage the entire product catalog",
        features: [
          "Search products by name/SKU",
          "Filter by category",
          "Sort by price, name, stock",
          "Pagination",
          "Bulk actions",
          "Export to CSV"
        ],
        access: "Authenticated users",
        route: "/dashboard/products"
      }
    },

    "products-create": {
      name: "Add Product",
      icon: "➕",
      description: "Create new products",
      section: "Products",
      color: "green",
      ui: {
        component: "CreateProduct.tsx",
        file: "/src/pages/products/create",
        code: `// CreateProduct.tsx
const CreateProduct = () => {
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (formData) => {
    try {
      const result = await createProduct(formData).unwrap();
      toast.success('Product created successfully');
      navigate('/dashboard/products');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode="create"
    />
  );
};

// ProductForm.tsx
const ProductForm = ({ onSubmit, isLoading }) => {
  return (
    <Form onSubmit={onSubmit}>
      <Input name="name" label="Product Name" required />
      <Input name="sku" label="SKU" required />
      <Input name="price" type="number" label="Price" required />
      <Select name="category" label="Category" options={categories} />
      <Textarea name="description" label="Description" />
      <FileUpload name="images" label="Product Images" multiple />
      <Button type="submit" loading={isLoading}>
        Create Product
      </Button>
    </Form>
  );
};`,
        imports: [
          "useCreateProductMutation - Create API",
          "useGetCategoriesQuery - Category options",
          "ProductForm - Reusable form component"
        ],
        state: {
          formData: "Product form data object",
          images: "Uploaded images array",
          variations: "Product variations (if any)"
        }
      },
      api: {
        endpoint: "POST /api/v1/products",
        description: "Create a new product",
        method: "POST",
        auth: true,
        request: {
          name: "Wireless Mouse",
          sku: "WM-001",
          price: 29.99,
          category_id: 5,
          description: "Ergonomic wireless mouse",
          stock: 100,
          images: ["https://..."],
          variations: [
            { color: "black", sku: "WM-001-BLK" },
            { color: "white", sku: "WM-001-WHT" }
          ]
        },
        response: {
          id: 123,
          name: "Wireless Mouse",
          sku: "WM-001",
          price: 29.99,
          created_at: "2026-03-17T10:30:00Z"
        }
      },
      page: {
        purpose: "Add new products to the catalog",
        features: [
          "Basic information (name, SKU, price)",
          "Category selection",
          "Stock management",
          "Image upload (multiple)",
          "Product variations (color, size)",
          "Description with rich text"
        ],
        access: "Authenticated users",
        route: "/dashboard/products/create"
      }
    },

    customers: {
      name: "Active Customers",
      icon: "✅",
      description: "View and manage customers",
      section: "Customers",
      color: "pink",
      ui: {
        component: "Customers.tsx",
        file: "/src/pages/customer/Customers.tsx",
        code: `// Customers.tsx
const Customers = () => {
  const { data, isLoading } = useGetActiveCustomersQuery({
    page: 1,
    limit: 10
  });

  return (
    <div>
      <div className="flex justify-between">
        <h2>Active Customers</h2>
        <Link to="/dashboard/customers/create">
          <Button>Add Customer</Button>
        </Link>
      </div>

      <Table
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Email', accessor: 'email' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Company', accessor: 'company' },
          { header: 'Actions', render: (row) => (
            <Link to={\`/customers/\${row.id}\`}>View</Link>
          )}
        ]}
        data={data?.data}
      />
    </div>
  );
};`,
        imports: [
          "useGetActiveCustomersQuery - Fetch customers",
          "Table - Data table component"
        ],
        state: {
          customers: "Customers array",
          pagination: "Page info"
        }
      },
      api: {
        endpoint: "GET /api/v1/customers/active",
        description: "Fetch active customers only",
        method: "GET",
        auth: true,
        request: "?page=1&limit=10",
        response: {
          data: [
            {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              phone: "+1234567890",
              company: "Acme Corp",
              is_active: true
            }
          ],
          total: 50,
          page: 1
        }
      },
      page: {
        purpose: "Manage customer relationships",
        features: [
          "View all active customers",
          "Search by name/email",
          "Filter by status",
          "View customer details",
          "Add new customers"
        ],
        access: "Authenticated users",
        route: "/dashboard/customers"
      }
    },

    "sales-orders": {
      name: "Sales Orders",
      icon: "📋",
      description: "Manage all sales orders",
      section: "Sales & Orders",
      color: "rose",
      ui: {
        component: "Orders.tsx",
        file: "/src/pages/salesOrders/order/OrderList.tsx",
        code: `// Orders.tsx
const Orders = () => {
  const [status, setStatus] = useState('all');
  const { data } = useGetOrdersQuery({ status });

  return (
    <div>
      {/* Status Filter Tabs */}
      <Tabs value={status} onValueChange={setStatus}>
        <Tabs.Trigger value="all">All</Tabs.Trigger>
        <Tabs.Trigger value="pending">Pending</Tabs.Trigger>
        <Tabs.Trigger value="confirmed">Confirmed</Tabs.Trigger>
        <Tabs.Trigger value="delivered">Delivered</Tabs.Trigger>
      </Tabs>

      {/* Orders Table */}
      <Table
        columns={[
          { header: 'Order #', accessor: 'orderNumber' },
          { header: 'Customer', accessor: 'customer_name' },
          { header: 'Total', accessor: 'totalAmount' },
          { header: 'Status', accessor: 'status',
            render: (row) => <StatusBadge status={row.status} />
          },
          { header: 'Date', accessor: 'created_at' }
        ]}
        data={data?.data}
      />
    </div>
  );
};`,
        imports: [
          "useGetOrdersQuery - Fetch orders",
          "Tabs - Filter tabs"
        ]
      },
      api: {
        endpoint: "GET /api/v1/sales/orders",
        description: "Fetch sales orders with optional status filter",
        method: "GET",
        auth: true,
        request: "?status=pending&page=1&limit=20",
        response: {
          data: [
            {
              id: 1,
              orderNumber: "SO-2024-001",
              customer_id: 5,
              customer_name: "John Doe",
              totalAmount: 599.99,
              status: "pending",
              items: "Array of order items"
            }
          ],
          total: 150
        }
      },
      page: {
        purpose: "Manage all sales orders",
        features: [
          "Filter by status (pending, confirmed, etc.)",
          "View order details",
          "Create new orders",
          "Edit pending orders",
          "Print invoices"
        ],
        access: "Authenticated users",
        route: "/dashboard/sales/orders"
      }
    },

    accounting: {
      name: "Accounting Dashboard",
      icon: "💰",
      description: "Financial overview and reports",
      section: "Accounting",
      color: "emerald",
      ui: {
        component: "Accounting.tsx",
        file: "/src/pages/accounting/Accounting.tsx",
        code: `// Accounting.tsx
const Accounting = () => {
  const { data: stats } = useGetAccountingStatsQuery();

  return (
    <div>
      {/* Financial Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <Metric label="Total Income" value={stats?.totalIncome} />
        </Card>
        <Card>
          <Metric label="Total Expense" value={stats?.totalExpense} />
        </Card>
        <Card>
          <Metric label="Net Profit" value={stats?.profit} />
        </Card>
        <Card>
          <Metric label="Pending Invoices" value={stats?.pendingInvoices} />
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to="/dashboard/accounting/income/add">
          <Button>Add Income</Button>
        </Link>
        <Link to="/dashboard/accounting/expense/add">
          <Button>Add Expense</Button>
        </Link>
      </div>

      {/* Charts */}
      <ProfitLossChart data={stats?.plData} />
    </div>
  );
};`,
        imports: [
          "useGetAccountingStatsQuery - Financial stats",
          "ProfitLossChart - Chart component"
        ]
      },
      api: {
        endpoint: "GET /api/v1/accounting/stats",
        description: "Fetch accounting statistics",
        method: "GET",
        auth: true,
        response: {
          totalIncome: 250000,
          totalExpense: 180000,
          profit: 70000,
          pendingInvoices: 15
        }
      },
      page: {
        purpose: "Overview of financial health",
        features: [
          "Income/Expense summary",
          "Profit/Loss calculations",
          "Quick actions (add income/expense)",
          "Financial charts",
          "Reports access"
        ],
        access: "Authenticated users",
        route: "/dashboard/accounting"
      }
    }
  };

  const doc = moduleDocs[moduleId || "home"] || moduleDocs.home;

  if (!doc) {
    return (
      <>
        <Helmet>
          <title>Documentation Not Found - Kira ERP</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documentation Not Found</h1>
          <p className="text-gray-600 mb-4">The module documentation you're looking for doesn't exist.</p>
          <Link to="/modules" className="text-blue-600 hover:underline">
            ← Back to Modules
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{doc.name} - Documentation - Kira ERP</title>
        <meta name="description" content={doc.description} />
        <meta name="keywords" content="ERP documentation, module docs, API documentation, Kira ERP modules" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`https://kiraerp.com/docs/${moduleId}`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/modules"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Modules
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{doc.icon}</div>
            <div>
              <div className="text-sm text-gray-500 font-semibold uppercase">
                {doc.section}
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{doc.name}</h1>
              <p className="text-gray-600 mt-1">{doc.description}</p>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* UI Code */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">UI Code</h2>
                <p className="text-sm text-gray-500">Frontend Implementation</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Component</h3>
                <p className="text-sm text-gray-600 mb-2">{doc.ui.component}</p>
                <code className="block bg-gray-100 p-3 rounded text-xs text-gray-700 overflow-x-auto">
                  {doc.ui.file}
                </code>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{doc.ui.description}</p>
              </div>

              {doc.ui.code && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Code Example</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                    <code>{doc.ui.code}</code>
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Imports</h3>
                <ul className="space-y-2">
                  {doc.ui.imports?.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>

              {doc.ui.state && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">State Management</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {Object.entries(doc.ui.state).map(([key, val]) => (
                      <div key={key} className="mb-1">
                        <span className="font-semibold text-gray-700">{key}:</span>
                        <span className="text-gray-600 ml-2">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* API Calls */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">API Calls</h2>
                <p className="text-sm text-gray-500">Backend Endpoints</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${doc.api.method === 'GET' ? 'bg-green-100 text-green-700' :
                      doc.api.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        doc.api.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          doc.api.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {doc.api.method}
                  </span>
                  <h3 className="font-bold text-gray-900 font-mono">{doc.api.endpoint}</h3>
                </div>
                <p className="text-sm text-gray-600">{doc.api.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Authentication:</span>
                {doc.api.auth ? (
                  <span className="text-green-600 font-semibold text-sm">✅ Required</span>
                ) : (
                  <span className="text-gray-500 font-semibold text-sm">❌ Public</span>
                )}
              </div>

              {doc.api.request && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Request</h3>
                  <pre className="bg-gray-900 text-yellow-400 p-4 rounded text-xs overflow-x-auto">
                    <code>{JSON.stringify(doc.api.request, null, 2)}</code>
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                  <code>{JSON.stringify(doc.api.response, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Page Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Page Details</h2>
                <p className="text-sm text-gray-500">Implementation Info</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Purpose</h3>
                <p className="text-sm text-gray-600">{doc.page.purpose}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Route</h3>
                <code className="block bg-purple-50 text-purple-700 p-3 rounded text-sm font-mono">
                  {doc.page.route}
                </code>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Access</h3>
                <p className="text-sm text-gray-600">{doc.page.access}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                <ul className="space-y-2">
                  {doc.page.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {doc.page.flow && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Flow</h3>
                  <div className="bg-purple-50 p-3 rounded text-sm space-y-1">
                    {doc.page.flow.map((step: string, idx: number) => (
                      <div key={idx} className="text-gray-700">{step}</div>
                    ))}
                  </div>
                </div>
              )}

              {doc.page.nextSteps && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
                  <ul className="space-y-1">
                    {doc.page.nextSteps.map((step: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flow Diagrams */}
        {doc.page.diagrams && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Flow Diagrams</h2>

            {doc.page.diagrams.registrationFlow && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Registration Flow</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Visual representation of the entire registration process from plan selection to subdomain redirect
                </p>
                <MermaidDiagram chart={doc.page.diagrams.registrationFlow} id="registration-flow" />
              </div>
            )}

            {doc.page.diagrams.subdomainGeneration && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subdomain Generation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How company domains are automatically generated from company names
                </p>
                <MermaidDiagram chart={doc.page.diagrams.subdomainGeneration} id="subdomain-gen" />
              </div>
            )}

            {doc.page.diagrams.databaseDecision && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Database Type Decision</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How the system decides between shared and dedicated databases based on subscription plan
                </p>
                <MermaidDiagram chart={doc.page.diagrams.databaseDecision} id="db-decision" />
              </div>
            )}

            {doc.page.diagrams.redirectProcess && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subdomain Redirect Process</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sequence diagram showing how the redirect to company subdomain works after registration
                </p>
                <MermaidDiagram chart={doc.page.diagrams.redirectProcess} id="redirect-process" />
              </div>
            )}

            {doc.page.diagrams.authStateFlow && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Auth State Data Flow</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How authentication data flows from API to Redux store and cookies
                </p>
                <MermaidDiagram chart={doc.page.diagrams.authStateFlow} id="auth-state-flow" />
              </div>
            )}

            {doc.page.diagrams.authFlow && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Login/Auth Flow</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How authentication credentials are stored when user logs in
                </p>
                <MermaidDiagram chart={doc.page.diagrams.authFlow} id="auth-flow" />
              </div>
            )}

            {doc.page.diagrams.logoutFlow && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Logout Flow</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How authentication data is cleared on logout
                </p>
                <MermaidDiagram chart={doc.page.diagrams.logoutFlow} id="logout-flow" />
              </div>
            )}
          </div>
        )}

        {/* Additional Modules Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/modules" className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900">All Modules</h3>
              <p className="text-sm text-gray-600">View complete documentation</p>
            </Link>
            <Link to="/dashboard" className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Dashboard</h3>
              <p className="text-sm text-gray-600">Go to main dashboard</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ModuleDocs;
