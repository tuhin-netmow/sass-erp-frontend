import {
  Boxes,
  Building2,
  CalendarCheck,
  Car,
  Banknote,
  CreditCard,
  DollarSign,
  FileCode,
  Box,
  FileText,
  HandCoins,
  Layers,
  LayoutDashboard,
  LineChart,
  List,
  Map,
  MapPin,
  Package,
  PieChart,
  PlusCircle,
  RotateCcw,
  Ruler,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserPlus,
  Users,
  CheckCircle,
  Clock,
  Database,
  XCircle,
  Image,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  element?: React.ReactNode;
  layout?: React.ReactNode;
  allowedPermissions?: string[];
  items?: SidebarItem[];
}
import Dashboard from "@/app/pages/dashboard/Dashboard";
import Subscriptions from "@/app/pages/subscriptions/Subscriptions";
import GalleryPage from "@/app/pages/gallery";

import CreateProduct from "@/app/pages/products/create";
import Customers from "@/app/pages/customer/Customers";
import AddCustomer from "@/app/pages/customer/AddCustomer";
import ProductCategories from "@/app/pages/products/categories";
import Orders from "@/app/pages/salesOrders/order/OrderList";
import Invoices from "@/app/pages/salesOrders/invoices";
import Payments from "@/app/pages/salesOrders/payments/Payments";
import CreateOrderPage from "@/app/pages/salesOrders/order/createOrder";
import EditOrderPage from "@/app/pages/salesOrders/order/editOrder";
import OrderDetails from "@/app/pages/salesOrders/order/OrderDetails";
import PendingOrders from "@/app/pages/salesOrders/order/PendingOrders";
import DeliveredOrders from "@/app/pages/salesOrders/order/DeliveredOrders";
import ReturnedOrders from "@/app/pages/salesOrders/order/ReturnedOrders";
import AccountingOverview from "@/app/pages/accounting/Accounting";
import AddIncomePage from "@/app/pages/accounting/AddIncomePage";
import AddExpensePage from "@/app/pages/accounting/AddExpanse";
import InvoiceDetailsPage from "@/app/pages/salesOrders/invoices/InvoiceDetails";
import CreatePaymentPage from "@/app/pages/salesOrders/payments/createPayment";
import PaymentDetails from "@/app/pages/salesOrders/payments/PaymentDetails";
import SuppliersList from "@/app/pages/suppliers/supplier/suppliersList";
import AddSupplierPage from "@/app/pages/suppliers/supplier/AddSupplier";
import DeliveryPage from "@/app/pages/salesOrders/delivery/DeliveryPage";
import SalesRoutesPage from "@/app/pages/salesOrders/salesRoutes/SalesRoutePage";
import SalesPaymentPrintPreview from "@/app/pages/salesOrders/payments/SalesPaymentPrintPreview";
import { lazy } from "react";
const PurchaseOrdersPrintPreview = lazy(() => import("@/app/pages/suppliers/purchaseOrder/PurchaseOrdersPrintPreview"));
const PurchaseOrderPrint = lazy(() => import("@/app/pages/suppliers/purchaseOrder/PurchaseOrderPrint"));
const SalesOrderPrint = lazy(() => import("@/app/pages/salesOrders/order/SalesOrderPrint"));
import EditSupplierPage from "@/app/pages/suppliers/supplier/EditSupplier";
import CreatePurchaseOrderPage from "@/app/pages/suppliers/purchaseOrder/CreatePurchaseOrderPage";
import CreatePurchaseReturnPage from "@/app/pages/suppliers/purchaseOrder/CreatePurchaseReturnPage";
import ViewPurchaseOrderPage from "@/app/pages/suppliers/purchaseOrder/ViewPurchaseOrderPage";
import ViewPurchaseReturnPage from "@/app/pages/suppliers/purchaseOrder/ViewPurchaseReturnPage";
import Staffs from "@/app/pages/staffs";
import StaffDetails from "@/app/pages/staffs/StaffDetails";
import AddStaffPage from "@/app/pages/staffs/add";
import EditStaff from "@/app/pages/staffs/edit";
import EditCustomerPage from "@/app/pages/customer/EditCustomerPage";
import CustomerViewPage from "@/app/pages/customer/CustomerViewPage";
import CustomersMapPage from "@/app/pages/customer/CustomersMapPage";

import InventoryReports from "@/app/pages/reports/InventoryReports";
import SettingsSidebarLayout from "@/app/pages/Settings/Settings";

import AttendancePage from "@/app/pages/staffs/attendance";

import UnitsPage from "@/app/pages/unit";
import DepartmentsPage from "@/app/pages/departments";
import UsersList from "@/app/pages/users/UsersList";
import UserDetails from "@/app/pages/users/UserDetails";
import AddUserPage from "@/app/pages/users/AddUser";
import EditUserPage from "@/app/pages/users/EditUser";

import CustomerReports from "@/app/pages/reports/CustomerReports";
import EditPurchaseOrderPage from "@/app/pages/suppliers/purchaseOrder/EditPurchaseOrderPage";
import CreateRoutePage from "@/app/pages/salesOrders/salesRoutes/CreateRoute";
import InvoicePrintPreview from "@/app/pages/salesOrders/invoices/InvoicePrintPreview";
import PurchaseInvoicesList from "@/app/pages/suppliers/purchaseOrderInvoices/PurchaseInvoicesList";
import PurchaseInvoicesDetails from "@/app/pages/suppliers/purchaseOrderInvoices/PurchaseInvoicesDetails";
import PurchaseInvoicePrintPreview from "@/app/pages/suppliers/purchaseOrderInvoices/PurchaseInvoicePrintPreview";
import PurchaseReturnInvoiceDetails from "@/app/pages/suppliers/purchaseReturnInvoices/PurchaseReturnInvoiceDetails";
import PurchaseReturnInvoicePrintPreview from "@/app/pages/suppliers/purchaseReturnInvoices/PurchaseReturnInvoicePrintPreview";
import PurchasePayments from "@/app/pages/suppliers/purchasePayments/PurchasePayments";
import PurchasePaymentsDetails from "@/app/pages/suppliers/purchasePayments/PurchasePaymentsDetails";
import PurchasePaymentPrintPreview from "@/app/pages/suppliers/purchasePayments/PurchasePaymentPrintPreview";
import CreatePurchasePayments from "@/app/pages/suppliers/purchasePayments/CreatePurchasePayments";
import CreatePurchaseReturnPayment from "@/app/pages/suppliers/purchasePayments/CreatePurchaseReturnPayment";
import PurchaseReturnPayments from "@/app/pages/suppliers/purchasePayments/PurchaseReturnPayments";
import PurchaseReturnPaymentsDetails from "@/app/pages/suppliers/purchasePayments/PurchaseReturnPaymentsDetails";
import PurchaseReturnPaymentPrintPreview from "@/app/pages/suppliers/purchasePayments/PurchaseReturnPaymentPrintPreview";
import PurchaseOrdersMapPage from "@/app/pages/suppliers/PurchaseOrdersMap";


import RoleList from "@/app/pages/roles/RoleList";
import RoleEdit from "@/app/pages/roles/RoleEdit";

// New Accounting Pages
import Transactions from "@/app/pages/accounting/Transactions";
import ChartOfAccounts from "@/app/pages/accounting/ChartOfAccounts";
import PosOrder from "@/app/pages/salesOrders/pos/PosOrder";
import JournalReport from "@/app/pages/accounting/JournalReport";
import LedgerReport from "@/app/pages/accounting/LedgerReport";
import TrialBalance from "@/app/pages/accounting/TrialBalance";
import ProfitAndLoss from "@/app/pages/accounting/ProfitAndLoss";
import TaxSubmission from "@/app/pages/accounting/TaxSubmission";
import IncomePage from "@/app/pages/accounting/Income";
import ExpensesPage from "@/app/pages/accounting/Expenses";
import BalanceSheet from "@/app/pages/accounting/BalanceSheet";
import JournalDetails from "@/app/pages/accounting/JournalDetails";
import JournalPrintPreview from "@/app/pages/accounting/JournalPrintPreview";
import {
  MODULES,
  ACTIONS,
  SuperAdminPermission,
} from "./permissions";

// Helper function to build permissions using new format
const perm = (module: string, action: string) => `${module}.${action}`;
import SalesReportsPage from "@/app/pages/reports/SalesReports";
import SalesRouteDetails from "@/app/pages/salesOrders/salesRoutes/SalesRouteDetails";
import LeaveRequest from "@/app/pages/staffs/leaves/LeaveRequest";
import AttendanceDetailsPage from "@/app/pages/staffs/attendance/attendanceDetails";
import RouteWiseOrder from "@/app/pages/routeOperations/RouteWiseOrder";
import OrderManage from "@/app/pages/routeOperations/OrderManage";
import StaffRoute from "@/app/pages/routeOperations/StaffRoute";
import RawMaterials from "@/app/pages/raw-materials";
import AddRawMaterial from "@/app/pages/raw-materials/AddRawMaterial";
import EditRawMaterial from "@/app/pages/raw-materials/EditRawMaterial";
import ViewRawMaterial from "@/app/pages/raw-materials/ViewRawMaterial";
import ProductionDashboard from "@/app/pages/production";
import ProductionList from "@/app/pages/production/ProductionList";
import CreateProduction from "@/app/pages/production/CreateProduction";
import ProductionDetails from "@/app/pages/production/ProductionDetails";
import RMSupplierList from "@/app/pages/raw-materials/suppliers/SupplierList";
import AddRMSupplier from "@/app/pages/raw-materials/suppliers/AddSupplier";
import EditRMSupplier from "@/app/pages/raw-materials/suppliers/EditSupplier";
const PurchaseOrdersList = lazy(
  () => import("@/app/pages/suppliers/purchaseOrder/PurchaseOrdersList")
);
import RMPurchaseOrderList from "@/app/pages/raw-materials/purchase-orders/PurchaseOrderList";
import CreateRMPurchaseOrder from "@/app/pages/raw-materials/purchase-orders/CreatePurchaseOrder";
import ViewRMPurchaseOrder from "@/app/pages/raw-materials/purchase-orders/ViewPurchaseOrderPage";
import RMInvoiceList from "@/app/pages/raw-materials/invoice/RawMaterialInvoiceList";
import RecordRMInvoice from "@/app/pages/raw-materials/invoice/RecordInvoice";
import RawMaterialInvoiceDetails from "@/app/pages/raw-materials/invoice/RawMaterialInvoiceDetails";
import RMPurchaseInvoicePrintPreview from "@/app/pages/raw-materials/invoice/RMPurchaseInvoicePrintPreview";
import SupplierPaymentList from "@/app/pages/raw-materials/payments/SupplierPaymentList";
import MakeSupplierPayment from "@/app/pages/raw-materials/payments/MakePayment";
import RMPaymentDetails from "@/app/pages/raw-materials/payments/PaymentDetails";
import BomList from "@/app/pages/production/bom/BomList";
import CreateBom from "@/app/pages/production/bom/CreateBom";
import FinishedGoodsList from "@/app/pages/production/finished-goods/FinishedGoodsList";
import AddFinishedGood from "@/app/pages/production/finished-goods/AddFinishedGood";
import RawMaterialCategoriesPage from "@/app/pages/raw-materials/categories";
import EditRawMaterialPurchaseOrder from "@/app/pages/raw-materials/purchase-orders/EditPurchaseOrder";
import InActiveCustomersList from "@/app/pages/customer/InActiveCustomers";
import CheckIn from "@/app/pages/checkIn/CheckIn";
import CheckInList from "@/app/pages/checkIn/CheckInList";
import StaffWiseCheckInList from "@/app/pages/checkIn/StaffWiseCheckInList";
import AddCustomerByStaffPage from "@/app/pages/customer/AddCustomerByStaff";
import MyProfileSettings from "@/app/pages/Settings/MyProfileSettings";
import Help from "@/app/pages/help/Help";
import HrPayrollOverview from "@/app/pages/HrAndPayroll/HrPayrollOverview";
import StaffAdvanceDetail from "@/app/pages/HrAndPayroll/StaffAdvanceDetail";

// import DepartmentsDesignations from "@/pages/HrAndPayroll/DepartmentsDesignations";
// import EmploymentDetails from "@/pages/HrAndPayroll/EmploymentDetails";
import Attendance from "@/app/pages/HrAndPayroll/Attendance";

// import PayrollComponents from "@/pages/HrAndPayroll/PayrollComponents";
// import SalaryStructures from "@/pages/HrAndPayroll/SalaryStructures";
//import PayrollRuns from "@/pages/HrAndPayroll/PayrollRuns";
import Payslips from "@/app/pages/HrAndPayroll/Payslips";

import PayrollReports from "@/app/pages/HrAndPayroll/PayrollReports";
import StaffPayrollRun from "@/app/pages/HrAndPayroll/StaffPayrollRun";
import Salary from "@/app/pages/HrAndPayroll/Salary";
import { ConfirmedOrders } from "@/app/pages/salesOrders/order/ConfirmedOrders";
import IntransitOrder from "@/app/pages/salesOrders/order/IntransitOrder";
import EditRoutePage from "@/app/pages/salesOrders/salesRoutes/EditRoutePage";
import ProfitByItem from "@/app/pages/accounting/ProfitByItem";
import DatabaseTables from "@/app/pages/data_management/DatabaseTables";
import ReturnedPurchaseOrders from "@/app/pages/suppliers/purchaseOrder/ReturnedPurchaseOrders";
import PurchaseReturnPrint from "@/app/pages/suppliers/purchaseOrder/PurchaseReturnPrint";
import LayoutSettings from "@/app/pages/Settings/pages/LayoutSettings";
import EInvoiceList from "@/app/pages/salesOrders/invoices/EInvoiceList";
import EInvoiceSettings from "@/app/pages/Settings/pages/EInvoiceSettings";
import EditProfilePage from "@/app/pages/Settings/pages/UserProfilePage";
import GoogleApiSettings from "@/app/pages/Settings/pages/GoogleApiSettings";
import PrefixSettings from "@/app/pages/Settings/pages/PrefixSettings";
import StaffWiseSalesReport from "@/app/pages/reports/StaffWiseSalesReport";
import CompanyAccount from "@/app/pages/dashboard/CompanyAccount";
import InvoicesSummaryPreview from "@/app/pages/salesOrders/invoices/InvoicesSummaryPreview";
import InvoiceItemsSummaryPreview from "@/app/pages/salesOrders/invoices/InvoiceItemsSummaryPreview";
import InvoiceSummaryDetails from "@/app/pages/salesOrders/invoices/InvoiceSummaryDetails";
import CreateSalesReturn from "@/app/pages/salesOrders/returns/CreateSalesReturn";
import ViewSalesReturn from "@/app/pages/salesOrders/returns/ViewSalesReturn";
import SalesReturnInvoiceDetails from "@/app/pages/salesOrders/returns/SalesReturnInvoiceDetails";
import SalesReturnInvoicePrintPreview from "@/app/pages/salesOrders/returns/SalesReturnInvoicePrintPreview";
import SalesReturnPaymentsList from "@/app/pages/salesOrders/returns/SalesReturnPaymentsList";
import CreateSalesReturnPayment from "@/app/pages/salesOrders/returns/CreateSalesReturnPayment";
import SalesReturnPaymentDetails from "@/app/pages/salesOrders/returns/SalesReturnPaymentDetails";
import SalesReturnPaymentPrintPreview from "@/app/pages/salesOrders/returns/SalesReturnPaymentPrintPreview";
import SalesReturnsList from "@/app/pages/salesOrders/returns/SalesReturnsList";
import SalesReturnPrint from "@/app/pages/salesOrders/returns/SalesReturnPrint";

import ApprovedPurchaseReturns from "@/app/pages/suppliers/purchaseOrder/ApprovedPurchaseReturns";
import PendingPurchaseReturns from "@/app/pages/suppliers/purchaseOrder/PendingPurchaseReturns";
import ApprovedSalesReturns from "@/app/pages/salesOrders/returns/ApprovedSalesReturns";
import PendingSalesReturns from "@/app/pages/salesOrders/returns/PendingSalesReturns";
import ApprovedPurchaseOrders from "@/app/pages/suppliers/purchaseOrder/ApprovedPurchaseOrders";
import RejectedPurchaseOrders from "@/app/pages/suppliers/purchaseOrder/RejectedPurchaseOrders";
import PendingPurchaseOrders from "@/app/pages/suppliers/purchaseOrder/PendingPurchaseOrders";
import Products from "@/app/pages/products/Products";
import ProductsByStaff from "@/app/pages/products/ProductsByStaff";
import ProductDetailsPage from "@/app/pages/products/ProductDetails";
import EditProductPage from "@/app/pages/products/edit";
import StockManagement from "@/app/pages/products/stock";
import WarehousesList from "@/app/pages/products/warehouses/WarehousesList";
import QuotationsList from "@/app/pages/salesOrders/quotations/QuotationsList";
import EditCustomerByStaffPage from "../pages/customer/EditCustomerByStaffPage";


export const sidebarItemLink = [
  // DASHBOARD
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    element: <Dashboard />,
    allowedPermissions: [
      perm(MODULES.DASHBOARD, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
  },

  // SUBSCRIPTION & BILLING
  {
    title: "Subscription",
    url: "/dashboard/subscriptions",
    icon: CreditCard,
    element: <Subscriptions />,
    allowedPermissions: [
      perm(MODULES.DASHBOARD, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
  },

  // COMPANY ACCOUNT
  {
    title: "Company Account",
    url: "/dashboard/company-account",
    icon: Building2,
    element: <CompanyAccount />,
    allowedPermissions: [
      perm(MODULES.DASHBOARD, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
  },

  // GALLERY
  {
    title: "My Gallery",
    url: "/dashboard/gallery",
    icon: Image,
    element: <GalleryPage />,
    allowedPermissions: [
      SuperAdminPermission.ACCESS_ALL,
      perm(MODULES.DASHBOARD, ACTIONS.VIEW),
    ],
  },

  // PRODUCTS
  {
    title: "Products",
    url: "#",
    icon: Package,
    allowedPermissions: [
      perm(MODULES.PRODUCTS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Products",
        url: "/dashboard/products",
        element: <Products />,
        icon: List, // product list
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      {
        title: "Products for Staff",
        url: "/dashboard/products-by-staff",
        element: <ProductsByStaff />,
        icon: List, // product list
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      {
        title: "",
        url: "/dashboard/products/:productId",
        element: <ProductDetailsPage />,
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      {
        title: "Add Product",
        url: "/dashboard/products/create",
        element: <CreateProduct />,
        icon: PlusCircle, // add product
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/products/:productId/edit",
        element: <EditProductPage />,
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Categories",
        url: "/dashboard/products/categories",
        element: <ProductCategories />,
        icon: Layers, // categories/groups
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Unit",
        url: "/dashboard/products/unit",
        element: <UnitsPage />,
        icon: Ruler, // unit/measurement
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Stock Management",
        url: "/dashboard/products/stock",
        element: <StockManagement />,
        icon: Boxes, // inventory/stock
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.MANAGE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Warehouses",
        url: "/dashboard/products/warehouses",
        element: <WarehousesList />,
        icon: Warehouse,
        allowedPermissions: [
          perm(MODULES.PRODUCTS, ACTIONS.MANAGE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // CUSTOMERS
  {
    title: "Customers",
    url: "#",
    icon: Users,
    allowedPermissions: [
      perm(MODULES.CUSTOMERS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "List of  Active Customers",
        url: "/dashboard/customers",
        element: <Customers />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "List of Inactive Customers",
        url: "/dashboard/customers/inactive",
        element: <InActiveCustomersList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/customers/:customerId",
        element: <CustomerViewPage />,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add Customer",
        url: "/dashboard/customers/create",
        element: <AddCustomer />,
        icon: UserPlus,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add Customer By Staff",
        url: "/dashboard/customers/create/by-staff",
        element: <AddCustomerByStaffPage />,
        icon: UserPlus,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/customers/:customerId/edit/by-staff",
        element: <EditCustomerByStaffPage />,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/customers/:customerId/edit",
        element: <EditCustomerPage />,
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Customer Maps",
        url: "/dashboard/customers/map",
        element: <CustomersMapPage />,
        icon: Map, // map view
        allowedPermissions: [
          perm(MODULES.CUSTOMERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // SUPPLIERS
  {
    title: "Suppliers",
    url: "#",
    icon: Car,
    allowedPermissions: [
      perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "List of Suppliers",
        url: "/dashboard/suppliers",
        element: <SuppliersList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add Supplier",
        url: "/dashboard/suppliers/create",
        element: <AddSupplierPage />,
        icon: UserPlus,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/suppliers/:supplierId/edit",
        element: <EditSupplierPage />,
        icon: UserPlus,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },


  // RAW MATERIALS
  {
    title: "Raw Materials",
    url: "#",
    icon: Boxes,
    allowedPermissions: [
      perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Raw Materials List",
        url: "/dashboard/raw-materials",
        element: <RawMaterials />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Suppliers",
        url: "/dashboard/raw-materials/suppliers",
        element: <RMSupplierList />,
        icon: Truck,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Purchase Orders",
        url: "/dashboard/raw-materials/purchase-orders",
        element: <RMPurchaseOrderList />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Invoices & GRN",
        url: "/dashboard/raw-materials/invoices",
        element: <RMInvoiceList />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Payments",
        url: "/dashboard/raw-materials/payments",
        element: <SupplierPaymentList />,
        icon: CreditCard,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Categories",
        url: "/dashboard/raw-materials/categories",
        element: <RawMaterialCategoriesPage />,
        icon: Layers,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // Hidden Create/Edit Routes
      {
        title: "",
        url: "/dashboard/raw-materials/add",
        element: <AddRawMaterial />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/:id",
        element: <ViewRawMaterial />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/edit/:id",
        element: <EditRawMaterial />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/suppliers/create",
        element: <AddRMSupplier />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/suppliers/edit/:id",
        element: <EditRMSupplier />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/purchase-orders/create",
        element: <CreateRMPurchaseOrder />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/purchase-orders/:purchaseId",
        element: <ViewRMPurchaseOrder />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/purchase-orders/edit/:purchaseId",
        element: <EditRawMaterialPurchaseOrder />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/invoices/create",
        element: <RecordRMInvoice />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/invoices/:id",
        element: <RawMaterialInvoiceDetails />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/invoices/print/:id",
        element: <RMPurchaseInvoicePrintPreview />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/payments/create",
        element: <MakeSupplierPayment />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/raw-materials/payments/:id",
        element: <RMPaymentDetails />,
        allowedPermissions: [
          perm(MODULES.RAW_MATERIALS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // PRODUCTION
  {
    title: "Production",
    url: "#",
    icon: Layers,
    allowedPermissions: [
      perm(MODULES.PRODUCTION, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/production",
        element: <ProductionDashboard />,
        icon: LayoutDashboard,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Production Batches",
        url: "/dashboard/production/list",
        element: <ProductionList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Recipes (BOM)",
        url: "/dashboard/production/bom",
        element: <BomList />,
        icon: FileCode,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Finished Goods",
        url: "/dashboard/production/finished-goods",
        element: <FinishedGoodsList />,
        icon: Box,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // Hidden Create Routes
      {
        title: "",
        url: "/dashboard/production/create",
        element: <CreateProduction />,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/production/:id",
        element: <ProductionDetails />,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/production/bom/create",
        element: <CreateBom />,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/production/finished-goods/create",
        element: <AddFinishedGood />,
        allowedPermissions: [
          perm(MODULES.PRODUCTION, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // STAFFS
  {
    title: "Staffs",
    url: "#",
    icon: Users,
    allowedPermissions: [perm(MODULES.STAFFS, ACTIONS.VIEW), SuperAdminPermission.ACCESS_ALL],
    items: [
      {
        title: "All Staffs",
        url: "/dashboard/staffs",
        element: <Staffs />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/staffs/:staffId",
        element: <StaffDetails />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add New Staff",
        url: "/dashboard/staffs/add",
        element: <AddStaffPage />,
        icon: PlusCircle,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/staffs/:staffId/edit",
        element: <EditStaff />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Departments",
        url: "/dashboard/departments",
        element: <DepartmentsPage />,
        icon: Layers,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Attendance",
        url: "/dashboard/staffs/attendance",
        element: <AttendancePage />,
        icon: CalendarCheck,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/staffs/attendance/:staffId",
        element: <AttendanceDetailsPage />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // {
      //   title: "Leave Management",
      //   url: "/dashboard/staffs/leaves",
      //   element: <LeavesManagement />,
      //   icon: FileMinus,
      //   allowedPermissions: [
      //     perm(MODULES.STAFFS, ACTIONS.MANAGE),
      //     SuperAdminPermission.ACCESS_ALL,
      //   ],
      // },

      // CHECK IN
      {
        title: "Check In",
        url: "/dashboard/staff/check-in",
        icon: MapPin,
        element: <CheckIn />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Check In List",
        url: "/dashboard/staff/check-in-list",
        icon: MapPin,
        element: <CheckInList />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Staff Wise Checkin List",
        url: "/dashboard/staff/staff-wise-check-in-list",
        icon: Users,
        element: <StaffWiseCheckInList />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/staffs/leaves/request",
        element: <LeaveRequest />,
        allowedPermissions: [
          perm(MODULES.STAFFS, ACTIONS.MANAGE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Sales Routes",
        url: "/dashboard/sales/sales-routes",
        element: <SalesRoutesPage />,
        icon: MapPin,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  //Purchase Orders

  {
    title: "Purchase",
    url: "#",
    icon: Car,
    allowedPermissions: [
      perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "List of Purchase Orders",
        url: "/dashboard/purchase-orders",
        element: <PurchaseOrdersList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Pending Purchase Order",
        url: "/dashboard/purchase-orders/pending",
        element: <PendingPurchaseOrders />,
        icon: Clock,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Approved Purchase Order",
        url: "/dashboard/purchase-orders/approved",
        element: <ApprovedPurchaseOrders />,
        icon: CheckCircle,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Rejected Purchase Order",
        url: "/dashboard/purchase-orders/rejected",
        element: <RejectedPurchaseOrders />,
        icon: XCircle,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add New Purchase Order",
        url: "/dashboard/purchase-orders/create",
        element: <CreatePurchaseOrderPage />,
        icon: PlusCircle,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-orders/:purchaseId",
        element: <ViewPurchaseOrderPage />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      {
        title: "",
        url: "/dashboard/purchase-orders/:purchaseId/edit",
        element: <EditPurchaseOrderPage />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/purchase-orders/create",
        element: <CreatePurchaseOrderPage />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-orders/print-preview",
        element: <PurchaseOrdersPrintPreview />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-orders/:purchaseId/print",
        element: <PurchaseOrderPrint />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Purchase Invoices",
        url: "/dashboard/purchase-invoices",
        element: <PurchaseInvoicesList />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-invoices/:id",
        element: <PurchaseInvoicesDetails />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-invoices/:id/preview",
        element: <PurchaseInvoicePrintPreview />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-payments/create",
        element: <CreatePurchasePayments />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Purchase Payments",
        url: "/dashboard/purchase-payments",
        element: <PurchasePayments />,
        icon: CreditCard,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-payments/:id",
        element: <PurchasePaymentsDetails />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-payments/:id/preview",
        element: <PurchasePaymentPrintPreview />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Purchase Orders Map",
        url: "/dashboard/purchase-orders-map",
        element: <PurchaseOrdersMapPage />,
        icon: MapPin,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // PURCHASE RETURN
  {
    title: "Purchase Return",
    url: "#",
    icon: RotateCcw,
    allowedPermissions: [
      perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Purchase Returns",
        url: "/dashboard/purchase-orders/returned",
        element: <ReturnedPurchaseOrders />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Approved Purchase Returns",
        url: "/dashboard/purchase-orders/returned/approved",
        element: <ApprovedPurchaseReturns />,
        icon: CheckCircle,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Pending Purchase Return",
        url: "/dashboard/purchase-orders/returned/pending",
        element: <PendingPurchaseReturns />,
        icon: Clock,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Create Purchase Return",
        url: "/dashboard/purchase-orders/return/create",
        element: <CreatePurchaseReturnPage />,
        icon: PlusCircle,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-returns/:returnId",
        element: <ViewPurchaseReturnPage />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-returns/:returnId/print",
        element: <PurchaseReturnPrint />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-return-invoices/:id",
        element: <PurchaseReturnInvoiceDetails />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-return-invoices/:id/preview",
        element: <PurchaseReturnInvoicePrintPreview />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-returns/payments/create",
        element: <CreatePurchaseReturnPayment />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Purchase Return Refunds",
        url: "/dashboard/purchase-returns/payments",
        element: <PurchaseReturnPayments />,
        icon: Banknote,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-returns/payments/:id/print",
        element: <PurchaseReturnPaymentPrintPreview />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/purchase-returns/payments/:id",
        element: <PurchaseReturnPaymentsDetails />,
        allowedPermissions: [
          perm(MODULES.SUPPLIERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // SALES & ORDERS
  {
    title: "Sales & Orders",
    url: "#",
    icon: ShoppingCart,
    allowedPermissions: [perm(MODULES.SALES, ACTIONS.VIEW), SuperAdminPermission.ACCESS_ALL],
    items: [
      {
        title: "POS Order",
        url: "/dashboard/sales/pos",
        element: <PosOrder />,
        icon: ShoppingCart,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Quotations",
        url: "/dashboard/sales/quotations",
        element: <QuotationsList />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Orders",
        url: "/dashboard/sales/orders",
        element: <Orders />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add New Sales Order",
        url: "/dashboard/sales/orders/create",
        icon: PlusCircle,
        element: <CreateOrderPage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add New Sales Order (Any)",
        url: "/dashboard/sales/orders/create-any",
        icon: PlusCircle,
        element: <CreateOrderPage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Pending Orders",
        url: "/dashboard/sales/orders/pending",
        element: <PendingOrders />,
        icon: Clock,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Confirmed Orders",
        url: "/dashboard/sales/orders/confirmed",
        element: <ConfirmedOrders />,
        icon: CheckCircle,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "In-Transit Orders",
        url: "/dashboard/sales/orders/intransit-order",
        element: <IntransitOrder />,
        icon: Truck,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Delivered Orders",
        url: "/dashboard/sales/orders/delivered",
        element: <DeliveredOrders />,
        icon: Package,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Return Orders",
        url: "/dashboard/sales/orders/return",
        element: <ReturnedOrders />,
        icon: RotateCcw,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      {
        title: "",
        url: "/dashboard/sales/orders/:orderId",
        element: <OrderDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/orders/:orderId/print",
        element: <SalesOrderPrint />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/orders/:orderId/edit",
        element: <EditOrderPage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Invoices",
        url: "/dashboard/sales/invoices",
        element: <Invoices />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "E-Invoices",
        url: "/dashboard/sales/einvoices",
        element: <EInvoiceList />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/invoices/:invoiceId",
        element: <InvoiceDetailsPage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/invoices/:invoiceId/preview",
        element: <InvoicePrintPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/invoices/summary",
        element: <InvoicesSummaryPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/invoices/items-summary",
        element: <InvoiceItemsSummaryPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/invoices/summary-details",
        element: <InvoiceSummaryDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Payments",
        url: "/dashboard/sales/payments",
        element: <Payments />,
        icon: CreditCard,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/payments/:paymentId",
        element: <PaymentDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/payments/:paymentId/preview",
        element: <SalesPaymentPrintPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/payments/create",
        element: <CreatePaymentPage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Delivery",
        url: "/dashboard/sales/delivery",
        element: <DeliveryPage />,
        icon: Truck,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/sales-routes/create",
        element: <CreateRoutePage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/sales-routes/:id",
        element: <SalesRouteDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/sales-routes/:id/edit",
        element: <EditRoutePage />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // {
      //   title: "",
      //   url: "/dashboard/sales/sales-routes/:routeId/assign",
      //   element: <AssignRoutePage />,
      //   allowedPermissions: [
      //     perm(MODULES.SALES, ACTIONS.UPDATE),
      //     SuperAdminPermission.ACCESS_ALL,
      //   ],
      // },
    ],
  },

  // SALES RETURN
  {
    title: "Sales Return",
    url: "#",
    icon: RotateCcw,
    allowedPermissions: [
      perm(MODULES.SALES, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Sales Return Orders",
        url: "/dashboard/sales/returns",
        element: <SalesReturnsList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Approved Sales Returns",
        url: "/dashboard/sales/returns/approved",
        element: <ApprovedSalesReturns />,
        icon: CheckCircle,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Pending Sales Return",
        url: "/dashboard/sales/returns/pending",
        element: <PendingSalesReturns />,
        icon: Clock,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Create New Sales Return",
        url: "/dashboard/sales/returns/create",
        element: <CreateSalesReturn />,
        icon: PlusCircle,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/returns/:returnId",
        element: <ViewSalesReturn />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/returns/:returnId/print",
        element: <SalesReturnPrint />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales-return-invoices/:id",
        element: <SalesReturnInvoiceDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales-return-invoices/:id/preview",
        element: <SalesReturnInvoicePrintPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Sales Return Refunds",
        url: "/dashboard/sales/returns/payments",
        element: <SalesReturnPaymentsList />,
        icon: Banknote,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/returns/payments/create",
        element: <CreateSalesReturnPayment />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/returns/payments/:id/print",
        element: <SalesReturnPaymentPrintPreview />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/sales/returns/payments/:id",
        element: <SalesReturnPaymentDetails />,
        allowedPermissions: [
          perm(MODULES.SALES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // ACCOUNTING
  {
    title: "Accounting",
    url: "#",
    icon: HandCoins,
    allowedPermissions: [
      perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/accounting",
        element: <AccountingOverview />,
        icon: LayoutDashboard,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Transactions",
        url: "/dashboard/accounting/transactions",
        element: <Transactions />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Chart of Accounts",
        url: "/dashboard/accounting/accounts",
        element: <ChartOfAccounts />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Income List",
        url: "/dashboard/accounting/income",
        element: <IncomePage />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Expense List",
        url: "/dashboard/accounting/expenses",
        element: <ExpensesPage />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Journal Report",
        url: "/dashboard/accounting/reports/journal",
        element: <JournalReport />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/accounting/reports/journal/:journalId",
        element: <JournalDetails />,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/accounting/reports/journal/:journalId/print",
        element: <JournalPrintPreview />,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Ledger Report",
        url: "/dashboard/accounting/reports/ledger",
        element: <LedgerReport />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Trial Balance",
        url: "/dashboard/accounting/reports/trial-balance",
        element: <TrialBalance />,
        icon: Scale, // Need to make sure Scale is imported or use another icon
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Profit & Loss",
        url: "/dashboard/accounting/reports/profit-and-loss",
        element: <ProfitAndLoss />,
        icon: PieChart,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Balance Sheet",
        url: "/dashboard/accounting/reports/balance-sheet",
        element: <BalanceSheet />,
        icon: Scale,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Profit by Item",
        url: "/dashboard/accounting/reports/profit-by-item",
        element: <ProfitByItem />,
        icon: CreditCard,
        // allowedPermissions: [
        //   AccountingPermission.PROFIT_BY_ITEM,
        //   SuperAdminPermission.ACCESS_ALL,
        // ],
      },
      {
        title: "Tax Submissions",
        url: "/dashboard/accounting/tax-submissions",
        element: <TaxSubmission />,
        icon: Scale,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // {
      //   title: "Daily Profit Status",
      //   url: "/dashboard/accounting/reports/daily-profit-status",
      //   element: <DailyProfitStatus />,
      //   icon: CreditCard,
      //   // allowedPermissions: [
      //   //   AccountingPermission.PROFIT_BY_ITEM,
      //   //   SuperAdminPermission.ACCESS_ALL,
      //   // ],
      // },
      // Hidden Create/Edit Routes
      {
        title: "",
        url: "/dashboard/accounting/add-income",
        element: <AddIncomePage />,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/accounting/add-expanse",
        element: <AddExpensePage />,
        allowedPermissions: [
          perm(MODULES.ACCOUNTING, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },



  //HR and Payroll
  {
    title: "HR & Payroll",
    url: "#",
    icon: HandCoins,
    allowedPermissions: [
      perm(MODULES.PAYROLL, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Overview",
        url: "/dashboard/payroll",
        element: <HrPayrollOverview />,
        icon: LayoutDashboard,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/payroll/:staffId/advance",
        element: <StaffAdvanceDetail />,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/payroll/:staffId/payroll-run",
        element: <StaffPayrollRun />,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/payroll/:staffId/salary",
        element: <Salary />,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

      // {
      //   title: "Employment Details",
      //   url: "/dashboard/payroll/employment-details",
      //   element: <EmploymentDetails />,
      //   icon: FileText,
      //   allowedPermissions: [
      //     PayrollPermission.EMPLOYMENT_DETAILS,
      //     SuperAdminPermission.ACCESS_ALL,
      //   ],
      // },
      {
        title: "Manual Attendance",
        url: "/dashboard/payroll/attendance",
        element: <Attendance />,
        icon: CalendarCheck,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      // {
      //   title: "Payroll Runs",
      //   url: "/dashboard/payroll/payroll-runs",
      //   element: <PayrollRuns />,
      //   icon: BanknoteArrowDown,
      //   allowedPermissions: [
      //     perm(MODULES.PAYROLL, ACTIONS.VIEW),
      //     SuperAdminPermission.ACCESS_ALL,
      //   ],
      // },
      {
        title: "Payslips",
        url: "/dashboard/payroll/payslips",
        element: <Payslips />,
        icon: FileText,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Payroll Reports",
        url: "/dashboard/payroll/payroll-reports",
        element: <PayrollReports />,
        icon: LineChart,
        allowedPermissions: [
          perm(MODULES.PAYROLL, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // USERS
  {
    title: "Users",
    url: "#",
    icon: Users,
    allowedPermissions: [perm(MODULES.USERS, ACTIONS.VIEW), SuperAdminPermission.ACCESS_ALL],
    items: [
      {
        title: "User List",
        url: "/dashboard/users/list",
        element: <UsersList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.USERS, ACTIONS.LIST),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Add Users",
        url: "/dashboard/users/add",
        element: <AddUserPage />,
        icon: UserPlus,
        allowedPermissions: [
          perm(MODULES.USERS, ACTIONS.CREATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/users/:userId/edit",
        element: <EditUserPage />,
        allowedPermissions: [
          perm(MODULES.USERS, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/users/:userId",
        element: <UserDetails />,
        allowedPermissions: [
          perm(MODULES.USERS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // ROLES & PERMISSIONS
  {
    title: "Roles & Permissions",
    url: "#",
    icon: ShieldCheck,
    allowedPermissions: [
      perm(MODULES.ROLES, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [

      {
        title: "Role List",
        url: "/dashboard/roles/list",
        element: <RoleList />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.ROLES, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },


      {
        title: "",
        url: "/dashboard/roles/edit/:id",
        element: <RoleEdit />,
        allowedPermissions: [
          perm(MODULES.ROLES, ACTIONS.UPDATE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },

    ],
  },

  // REPORTS
  {
    title: "Reports",
    url: "#",
    icon: LineChart,
    allowedPermissions: [
      perm(MODULES.REPORTS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Sales Reports",
        url: "/dashboard/reports/sales",
        element: <SalesReportsPage />,
        icon: DollarSign,
        allowedPermissions: [
          perm(MODULES.REPORTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Inventory Reports",
        url: "/dashboard/reports/inventory",
        element: <InventoryReports />,
        icon: Box,
        allowedPermissions: [
          perm(MODULES.REPORTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Customer Reports",
        url: "/dashboard/reports/customers",
        element: <CustomerReports />,
        icon: Users,
        allowedPermissions: [
          perm(MODULES.REPORTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Staff Wise Sales Report",
        url: "/dashboard/reports/staff-wise-sales",
        element: <StaffWiseSalesReport />,
        icon: Users,
        allowedPermissions: [
          perm(MODULES.REPORTS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },

  // ROUTE OPERATIONS
  {
    title: "Route Operations",
    url: "#",
    icon: Map,
    allowedPermissions: [
      perm(MODULES.ROUTE_OPERATIONS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "Route Wise Order",
        url: "/dashboard/route-operations/route-wise-order",
        element: <RouteWiseOrder />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.ROUTE_OPERATIONS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Order Manage",
        url: "/dashboard/route-operations/order-manage",
        element: <OrderManage />,
        icon: Settings,
        allowedPermissions: [
          perm(MODULES.ROUTE_OPERATIONS, ACTIONS.MANAGE),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "Staff Wise Route",
        url: "/dashboard/route-operations/staff-route",
        element: <StaffRoute />,
        icon: Users,
        allowedPermissions: [
          perm(MODULES.ROUTE_OPERATIONS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },


  // SETTINGS
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    layout: <SettingsSidebarLayout />,
    element: <SettingsSidebarLayout />,
    allowedPermissions: [
      perm(MODULES.SETTINGS, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "",
        url: "/dashboard/settings",
        element: <EditProfilePage />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/settings/profile",
        element: <MyProfileSettings />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/settings/layout",
        element: <LayoutSettings />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/settings/einvoice",
        element: <EInvoiceSettings />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/settings/google-api",
        element: <GoogleApiSettings />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
      {
        title: "",
        url: "/dashboard/settings/prefixes",
        element: <PrefixSettings />,
        allowedPermissions: [
          perm(MODULES.SETTINGS, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },


  // DATABASE
  {
    title: "Database",
    url: "#",
    icon: Database,
    allowedPermissions: [
      perm(MODULES.SYSTEM, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],
    items: [
      {
        title: "All Tables",
        url: "/dashboard/database",
        element: <DatabaseTables />,
        icon: List,
        allowedPermissions: [
          perm(MODULES.SYSTEM, ACTIONS.VIEW),
          SuperAdminPermission.ACCESS_ALL,
        ],
      },
    ],
  },


  {
    title: "Help",
    url: "/dashboard/help",
    icon: Map,
    element: <Help />,
    allowedPermissions: [
      perm(MODULES.HELP, ACTIONS.VIEW),
      SuperAdminPermission.ACCESS_ALL,
    ],

  },
];
