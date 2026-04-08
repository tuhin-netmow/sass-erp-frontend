import fs from 'fs';

const fp = 'D:/Workspace/Office/sass_kira/saas_erp_mongodb_frontend/src/config/permissions.ts';
let data = fs.readFileSync(fp, 'utf8');

const dict = {
  DashboardPermission: 'MODULES.DASHBOARD',
  ProductPermission: 'MODULES.PRODUCTS',
  CustomerPermission: 'MODULES.CUSTOMERS',
  SupplierPermission: 'MODULES.SUPPLIERS',
  StaffPermission: 'MODULES.STAFFS',
  SalesPermission: 'MODULES.SALES',
  AccountingPermission: 'MODULES.ACCOUNTING',
  UserPermission: 'MODULES.USERS',
  RolePermission: 'MODULES.ROLES',
  SettingsPermission: 'MODULES.SETTINGS',
  ReportPermission: 'MODULES.REPORTS',
  RawMaterialPermission: 'MODULES.RAW_MATERIALS',
  ProductionPermission: 'MODULES.PRODUCTION',
  RouteOperationPermission: 'MODULES.ROUTE_OPERATIONS',
  PayrollPermission: 'MODULES.PAYROLL',
  HelpPermission: 'MODULES.HELP',
  SystemPermission: 'MODULES.SYSTEM'
};

const groupRegex = /export const (\w+) = \{([\s\S]*?)\};/g;

data = data.replace(groupRegex, (match, groupName, groupContent) => {
  if (dict[groupName]) {
    const mod = dict[groupName];
    // Find each line like: DETAILS: `products.details.${RoleActions.VIEW}` as const,
    const rep = groupContent.replace(/([A-Z0-9_]+)\s*:\s*([^,]+),/g, (m, key, val) => {
      let action = 'ACTIONS.VIEW';
      if(val.includes('CREATE') || key.includes('CREATE')) action = 'ACTIONS.CREATE';
      else if(val.includes('EDIT') || key.includes('EDIT') || val.includes('UPDATE')) action = 'ACTIONS.UPDATE';
      else if(val.includes('DELETE') || key.includes('DELETE')) action = 'ACTIONS.DELETE';
      else if(val.includes('MANAGE') || key.includes('MANAGE') || val.includes('ACCESS_ALL')) action = 'ACTIONS.MANAGE';
      else if(val.includes('EXPORT') || key.includes('EXPORT')) action = 'ACTIONS.EXPORT';
      else if(val.includes('APPROVE') || key.includes('APPROVE')) action = 'ACTIONS.APPROVE';
      else if(val.includes('LIST') || key.includes('LIST') || val.includes('list')) action = 'ACTIONS.LIST';
      
      return `${key}: \`\${${mod}}.\${${action}}\` as const,`;
    });
    return `export const ${groupName} = {${rep}};`;
  }
  return match;
});

// Remove RoleActions
data = data.replace(/export const RoleActions = \{[\s\S]*?\} as const;\s*\n/, '');

// Add LIST to ACTIONS if missing
if (!data.includes("LIST: 'list'")) {
    data = data.replace(/export const ACTIONS = \{([\s\S]*?)\}/, "export const ACTIONS = {$1  LIST: 'list',\n}");
}

// Add HELP and ROUTE_OPERATIONS to APP_PERMISSIONS if missing
if (!data.includes("module: MODULES.HELP")) {
    data = data.replace(/module: MODULES.SYSTEM.*\] \}/, "$&\n  , { module: MODULES.HELP, label: 'Help', actions: [ACTIONS.VIEW] }\n  , { module: MODULES.ROUTE_OPERATIONS, label: 'Route Operations', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] }");
}

fs.writeFileSync(fp, data);
console.log('Permissions updated successfully.');
