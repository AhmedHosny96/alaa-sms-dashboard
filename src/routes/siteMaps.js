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
    {
      name: 'Domain',
      icon: 'globe',
      active: true,
      children: [
        {
          name: 'Domain',
          to: paths.smsDomainList,
          active: true
        }
      ]
    },
    {
      name: 'Carriers',
      icon: 'satellite-dish',
      active: true,
      children: [
        {
          name: 'Carriers',
          to: paths.smsListProviders,
          active: true
        }
      ]
    },
    {
      name: 'Companies',
      icon: 'network-wired',
      active: true,
      children: [
        {
          name: 'Companies',
          to: paths.smsCompaniesList,
          active: true
        }
      ]
    },
    {
      name: 'Account',
      icon: 'chart-pie',
      active: true,
      children: [
        // {
        //   name: 'Settings',
        //   to: paths.smsAccountSettings,
        //   active: true
        // },
         {
          name: 'API Keys',
          to: paths.smsAccountApiKeys,
          active: true
        },
        {
          name: 'Billing',
          to: paths.smsAccountBilling,
          active: true
        },
       
        // {
        //   name: 'Overview',
        //   to: paths.smsAccountOverview,
        //   active: true
        // },
        {
          name: 'Audit Logs',
          to: paths.smsAuditLogs,
          active: true
        }
      ]
    },
    {
      name: 'Users & Roles',
      icon: 'user',
      active: true,
      children: [
        {
          name: 'Users',
          to: paths.smsUsersList,
          active: true
        },
        {
            name: 'Roles',
            to: paths.smsRolesList,
            active: true
          }
      ]
    },
    {
      name: 'Rate Card',
      icon: 'tags',
      active: true,
      children: [
        {
          name: 'Rate Card Numbers',
          to: paths.smsRateCardNumbers,
          active: true
        }
      ]
    },
    {
      name: 'SMS Test Panel',
      icon: 'comment-sms',
      active: true,
      children: [
        {
          name: 'SMS Numbers',
          to: paths.smsTestListNumbers,
          active: true
        },
        {
          name: 'SMS CDRs',
          to: paths.smsTestCdrs,
          active: true
        },
        {
          name: 'SMS Access',
          to: paths.smsTestAccessLastHour,
          active: true
        }
      ]
    },
    {
      name: 'IPRN SMS',
      icon: 'layer-group',
      active: true,
      children: [
        {
          name: 'SMS Providers',
          to: paths.smsRangeProviders,
          active: true
        },
        {
          name: 'SMS Ranges',
          to: paths.smsCreateRanges,
          active: true
        },
        {
          name: 'SMS Numbers',
          to: paths.smsMyNumbers,
          active: true
        },
        {
          name: 'SMS Bulk Allocations',
          to: paths.smsBulkAllocations,
          active: true
        }
      ]
    },
    {
      name: 'Reporting & Stats',
      icon: 'chart-line',
      active: true,
      children: [
        {
          name: 'CDR Reports',
          to: paths.smsCdrReports,
          active: true
        },
        {
          name: 'Client SMS Stats',
          to: paths.smsClientStats,
          active: true
        },
        {
          name: 'Provider SMS Stats',
          to: paths.smsProviderStats,
          active: true
        },
        {
          name: 'SMS Range Stats',
          to: paths.smsRangeStats,
          active: true
        },
        {
          name: 'Numbers Range Stats',
          to: paths.smsNumberStats,
          active: true
        },
        {
          name: 'Failed SMS',
          to: paths.smsFailedMessages,
          active: true
        }
      ]
    },
    {
      name: 'Subscriptions',
      icon: 'file-invoice-dollar',
      to: paths.smsSubscriptions,
      active: true
    },
    {
      name: 'Payments',
      icon: 'money-bill',
      active: true,
      children: [
        {
          name: 'Statements',
          to: paths.smsBills,
          active: true
        },
        {
          name: 'Currency',
          to: paths.smsPaymentCurrencies,
          active: true
        },
        {
          name: 'Payment Requests',
          to: paths.smsPaymentRequests,
          active: true
        }
      ]
    },
  
    
    {
      name: 'OSS',
      icon: 'server',
      active: true,
      children: [
        {
          name: 'MT BSS',
          to: paths.smsMtBss,
          active: true
        }
      ]
    },
    {
      name: 'EDRs',
      icon: 'database',
      active: true,
      children: [
        {
          name: 'SMS MT EDR',
          to: paths.smsMtEdr,
          active: true
        }
      ]
    },
    {
      name: 'Hot Access',
      icon: 'fire',
      active: true,
      children: [
        {
          name: 'Hot Destination',
          to: paths.smsHotDestination,
          active: true
        }
      ]
    },
    
    {
      name: 'Chat',
      icon: 'comments',
      active: true,
      children: [
        {
          name: 'Private Chat',
          to: paths.smsPrivateChat,
          active: true
        }
      ]
    },
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
