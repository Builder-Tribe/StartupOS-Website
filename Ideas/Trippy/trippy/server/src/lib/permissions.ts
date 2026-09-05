// Canonical permission catalog. Logic keys off these strings, never off role
// names, so roles remain fully configurable in the DB.
export const PERMISSIONS: { key: string; grp: string; label: string }[] = [
  { key: 'dashboard.view', grp: 'Dashboard', label: 'View dashboard' },
  { key: 'analytics.view', grp: 'Dashboard', label: 'View analytics' },

  { key: 'partners.view', grp: 'Partners', label: 'View partners' },
  { key: 'partners.create', grp: 'Partners', label: 'Create partners' },
  { key: 'partners.edit', grp: 'Partners', label: 'Edit partners' },
  { key: 'partners.activate', grp: 'Partners', label: 'Activate partners' },
  { key: 'partners.suspend', grp: 'Partners', label: 'Suspend / offboard partners' },
  { key: 'partners.users.view', grp: 'Partners', label: 'View partner users' },
  { key: 'partners.users.manage', grp: 'Partners', label: 'Manage partner users' },
  { key: 'partners.notes.manage', grp: 'Partners', label: 'Manage partner notes' },
  { key: 'partners.export', grp: 'Partners', label: 'Export partners' },

  { key: 'trips.view', grp: 'Trips', label: 'View trips' },
  { key: 'trips.edit', grp: 'Trips', label: 'Edit trips' },
  { key: 'trips.publish', grp: 'Trips', label: 'Publish trips' },
  { key: 'trips.unpublish', grp: 'Trips', label: 'Unpublish trips' },
  { key: 'trips.suspend', grp: 'Trips', label: 'Suspend / restore trips' },
  { key: 'trips.archive', grp: 'Trips', label: 'Archive trips' },
  { key: 'trips.feature', grp: 'Trips', label: 'Feature trips' },
  { key: 'trips.notes.manage', grp: 'Trips', label: 'Manage trip notes' },
  { key: 'trips.export', grp: 'Trips', label: 'Export trips' },

  { key: 'hostels.view', grp: 'Hostels', label: 'View hostels' },
  { key: 'hostels.create', grp: 'Hostels', label: 'Create hostels' },
  { key: 'hostels.edit', grp: 'Hostels', label: 'Edit hostels' },
  { key: 'hostels.publish', grp: 'Hostels', label: 'Publish hostels' },
  { key: 'hostels.unpublish', grp: 'Hostels', label: 'Unpublish hostels' },
  { key: 'hostels.suspend', grp: 'Hostels', label: 'Suspend / restore hostels' },
  { key: 'hostels.archive', grp: 'Hostels', label: 'Archive / close hostels' },
  { key: 'hostels.feature', grp: 'Hostels', label: 'Feature hostels' },
  { key: 'hostels.notes.manage', grp: 'Hostels', label: 'Manage hostel notes' },
  { key: 'hostels.export', grp: 'Hostels', label: 'Export hostels' },

  { key: 'travellers.view', grp: 'Travellers', label: 'View travellers' },
  { key: 'travellers.edit', grp: 'Travellers', label: 'Edit travellers' },
  { key: 'travellers.suspend', grp: 'Travellers', label: 'Suspend / reactivate travellers' },
  { key: 'travellers.verify', grp: 'Travellers', label: 'Review ID verifications' },
  { key: 'travellers.sessions.view', grp: 'Travellers', label: 'View sessions & login activity' },
  { key: 'travellers.sessions.revoke', grp: 'Travellers', label: 'Revoke sessions' },
  { key: 'travellers.notes.manage', grp: 'Travellers', label: 'Manage traveller notes' },
  { key: 'travellers.export', grp: 'Travellers', label: 'Export travellers' },

  { key: 'admin_users.view', grp: 'Administration', label: 'View admin users' },
  { key: 'admin_users.invite', grp: 'Administration', label: 'Invite admin users' },
  { key: 'admin_users.edit', grp: 'Administration', label: 'Edit admin users' },
  { key: 'admin_users.deactivate', grp: 'Administration', label: 'Deactivate admin users' },
  { key: 'admin_users.roles.manage', grp: 'Administration', label: 'Assign admin roles' },
  { key: 'roles.view', grp: 'Administration', label: 'View roles' },
  { key: 'roles.manage', grp: 'Administration', label: 'Manage roles & permissions' },
  { key: 'audit_logs.view', grp: 'Administration', label: 'View audit logs' },
]

export const ALL_PERMISSIONS = PERMISSIONS.map(p => p.key)

export const ROLES: { key: string; label: string; description: string }[] = [
  { key: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full access to everything, including roles.' },
  { key: 'FOUNDER', label: 'Founder', description: 'Full operational visibility and control.' },
  { key: 'OPERATIONS_ADMIN', label: 'Operations Admin', description: 'Day-to-day operations across all modules.' },
  { key: 'PARTNER_MANAGER', label: 'Partner Manager', description: 'Manage partners and their users.' },
  { key: 'TRIP_MANAGER', label: 'Trip Manager', description: 'Review and control trips.' },
  { key: 'HOSTEL_MANAGER', label: 'Hostel Manager', description: 'Create and manage hostels.' },
  { key: 'CUSTOMER_SUPPORT', label: 'Customer Support', description: 'Assist travellers, manage sessions.' },
  { key: 'ANALYST', label: 'Analyst', description: 'Read-only analytics and lists.' },
  { key: 'READ_ONLY_ADMIN', label: 'Read-only Admin', description: 'View everything, change nothing.' },
]

const viewAll = ['dashboard.view', 'analytics.view', 'partners.view', 'partners.users.view', 'trips.view', 'hostels.view', 'travellers.view', 'travellers.sessions.view', 'audit_logs.view', 'roles.view', 'admin_users.view']

// Default role → permission grants (seeded; editable in the DB afterwards).
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  FOUNDER: ALL_PERMISSIONS.filter(p => p !== 'roles.manage'),
  OPERATIONS_ADMIN: [
    ...viewAll, 'partners.edit', 'partners.activate', 'partners.suspend', 'partners.users.manage', 'partners.notes.manage', 'partners.export',
    'trips.edit', 'trips.publish', 'trips.unpublish', 'trips.suspend', 'trips.archive', 'trips.feature', 'trips.notes.manage', 'trips.export',
    'hostels.create', 'hostels.edit', 'hostels.publish', 'hostels.unpublish', 'hostels.suspend', 'hostels.archive', 'hostels.feature', 'hostels.notes.manage', 'hostels.export',
    'travellers.edit', 'travellers.suspend', 'travellers.verify', 'travellers.sessions.revoke', 'travellers.notes.manage', 'travellers.export',
  ],
  PARTNER_MANAGER: ['dashboard.view', 'partners.view', 'partners.create', 'partners.edit', 'partners.activate', 'partners.suspend', 'partners.users.view', 'partners.users.manage', 'partners.notes.manage', 'partners.export', 'trips.view'],
  TRIP_MANAGER: ['dashboard.view', 'trips.view', 'trips.edit', 'trips.publish', 'trips.unpublish', 'trips.suspend', 'trips.archive', 'trips.feature', 'trips.notes.manage', 'trips.export', 'partners.view'],
  HOSTEL_MANAGER: ['dashboard.view', 'hostels.view', 'hostels.create', 'hostels.edit', 'hostels.publish', 'hostels.unpublish', 'hostels.suspend', 'hostels.archive', 'hostels.feature', 'hostels.notes.manage', 'hostels.export'],
  CUSTOMER_SUPPORT: ['dashboard.view', 'travellers.view', 'travellers.edit', 'travellers.suspend', 'travellers.verify', 'travellers.sessions.view', 'travellers.sessions.revoke', 'travellers.notes.manage', 'partners.view', 'trips.view'],
  ANALYST: [...viewAll],
  READ_ONLY_ADMIN: [...viewAll],
}
