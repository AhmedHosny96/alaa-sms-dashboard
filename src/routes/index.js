import React, { Suspense, lazy } from 'react';
import App from 'App';
import paths, { rootPaths } from './paths';
import { Navigate, createBrowserRouter } from 'react-router';

import AuthSimpleLayout from '../layouts/AuthSimpleLayout';
import MainLayout from '../layouts/MainLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import WizardAuth from 'components/authentication/wizard/WizardAuth';
import Landing from 'components/pages/landing/Landing';
import Accordion from 'components/doc-components/Accordion';
import Alerts from 'components/doc-components/Alerts';
import Badges from 'components/doc-components/Badges';
import Breadcrumbs from 'components/doc-components/Breadcrumb';
import Buttons from 'components/doc-components/Buttons';
const CalendarExample = lazy(() =>
  import('components/doc-components/CalendarExample')
);
import Cards from 'components/doc-components/Cards';
import Dropdowns from 'components/doc-components/Dropdowns';
import ListGroups from 'components/doc-components/ListGroups';
import Modals from 'components/doc-components/Modals';
import Offcanvas from 'components/doc-components/Offcanvas';
import Pagination from 'components/doc-components/Pagination';
import BasicProgressBar from 'components/doc-components/ProgressBar';
import Spinners from 'components/doc-components/Spinners';
import Toasts from 'components/doc-components/Toasts';
import Avatar from 'components/doc-components/Avatar';
import Image from 'components/doc-components/Image';
import Tooltips from 'components/doc-components/Tooltips';
import Popovers from 'components/doc-components/Popovers';
import Figures from 'components/doc-components/Figures';
import Hoverbox from 'components/doc-components/Hoverbox';
import Tables from 'components/doc-components/Tables';
import FormControl from 'components/doc-components/FormControl';
import InputGroup from 'components/doc-components/InputGroup';
import Select from 'components/doc-components/Select';
import Checks from 'components/doc-components/Checks';
import Range from 'components/doc-components/Range';
import FormLayout from 'components/doc-components/FormLayout';
import FloatingLabels from 'components/doc-components/FloatingLabels';
import FormValidation from 'components/doc-components/FormValidation';
import BootstrapCarousel from 'components/doc-components/BootstrapCarousel';
import SlickCarousel from 'components/doc-components/SlickCarousel';
import Navs from 'components/doc-components/Navs';
import Navbars from 'components/doc-components/Navbars';
import Tabs from 'components/doc-components/Tabs';
import Collapse from 'components/doc-components/Collapse';
import CountUp from 'components/doc-components/CountUp';
import Embed from 'components/doc-components/Embed';
import Backgrounds from 'components/doc-components/Backgrounds';
import Search from 'components/doc-components/Search';
import VerticalNavbar from 'components/doc-components/VerticalNavbar';
import NavBarTop from 'components/doc-components/NavBarTop';
import NavbarDoubleTop from 'components/doc-components/NavbarDoubleTop';
import ComboNavbar from 'components/doc-components/ComboNavbar';
import TypedText from 'components/doc-components/TypedText';
import FileUploader from 'components/doc-components/FileUploader';
import Borders from 'components/utilities/Borders';
import Colors from 'components/utilities/Colors';
import Background from 'components/utilities/Background';
import ColoredLinks from 'components/utilities/ColoredLinks';
import Display from 'components/utilities/Display';
import Visibility from 'components/utilities/Visibility';
import StretchedLink from 'components/utilities/StretchedLink';
import Float from 'components/utilities/Float';
import Position from 'components/utilities/Position';
import Spacing from 'components/utilities/Spacing';
import Sizing from 'components/utilities/Sizing';
import TextTruncation from 'components/utilities/TextTruncation';
import Typography from 'components/utilities/Typography';
import VerticalAlign from 'components/utilities/VerticalAlign';
import Flex from 'components/utilities/Flex';
import Grid from 'components/utilities/Grid';
import WizardForms from 'components/doc-components/WizardForms';
import GettingStarted from 'components/documentation/GettingStarted';
import Configuration from 'components/documentation/Configuration';
import DarkMode from 'components/documentation/DarkMode';
import Plugins from 'components/documentation/Plugins';
import Styling from 'components/documentation/Styling';
import DesignFile from 'components/documentation/DesignFile';
import Starter from 'components/pages/Starter';
import AnimatedIcons from 'components/doc-components/AnimatedIcons';
import DatePicker from 'components/doc-components/DatePicker';
import FontAwesome from 'components/doc-components/FontAwesome';
import Changelog from 'components/documentation/change-log/ChangeLog';
const Analytics = lazy(() => import('components/dashboards/analytics'));
const Crm = lazy(() =>
  import('components/dashboards/crm')
);
const Saas = lazy(() =>
  import('components/dashboards/saas')
);
import Profile from 'components/pages/user/profile/Profile';
import Associations from 'components/pages/asscociations/Associations';
import Followers from 'components/app/social/followers/Followers';
import Notifications from 'components/app/social/notifications/Notifications';
import ActivityLog from 'components/app/social/activity-log/ActivityLog';
import Settings from 'components/pages/user/settings/Settings';
import Feed from 'components/app/social/feed/Feed';
import Placeholder from 'components/doc-components/Placeholder';
import Lightbox from 'components/doc-components/Lightbox';
import AdvanceTableExamples from 'components/doc-components/AdvanceTableExamples';
const Calendar = lazy(() => import('components/app/calendar/Calendar'));
import FaqAlt from 'components/pages/faq/faq-alt/FaqAlt';
import FaqBasic from 'components/pages/faq/faq-basic/FaqBasic';
import FaqAccordion from 'components/pages/faq/faq-accordion/FaqAccordion';
import PrivacyPolicy from 'components/pages/miscellaneous/privacy-policy/PrivacyPolicy';
import InvitePeople from 'components/pages/miscellaneous/invite-people/InvitePeople';
import PricingDefault from 'components/pages/pricing/pricing-default/PricingDefault';
import PricingAlt from 'components/pages/pricing/pricing-alt/PricingAlt';
import Invoice from 'components/app/e-commerce/Invoice';
import Billing from 'components/app/e-commerce/billing/Billing';
import Checkout from 'components/app/e-commerce/checkout/Checkout';
import ShoppingCart from 'components/app/e-commerce/cart/ShoppingCart';
import CustomersDetails from 'components/app/e-commerce/customers-details/CustomersDetails';
import OrderDetails from 'components/app/e-commerce/orders/order-details/OrderDetails';
import Products from 'components/app/e-commerce/product/Products';
import ProductDetails from 'components/app/e-commerce/product/product-details/ProductDetails';
import AddProduct from 'components/app/e-commerce/product/add-product/AddProduct';
import Orders from 'components/app/e-commerce/orders/order-list/Orders';
import Customers from 'components/app/e-commerce/customers/Customers';
import Courses from 'components/app/e-learning/course/Courses';
import CourseDetails from 'components/app/e-learning/course/course-details';
import CreateCourse from 'components/app/e-learning/course/create-a-course';
import TrainerProfile from 'components/app/e-learning/trainer-profile';
import StudentOverview from 'components/app/e-learning/student-overview';
import CreateEvent from 'components/app/events/create-an-event/CreateEvent';
import EventList from 'components/app/events/event-list/EventList';
import EventDetail from 'components/app/events/event-detail/EventDetail';
import EmailDetail from 'components/app/email/email-detail/EmailDetail';
import Compose from 'components/app/email/compose/Compose';
import Inbox from 'components/app/email/inbox/Inbox';
import Rating from 'components/doc-components/Rating';
import AdvanceSelect from 'components/doc-components/AdvanceSelect';
import Editor from 'components/doc-components/Editor';
import Chat from 'components/app/chat/Chat';
const Kanban = lazy(() => import('components/app/kanban/Kanban'));
import DraggableExample from 'components/doc-components/DraggableExample';
const LineCharts = lazy(() => import('components/doc-components/charts-example/echarts/line-charts'));
const BarCharts = lazy(() => import('components/doc-components/charts-example/echarts/bar-charts'));
const CandlestickCharts = lazy(() => import('components/doc-components/charts-example/echarts/candlestick-charts'));
const GeoMaps = lazy(() => import('components/doc-components/charts-example/echarts/geo-map'));
const ScatterCharts = lazy(() => import('components/doc-components/charts-example/echarts/scatter-charts'));
const PieCharts = lazy(() => import('components/doc-components/charts-example/echarts/pie-charts'));
const RadarCharts = lazy(() => import('components/doc-components/charts-example/echarts/radar-charts/Index'));
const HeatmapCharts = lazy(() => import('components/doc-components/charts-example/echarts/heatmap-chart'));
const Chartjs = lazy(() => import('components/doc-components/charts-example/chartjs'));
const D3js = lazy(() => import('components/doc-components/charts-example/d3'));
import HowToUse from 'components/doc-components/charts-example/echarts/HowToUse';
const GoogleMapExample = lazy(() => import('components/doc-components/GoogleMapExample'));
import LeafletMapExample from 'components/doc-components/LeafletMapExample';
import CookieNoticeExample from 'components/doc-components/CookieNoticeExample';
import Scrollbar from 'components/doc-components/Scrollbar';
import Scrollspy from 'components/doc-components/Scrollspy';
import ReactIcons from 'components/doc-components/ReactIcons';
import ReactPlayerExample from 'components/doc-components/ReactPlayerExample';
import EmojiPickerExample from 'components/doc-components/EmojiPicker';
import TreeviewExample from 'components/doc-components/TreeviewExample';
import Timeline from 'components/doc-components/Timeline';
const Widgets = lazy(() => import('widgets/Widgets'));
const Ecommerce = lazy(() => import('components/dashboards/e-commerce'));
const Lms = lazy(() => import('components/dashboards/lms'));
const ProjectManagement = lazy(() => import('components/dashboards/project-management'));
import Migration from 'components/documentation/migration/Migration';

import Error404 from 'components/errors/Error404';
import Error500 from 'components/errors/Error500';

import SimpleLogin from 'components/authentication/simple/Login';
import SimpleLogout from 'components/authentication/simple/Logout';
import SimpleRegistration from 'components/authentication/simple/Registration';
import SimpleForgetPassword from 'components/authentication/simple/ForgetPassword';
import SimplePasswordReset from 'components/authentication/simple/PasswordReset';
import SimpleConfirmMail from 'components/authentication/simple/ConfirmMail';
import SimpleLockScreen from 'components/authentication/simple/LockScreen';
import CardLogin from 'components/authentication/card/Login';
import CardLogout from 'components/authentication/card/Logout';
import CardRegistration from 'components/authentication/card/Registration';
import CardForgetPassword from 'components/authentication/card/ForgetPassword';
import CardConfirmMail from 'components/authentication/card/ConfirmMail';
import CardPasswordReset from 'components/authentication/card/PasswordReset';
import CardLockScreen from 'components/authentication/card/LockScreen';
import SplitLogin from 'components/authentication/split/Login';
import SplitLogout from 'components/authentication/split/Logout';
import SplitRegistration from 'components/authentication/split/Registration';
import SplitForgetPassword from 'components/authentication/split/ForgetPassword';
import SplitPasswordReset from 'components/authentication/split/PasswordReset';
import SplitConfirmMail from 'components/authentication/split/ConfirmMail';
import SplitLockScreen from 'components/authentication/split/LockScreen';
const Dashboard = lazy(() => import('components/dashboards/default'));
import Faq from 'components/documentation/Faq';
const SupportDesk = lazy(() => import('components/dashboards/support-desk'));
import TableView from 'components/app/support-desk/tickets-layout/TableView';
import CardView from 'components/app/support-desk/tickets-layout/CardView';
import Contacts from 'components/app/support-desk/contacts/Contacts';
import ContactDetails from 'components/app/support-desk/contact-details/ContactDetails';
import TicketsPreview from 'components/app/support-desk/tickets-preview/TicketsPreview';
import QuickLinks from 'components/app/support-desk/quick-links/QuickLinks';
import Reports from 'components/app/support-desk/reports/Reports';
// SMS Platform Components
import SmsDashboard from 'components/sms/SmsDashboard';
import DomainList from 'components/sms/DomainList';
import ListProviders from 'components/sms/ListProviders';
import CompaniesList from 'components/sms/CompaniesList';
import AccountSettings from 'components/sms/AccountSettings';
import AccountBilling from 'components/sms/AccountBilling';
import ApiKeys from 'components/sms/ApiKeys';
import AccountOverview from 'components/sms/AccountOverview';
import UserList from 'components/sms/users/UserList';
import RoleList from 'components/sms/roles/RoleList';
import RateCardNumbers from 'components/sms/RateCardNumbers';
import TestListNumbers from 'components/sms/TestListNumbers';
import TestCdrs from 'components/sms/TestCdrs';
import AccessListLastHour from 'components/sms/AccessListLastHour';
import CreateRanges from 'components/sms/CreateRanges';
import UploadNumbers from 'components/sms/UploadNumbers';
import MyNumbers from 'components/sms/MyNumbers';
import BulkAllocations from 'components/sms/BulkAllocations';
import CdrReports from 'components/sms/CdrReports';
import ClientStats from 'components/sms/ClientStats';
import ProviderStats from 'components/sms/ProviderStats';
import RangeStats from 'components/sms/RangeStats';
import NumberStats from 'components/sms/NumberStats';
import FailedMessages from 'components/sms/FailedMessages';
import MtBss from 'components/sms/MtBss';
import MtEdr from 'components/sms/MtEdr';
import HotDestination from 'components/sms/HotDestination';
import Bills from 'components/sms/Bills';
import PaymentRequests from 'components/sms/PaymentRequests';
import AdminPaymentRequests from 'components/sms/AdminPaymentRequests';
import PaymentCurrencies from 'components/sms/PaymentCurrencies';
import Subscriptions from 'components/sms/Subscriptions';
import PrivateChat from 'components/sms/PrivateChat';
import InboxMessages from 'components/sms/InboxMessages';
import FaqExtended from 'components/sms/FaqExtended';
import AuditLogs from 'components/sms/AuditLogs';
import InputMaskExample from 'components/doc-components/InputMaskExample';
import RangeSlider from 'components/doc-components/RangeSlider';
import VerticalNavLayout from 'layouts/VerticalNavLayout';
import TopNavLayout from 'layouts/TopNavLayout';
import ComboNavLayout from 'layouts/ComboNavLayout';
import DoubleTopNavLayout from 'layouts/DoubleTopNavLayout';
import FalconLoader from 'components/common/FalconLoader';
import RequireAuth from 'components/authentication/RequireAuth';

const routes = [
  {
    element: <App />,
    children: [
      {
        path: 'landing',
        element: (
          <RequireAuth>
            <Landing />
          </RequireAuth>
        )
      },
      {
        path: rootPaths.errorsRoot,
        element: <ErrorLayout />,
        children: [
          {
            path: paths.error404,
            element: <Error404 />
          },
          {
            path: paths.error500,
            element: <Error500 />
          }
        ]
      },
      {
        path: rootPaths.authRoot,
        children: [
          {
            path: rootPaths.authSimpleRoot,
            element: <AuthSimpleLayout />,
            children: [
              {
                path: paths.simpleRegister,
                element: <SimpleRegistration />
              },
              {
                path: paths.simpleLogout,
                element: <SimpleLogout />
              },
              {
                path: paths.simpleForgotPassword,
                element: <SimpleForgetPassword />
              },
              {
                path: paths.simpleResetPassword,
                element: <SimplePasswordReset />
              },
              {
                path: paths.simpleConfirmMail,
                element: <SimpleConfirmMail />
              },
              {
                path: paths.simpleLockScreen,
                element: <SimpleLockScreen />
              }
            ]
          },
          {
            path: rootPaths.authCardRoot,
            children: [
              {
                path: paths.cardLogin,
                element: <CardLogin />
              },
              {
                path: paths.cardRegister,
                element: <CardRegistration />
              },
              {
                path: paths.cardLogout,
                element: <CardLogout />
              },
              {
                path: paths.cardForgotPassword,
                element: <CardForgetPassword />
              },
              {
                path: paths.cardResetPassword,
                element: <CardPasswordReset />
              },
              {
                path: paths.cardConfirmMail,
                element: <CardConfirmMail />
              },
              {
                path: paths.cardLockScreen,
                element: <CardLockScreen />
              }
            ]
          },
          {
            path: rootPaths.authSplitRoot,
            children: [
              {
                path: paths.splitLogin,
                element: <SplitLogin />
              },
              {
                path: paths.splitRegister,
                element: <SplitRegistration />
              },
              {
                path: paths.splitLogout,
                element: <SplitLogout />
              },
              {
                path: paths.splitForgotPassword,
                element: <SplitForgetPassword />
              },
              {
                path: paths.splitResetPassword,
                element: <SplitPasswordReset />
              },
              {
                path: paths.splitConfirmMail,
                element: <SplitConfirmMail />
              },
              {
                path: paths.splitLockScreen,
                element: <SplitLockScreen />
              }
            ]
          },
          {
            path: paths.authWizard,
            element: <WizardAuth />
          }
        ]
      },
      {
        path: paths.simpleLogin,
        element: <AuthSimpleLayout />,
        children: [
          {
            index: true,
            element: <SimpleLogin />
          }
        ]
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense key="dashboard-default" fallback={<FalconLoader />}>
                <Dashboard />
              </Suspense>
            )
          },
          {
            path: rootPaths.appsRoot,
            children: [
              {
                path: paths.calendar,
                element: (
                  <Suspense key="calendar" fallback={<FalconLoader />}>
                    <Calendar />
                  </Suspense>
                )
              },
              {
                path: paths.chat,
                element: <Chat />
              },
              {
                path: paths.kanban,
                element: (
                  <Suspense key="kanban" fallback={<FalconLoader />}>
                    <Kanban />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.smsRoot,
            children: [
              {
                path: 'dashboard',
                element: <SmsDashboard />
              },
              // Domain
              {
                path: 'domain/list',
                element: <DomainList />
              },
              // Domain (add/edit on list page)
              {
                path: 'domain/new',
                element: <Navigate to={`/${rootPaths.smsRoot}/domain/list`} replace />
              },
              // Providers (moved to IPRN range providers)
              {
                path: 'providers/add',
                element: <Navigate to={`/${rootPaths.smsRoot}/providers/list`} replace />
              },
              {
                path: 'providers/list',
                element: <ListProviders />
              },
              // Companies (HTTP Connections)
              {
                path: 'companies/connections',
                element: <Navigate to={`/${rootPaths.smsRoot}/companies/list`} replace />
              },
              {
                path: 'companies/list',
                element: <CompaniesList />
              },
              // Accounting
              {
                path: 'accounting/audit-logs',
                element: <AuditLogs />
              },
              // Account
              {
                path: 'account/settings',
                element: <AccountSettings />
              },
              {
                path: 'account/billing',
                element: <AccountBilling />
              },
              {
                path: 'account/apikeys',
                element: <ApiKeys />
              },
              {
                path: 'account/overview',
                element: <AccountOverview />
              },
              // User Management (add/edit on list page)
              {
                path: 'users/add',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              {
                path: 'users/edit',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              {
                path: 'users/view',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              {
                path: 'users/list',
                element: <UserList />
              },
              {
                path: 'users/roles',
                element: <RoleList />
              },
              {
                path: 'users/admins',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              {
                path: 'users/agents',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              {
                path: 'users/clients',
                element: <Navigate to={`/${rootPaths.smsRoot}/users/list`} replace />
              },
              // Rate Card (add on list page)
              {
                path: 'ratecard/numbers',
                element: <RateCardNumbers />
              },
              {
                path: 'ratecard/new',
                element: <Navigate to={`/${rootPaths.smsRoot}/ratecard/numbers`} replace />
              },
              // SMS Test Panel
              {
                path: 'test/list-numbers',
                element: <TestListNumbers />
              },
              {
                path: 'test/cdrs',
                element: <TestCdrs />
              },
              {
                path: 'test/access-last-hour',
                element: <AccessListLastHour />
              },
              // IPRN SMS
              {
                path: 'iprn/range-providers',
                element: <ListProviders />
              },
              {
                path: 'iprn/create-ranges',
                element: <CreateRanges />
              },
              {
                path: 'iprn/upload-numbers',
                element: <UploadNumbers />
              },
              {
                path: 'iprn/my-numbers',
                element: <MyNumbers />
              },
              {
                path: 'iprn/bulk-allocations',
                element: <BulkAllocations />
              },
              // Statistics
              {
                path: 'statistics/cdr-reports',
                element: <CdrReports />
              },
              {
                path: 'statistics/client-stats',
                element: <ClientStats />
              },
              {
                path: 'statistics/provider-stats',
                element: <ProviderStats />
              },
              {
                path: 'statistics/range-stats',
                element: <RangeStats />
              },
              {
                path: 'statistics/number-stats',
                element: <NumberStats />
              },
              {
                path: 'statistics/failed',
                element: <FailedMessages />
              },
              // OSS
              {
                path: 'oss/mt-bss',
                element: <MtBss />
              },
              // EDRs
              {
                path: 'edrs/mt-edr',
                element: <MtEdr />
              },
              // Hot Access
              {
                path: 'hot-access/destination',
                element: <HotDestination />
              },
              // Payment Requests
              {
                path: 'payment/bills',
                element: <Bills />
              },
              {
                path: 'payment/requests',
                element: <PaymentRequests />
              },
              {
                path: 'payment/admin-requests',
                element: <Navigate to={`/${rootPaths.smsRoot}/payment/requests`} replace />
              },
              {
                path: 'payment/currencies',
                element: <PaymentCurrencies />
              },
              {
                path: 'payment/subscriptions',
                element: <Subscriptions />
              },
              // Chat & Support
              {
                path: 'chat/private',
                element: <PrivateChat />
              },
              {
                path: 'inbox/messages',
                element: <InboxMessages />
              },
              {
                path: 'faq',
                element: <FaqExtended />
              }
            ]
          },
          {
            path: rootPaths.emailRoot,
            children: [
              {
                path: paths.emailInbox,
                element: <Inbox />
              },
              {
                path: paths.emailDetail,
                element: <EmailDetail />
              },
              {
                path: paths.emailCompose,
                element: <Compose />
              }
            ]
          },
          {
            path: rootPaths.eventsRoot,
            children: [
              {
                path: paths.createEvent,
                element: <CreateEvent />
              },
              {
                path: paths.eventDetail,
                element: <EventDetail />
              },
              {
                path: paths.eventList,
                element: <EventList />
              }
            ]
          },
          {
            path: rootPaths.socialRoot,
            children: [
              {
                path: paths.feed,
                element: <Feed />
              },
              {
                path: paths.activityLog,
                element: <ActivityLog />
              },
              {
                path: paths.notifications,
                element: <Notifications />
              },
              {
                path: paths.followers,
                element: <Followers />
              }
            ]
          },
          {
            path: rootPaths.eCommerceRoot,
            children: [
              {
                path: paths.orderDetails,
                element: <OrderDetails />
              },
              {
                path: paths.orderList,
                element: <Orders />
              },
              {
                path: paths.customers,
                element: <Customers />
              },
              {
                path: paths.customerDetails,
                element: <CustomersDetails />
              },
              {
                path: paths.shoppingCart,
                element: <ShoppingCart />
              },
              {
                path: paths.checkout,
                element: <Checkout />
              },
              {
                path: paths.billing,
                element: <Billing />
              },
              {
                path: paths.invoice,
                element: <Invoice />
              },
              {
                path: paths.addProduct,
                element: <AddProduct />
              },
              {
                path: paths.products(':productLayout'),
                element: <Products />
              },
              {
                path: paths.productDetails(':productId'),
                element: <ProductDetails />
              },
              {
                path: paths.productDetails(),
                element: <ProductDetails />
              }
            ]
          },
          {
            path: rootPaths.eLearningRoot,
            children: [
              {
                path: paths.courses(':courseLayout'),
                element: <Courses />
              },
              {
                path: paths.courseDetails(),
                element: <CourseDetails />
              },
              {
                path: paths.createCourse,
                element: <CreateCourse />
              },
              {
                path: paths.courseDetails(':courseId'),
                element: <CourseDetails />
              },
              {
                path: paths.studentOverview,
                element: <StudentOverview />
              },
              {
                path: paths.trainerProfile,
                element: <TrainerProfile />
              }
            ]
          },
          {
            path: rootPaths.supportDeskRoot,
            children: [
              {
                path: paths.ticketsTable,
                element: <TableView />
              },
              {
                path: paths.ticketsCard,
                element: <CardView />
              },
              {
                path: paths.contacts,
                element: <Contacts />
              },
              {
                path: paths.contactDetails,
                element: <ContactDetails />
              },
              {
                path: paths.ticketsPreview,
                element: <TicketsPreview />
              },
              {
                path: paths.quickLinks,
                element: <QuickLinks />
              },
              {
                path: paths.reports,
                element: <Reports />
              }
            ]
          },
          {
            path: rootPaths.pagesRoot,
            children: [
              {
                path: paths.starter,
                element: <Starter />
              }
            ]
          },
          {
            path: rootPaths.userRoot,
            children: [
              {
                path: paths.userProfile,
                element: <Profile />
              },
              {
                path: paths.userSettings,
                element: <Settings />
              }
            ]
          },
          {
            path: rootPaths.pricingRoot,
            children: [
              {
                path: paths.pricingDefault,
                element: <PricingDefault />
              },
              {
                path: paths.pricingAlt,
                element: <PricingAlt />
              }
            ]
          },
          {
            path: rootPaths.faqRoot,
            children: [
              {
                path: paths.faqBasic,
                element: <FaqBasic />
              },
              {
                path: paths.faqAlt,
                element: <FaqAlt />
              },
              {
                path: paths.faqAccordion,
                element: <FaqAccordion />
              }
            ]
          },
          {
            path: rootPaths.miscRoot,
            children: [
              {
                path: paths.associations,
                element: <Associations />
              },
              {
                path: paths.invitePeople,
                element: <InvitePeople />
              },
              {
                path: paths.privacyPolicy,
                element: <PrivacyPolicy />
              }
            ]
          },
          {
            path: rootPaths.formsRoot,
            children: [
              {
                path: rootPaths.basicFormsRoot,
                children: [
                  {
                    path: paths.formControl,
                    element: <FormControl />
                  },
                  {
                    path: paths.inputGroup,
                    element: <InputGroup />
                  },
                  {
                    path: paths.select,
                    element: <Select />
                  },
                  {
                    path: paths.checks,
                    element: <Checks />
                  },
                  {
                    path: paths.range,
                    element: <Range />
                  },
                  {
                    path: paths.formLayout,
                    element: <FormLayout />
                  }
                ]
              },
              {
                path: rootPaths.advanceFormsRoot,
                children: [
                  {
                    path: paths.advanceSelect,
                    element: <AdvanceSelect />
                  },
                  {
                    path: paths.datePicker,
                    element: <DatePicker />
                  },
                  {
                    path: paths.editor,
                    element: <Editor />
                  },
                  {
                    path: paths.emojiButton,
                    element: <EmojiPickerExample />
                  },
                  {
                    path: paths.fileUploader,
                    element: <FileUploader />
                  },
                  {
                    path: paths.inputMask,
                    element: <InputMaskExample />
                  },
                  {
                    path: paths.rangeSlider,
                    element: <RangeSlider />
                  },
                  {
                    path: paths.rating,
                    element: <Rating />
                  }
                ]
              },
              {
                path: paths.floatingLabels,
                element: <FloatingLabels />
              },
              {
                path: paths.wizard,
                element: <WizardForms />
              },
              {
                path: paths.validation,
                element: <FormValidation />
              }
            ]
          },
          {
            path: rootPaths.tableRoot,
            children: [
              {
                path: paths.basicTables,
                element: <Tables />
              },
              {
                path: paths.advanceTables,
                element: <AdvanceTableExamples />
              }
            ]
          },
          {
            path: rootPaths.chartsRoot,
            children: [
              {
                path: paths.chartjs,
                element: (
                  <Suspense key="chartjs" fallback={<FalconLoader />}>
                    <Chartjs />
                  </Suspense>
                )
              },
              {
                path: paths.d3js,
                element: (
                  <Suspense key="d3j" fallback={<FalconLoader />}>
                    <D3js />
                  </Suspense>
                )
              },
              {
                path: rootPaths.echartsRoot,
                children: [
                  {
                    path: paths.echartsHowToUse,
                    element: <HowToUse />
                  },
                  {
                    path: paths.lineCharts,
                    element: (
                      <Suspense key="echarts-lineChart" fallback={<FalconLoader />}>
                        <LineCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.barCharts,
                    element: (
                      <Suspense key="echarts-barChart" fallback={<FalconLoader />}>
                        <BarCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.candlestickCharts,
                    element: (
                      <Suspense key="echarts-candleStick" fallback={<FalconLoader />}>
                        <CandlestickCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.geoMap,
                    element: (
                      <Suspense key="echarts-geoMap" fallback={<FalconLoader />}>
                        <GeoMaps />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.scatterCharts,
                    element: (
                      <Suspense key="echarts-scatterChart" fallback={<FalconLoader />}>
                        <ScatterCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.pieCharts,
                    element: (
                      <Suspense key="echarts-pieChart" fallback={<FalconLoader />}>
                        <PieCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.radarCharts,
                    element: (
                      <Suspense key="echarts-radarChart" fallback={<FalconLoader />}>
                        <RadarCharts />
                      </Suspense>
                    )
                  },
                  {
                    path: paths.heatmapCharts,
                    element: (
                      <Suspense key="echarts-heatmapChart" fallback={<FalconLoader />}>
                        <HeatmapCharts />
                      </Suspense>
                    )
                  }
                ]
              }
            ]
          },
          {
            path: rootPaths.iconsRoot,
            children: [
              {
                path: paths.fontAwesome,
                element: <FontAwesome />
              },
              {
                path: paths.reactIcons,
                element: <ReactIcons />
              }
            ]
          },
          {
            path: rootPaths.mapsRoot,
            children: [
              {
                path: paths.googleMap,
                element: (
                  <Suspense key="googleMap" fallback={<FalconLoader />}>
                    <GoogleMapExample />
                  </Suspense>
                )
              },
              {
                path: paths.leafletMap,
                element: (
                  <Suspense key="leafletMap" fallback={<FalconLoader />}>
                    <LeafletMapExample />
                  </Suspense>
                )
              }
            ]
          },
          {
            path: rootPaths.componentsRoot,
            children: [
              {
                path: paths.alerts,
                element: <Alerts />
              },
              {
                path: paths.accordion,
                element: <Accordion />
              },
              {
                path: paths.animatedIcons,
                element: <AnimatedIcons />
              },
              {
                path: paths.background,
                element: <Backgrounds />
              },
              {
                path: paths.badges,
                element: <Badges />
              },
              {
                path: paths.breadcrumbs,
                element: <Breadcrumbs />
              },
              {
                path: paths.buttons,
                element: <Buttons />
              },
              {
                path: paths.calendarExample,
                element: <CalendarExample />
              },
              {
                path: paths.cards,
                element: <Cards />
              },
              {
                path: paths.cards,
                element: <Cards />
              },
              {
                path: rootPaths.carouselRoot,
                children: [
                  {
                    path: paths.bootstrapCarousel,
                    element: <BootstrapCarousel />
                  },
                  {
                    path: paths.slickCarousel,
                    element: <SlickCarousel />
                  }
                ]
              },
              {
                path: paths.collapse,
                element: <Collapse />
              },
              {
                path: paths.cookieNotice,
                element: <CookieNoticeExample />
              },
              {
                path: paths.countup,
                element: <CountUp />
              },
              {
                path: paths.draggable,
                element: <DraggableExample />
              },
              {
                path: paths.dropdowns,
                element: <Dropdowns />
              },
              {
                path: paths.listGroup,
                element: <ListGroups />
              },
              {
                path: paths.modals,
                element: <Modals />
              },
              {
                path: paths.offcanvas,
                element: <Offcanvas />
              },
              {
                path: rootPaths.navsAndTabsRoot,
                children: [
                  {
                    path: paths.navs,
                    element: <Navs />
                  },
                  {
                    path: paths.navbar,
                    element: <Navbars />
                  },
                  {
                    path: paths.verticalNavbar,
                    element: <VerticalNavbar />
                  },
                  {
                    path: paths.topNavbar,
                    element: <NavBarTop />
                  },
                  {
                    path: paths.doubleTopNavbar,
                    element: <NavbarDoubleTop />
                  },
                  {
                    path: paths.comboNavbar,
                    element: <ComboNavbar />
                  },
                  {
                    path: paths.tabs,
                    element: <Tabs />
                  }
                ]
              },
              {
                path: rootPaths.picturesRoot,
                children: [
                  {
                    path: paths.avatar,
                    element: <Avatar />
                  },
                  {
                    path: paths.images,
                    element: <Image />
                  },
                  {
                    path: paths.figures,
                    element: <Figures />
                  },
                  {
                    path: paths.hoverbox,
                    element: <Hoverbox />
                  },
                  {
                    path: paths.lightbox,
                    element: <Lightbox />
                  }
                ]
              },
              {
                path: paths.progressBar,
                element: <BasicProgressBar />
              },
              {
                path: paths.pagination,
                element: <Pagination />
              },
              {
                path: paths.placeholder,
                element: <Placeholder />
              },
              {
                path: paths.popovers,
                element: <Popovers />
              },
              {
                path: paths.scrollspy,
                element: <Scrollspy />
              },
              {
                path: paths.search,
                element: <Search />
              },
              {
                path: paths.spinners,
                element: <Spinners />
              },
              {
                path: paths.timeline,
                element: <Timeline />
              },
              {
                path: paths.toasts,
                element: <Toasts />
              },
              {
                path: paths.tooltips,
                element: <Tooltips />
              },
              {
                path: paths.treeview,
                element: <TreeviewExample />
              },
              {
                path: paths.typedText,
                element: <TypedText />
              },
              {
                path: rootPaths.videosRoot,
                children: [
                  {
                    path: paths.embedVideo,
                    element: <Embed />
                  },
                  {
                    path: paths.reactPlayer,
                    element: <ReactPlayerExample />
                  }
                ]
              }
            ]
          },
          {
            path: rootPaths.utilitiesRoot,
            children: [
              {
                path: paths.backgroundColor,
                element: <Background />
              },
              {
                path: paths.borders,
                element: <Borders />
              },
              {
                path: paths.colors,
                element: <Colors />
              },
              {
                path: paths.coloredLinks,
                element: <ColoredLinks />
              },
              {
                path: paths.display,
                element: <Display />
              },
              {
                path: paths.flex,
                element: <Flex />
              },
              {
                path: paths.float,
                element: <Float />
              },
              {
                path: paths.grid,
                element: <Grid />
              },
              {
                path: paths.scrollBar,
                element: <Scrollbar />
              },
              {
                path: paths.position,
                element: <Position />
              },
              {
                path: paths.spacing,
                element: <Spacing />
              },
              {
                path: paths.sizing,
                element: <Sizing />
              },
              {
                path: paths.stretchedLink,
                element: <StretchedLink />
              },
              {
                path: paths.textTruncation,
                element: <TextTruncation />
              },
              {
                path: paths.typography,
                element: <Typography />
              },
              {
                path: paths.verticalAlign,
                element: <VerticalAlign />
              },
              {
                path: paths.visibility,
                element: <Visibility />
              }
            ]
          },
          {
            path: rootPaths.docRoot,
            children: [
              {
                path: paths.gettingStarted,
                element: <GettingStarted />
              },
              {
                path: paths.configuration,
                element: <Configuration />
              },
              {
                path: paths.styling,
                element: <Styling />
              },
              {
                path: paths.darkMode,
                element: <DarkMode />
              },
              {
                path: paths.plugin,
                element: <Plugins />
              },
              {
                path: paths.faq,
                element: <Faq />
              },
              {
                path: paths.designFile,
                element: <DesignFile />
              }
            ]
          },
          {
            path: paths.widgets,
            element: (
              <Suspense key="widgets" fallback={<FalconLoader />}>
                <Widgets />
              </Suspense>
            )
          },
          {
            path: paths.changelog,
            element: <Changelog />
          },
          {
            path: paths.migration,
            element: <Migration />
          }
        ]
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <VerticalNavLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: paths.verticalNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <TopNavLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: paths.topNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <ComboNavLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: paths.comboNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '/',
        element: (
          <RequireAuth>
            <DoubleTopNavLayout />
          </RequireAuth>
        ),
        children: [
          {
            path: paths.doubleTopNavLayout,
            element: <Dashboard />
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to={paths.error404} replace />
      }
    ]
  }
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_PUBLIC_URL
});

export default routes;
