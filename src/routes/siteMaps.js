import paths, { rootPaths } from './paths';

export const dashboardRoutes = {
  label: 'MENU',
  labelDisable: false,
  children: [
    {
      name: 'Home',
      icon: 'home',
      to: rootPaths.root,
      exact: true,
      active: true
    }
  ]
};
export const appRoutes = {
  label: '',
  labelDisable: true,
  children: [
    // ── Platform Admin Only ──
    {
      name: 'Carriers',
      icon: 'satellite-dish',
      active: true,
      to: paths.smsListProviders,
      roles: ['PLATFORM_ADMIN']
    },
    {
      name: 'Companies',
      icon: 'network-wired',
      active: true,
      to: paths.smsCompaniesList,
      roles: ['PLATFORM_ADMIN'],
    },
    {
      name: 'Domain',
      icon: 'globe',
      active: true,
      to: paths.smsDomainList,
      roles: ['PLATFORM_ADMIN']
    },
    {
      name: 'IP Management',
      icon: 'server',
      active: true,
      to: paths.smsIpManagement,
      roles: ['PLATFORM_ADMIN'],
    },
    {
      name: 'Clients',
      icon: 'users',
      active: true,
      to: paths.smsClientsList,
      roles: ['PLATFORM_ADMIN'],
    },
    {
      name: 'Carriers',
      icon: 'satellite-dish',
      active: true,
      to: paths.smsListProviders,
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
    },

    // ── Company Admin Only ──
    // {
    //   name: 'My Company',
    //   icon: 'network-wired',
    //   active: true,
    //   to: paths.smsCompaniesList,
    //   roles: ['COMPANY_ADMIN'],
    //   companyAdminViewUpdateOnly: true
    // },
    {
      name: 'My Clients',
      icon: 'users',
      active: true,
      to: paths.smsClientsList,
      roles: ['COMPANY_ADMIN'],
      companyAdminViewUpdateOnly: true
    },

    // ── Account (Platform + Company) ──
    {
      name: 'Account',
      icon: 'chart-pie',
      active: true,
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
      children: [
        {
          name: 'Settings',
          to: paths.smsAccountSettings,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        },
        {
          name: 'API & Log',
          to: paths.smsAccountApiKeys,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        },
        {
          name: 'Overview',
          to: paths.smsAccountOverview,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        },
        {
          name: 'Billing',
          to: paths.smsAccountBilling,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        }
      ]
    },

    // ── Users & Roles (Platform Admin) ──
    {
      name: 'Users & Roles',
      icon: 'user',
      active: true,
      roles: ['PLATFORM_ADMIN'],
      children: [
        {
          name: 'Users',
          to: paths.smsUsersList,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Roles',
          to: paths.smsRolesList,
          active: true,
          roles: ['PLATFORM_ADMIN']
        }
      ]
    },

    // ── Users (Company Admin - their own users & client users) ──
    {
      name: 'Users',
      icon: 'user',
      active: true,
      to: paths.smsUsersList,
      roles: ['COMPANY_ADMIN'],
      companyAdminCanAddViewDeleteDeactivate: true
    },

    // ── SMS Test Panel (Company + Client roles) ──
    {
      name: 'SMS Test Panel',
      icon: 'comment-sms',
      active: true,
      roles: ['COMPANY_ADMIN', 'COMPANY_USER', 'CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'],
      children: [
        {
          name: 'SMS Test Numbers',
          to: paths.smsTestListNumbers,
          active: true,
          roles: ['COMPANY_ADMIN', 'COMPANY_USER', 'CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE']
        },
        {
          name: 'Recent Test SMS',
          to: paths.smsTestCdrs,
          active: true,
          roles: ['COMPANY_ADMIN', 'COMPANY_USER', 'CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE']
        }
      ]
    },

    // ── IPRN Module (Platform Admin - full CRUD) ──
    {
      name: 'IPRN Module',
      icon: 'layer-group',
      active: true,
      roles: ['PLATFORM_ADMIN'],
      children: [
        {
          name: 'SMS Providers',
          to: paths.smsListProviders,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'SMS Ranges',
          to: paths.smsCreateRanges,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'SMS Bulk Allocations',
          to: paths.smsBulkAllocations,
          active: true,
          roles: ['PLATFORM_ADMIN']
        }
      ]
    },

    // ── IPRN Module (Company roles: scoped ranges, numbers, pricing) ──
    {
      name: 'IPRN Module',
      icon: 'layer-group',
      active: true,
      roles: ['COMPANY_ADMIN', 'COMPANY_USER'],
      children: [
        {
          name: 'SMS Ranges',
          to: paths.smsCreateRanges,
          active: true,
          roles: ['COMPANY_ADMIN', 'COMPANY_USER']
        },
        {
          name: 'My SMS Numbers',
          to: paths.smsMyNumbers,
          active: true,
          roles: ['COMPANY_ADMIN', 'COMPANY_USER']
        }
      ]
    },

    // ── Reporting & Stats (Platform Admin - all stats) ──
    {
      name: 'Reporting & Stats',
      icon: 'chart-line',
      active: true,
      roles: ['PLATFORM_ADMIN'],
      children: [
        {
          name: 'CDR Reports',
          to: paths.smsCdrReports,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Client SMS Stats',
          to: paths.smsClientStats,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Provider SMS Stats',
          to: paths.smsProviderStats,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'SMS Range Stats',
          to: paths.smsRangeStats,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        // {
        //   name: 'Numbers Range Stats',
        //   to: paths.smsNumberStats,
        //   active: true,
        //   roles: ['PLATFORM_ADMIN']
        // },
        {
          name: 'Failed SMS',
          to: paths.smsFailedMessages,
          active: true,
          roles: ['PLATFORM_ADMIN']
        }
      ]
    },

    // ── Reporting & Stats (Company Admin - company-scoped) ──
    {
      name: 'Reporting & Stats',
      icon: 'chart-line',
      active: true,
      roles: ['COMPANY_ADMIN'],
      children: [
        {
          name: 'CDR Reports',
          to: paths.smsCdrReports,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'Client SMS Stats',
          to: paths.smsClientStats,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'Provider SMS Stats',
          to: paths.smsProviderStats,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'SMS Range Stats',
          to: paths.smsRangeStats,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'SMS Number Stats',
          to: paths.smsNumberStats,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'Failed SMS',
          to: paths.smsFailedMessages,
          active: true,
          roles: ['COMPANY_ADMIN']
        }
      ]
    },

    {
      name: 'OSS',
      icon: 'project-diagram',
      active: true,
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
      children: [
        {
          name: 'MT BSS',
          to: paths.smsMtBss,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        }
      ]
    },
    {
      name: 'EDRs',
      icon: 'stream',
      active: true,
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
      children: [
        {
          name: 'SMS MT EDR',
          to: paths.smsMtEdr,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        }
      ]
    },
    {
      name: 'Hot Access',
      icon: 'fire',
      active: true,
      roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN'],
      children: [
        {
          name: 'Hot Destination',
          to: paths.smsHotDestination,
          active: true,
          roles: ['PLATFORM_ADMIN', 'COMPANY_ADMIN']
        }
      ]
    },

    // ── Reporting & Stats (Client roles - client-scoped) ──
    {
      name: 'Reporting & Stats',
      icon: 'chart-line',
      active: true,
      roles: ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE'],
      children: [
        {
          name: 'CDR Reports',
          to: paths.smsCdrReports,
          active: true,
          roles: ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE']
        },
        {
          name: 'Failed SMS',
          to: paths.smsFailedMessages,
          active: true,
          roles: ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE']
        },
        {
          name: 'SMS Rate Card',
          to: paths.smsRateCardNumbers,
          active: true,
          roles: ['CLIENT_ADMIN', 'CLIENT_USER', 'CLIENT_FINANCE']
        }
      ]
    },

    // ── Payments (Platform Admin - full) ──
    {
      name: 'Payments',
      icon: 'money-bill',
      active: true,
      roles: ['PLATFORM_ADMIN'],
      children: [
        {
          name: 'Statements',
          to: paths.smsBills,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Payment Requests',
          to: paths.smsPaymentRequests,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Currencies',
          to: paths.smsPaymentCurrencies,
          active: true,
          roles: ['PLATFORM_ADMIN']
        },
        {
          name: 'Subscriptions',
          to: paths.smsSubscriptions,
          active: true,
          roles: ['PLATFORM_ADMIN']
        }
      ]
    },

    // ── Payments (Company Admin - statements + payment requests) ──
    {
      name: 'Payments',
      icon: 'money-bill',
      active: true,
      roles: ['COMPANY_ADMIN'],
      children: [
        {
          name: 'My Statements',
          to: paths.smsBills,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'Payment Requests',
          to: paths.smsPaymentRequests,
          active: true,
          roles: ['COMPANY_ADMIN']
        },
        {
          name: 'Admin Requests Payment',
          to: paths.smsAdminPaymentRequests,
          active: true,
          roles: ['COMPANY_ADMIN']
        }
      ]
    },

    // ── News ──
    {
      name: 'News',
      icon: 'newspaper',
      active: true,
      to: paths.smsNews
    },

    // ── Inbox ──
    {
      name: 'Inbox',
      icon: 'envelope',
      active: true,
      children: [
        {
          name: 'Messages',
          to: paths.smsInboxMessages,
          active: true,
          badge: {
            type: 'success',
            text: '3'
          }
        }
      ]
    },
    {
      name: 'FAQ',
      icon: 'question-circle',
      active: true,
      children: [
        {
          name: 'FAQ Extended',
          to: paths.smsFaq,
          active: true
        }
      ]
    }
  ]
};

export default [
  dashboardRoutes,
  appRoutes
];
