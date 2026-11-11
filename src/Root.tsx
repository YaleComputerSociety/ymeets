import './Root.css';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useParams,
} from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import DaySelectComponent from './components/DaySelect/day_select_component';
import NavBar from './components/navbar/NavBar';
import AccountsPage from './components/Accounts/AccountsPage';
import AboutUsPage from './components/AboutUs/AboutUsPage';
import NotFound from './components/NotFound/NotFound';
import PrivacyPage from './components/Privacy/PrivacyPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './backend/authContext';
import UnifiedAvailabilityPage from './components/UnifiedAvailabilityPage/UnifiedAvailabilityPage';
import GoogleOneTapPrompt from './components/utils/components/GoogleOneTap/GoogleOneTapPrompt';

// legacy support for /groupview/:code
function GroupViewRedirect() {
  const { code } = useParams();
  return <Navigate to={`/dashboard/${code}`} replace />;
}

// Remount the dashboard per event so state (including unsaved changes)
// never carries over when navigating between two events' dashboards
function DashboardRoute() {
  const { code } = useParams();
  return <UnifiedAvailabilityPage key={code} />;
}

// Shared layout so NavBar and One Tap stay inside the router context
function Layout() {
  return (
    <>
      <GoogleOneTapPrompt />
      <NavBar></NavBar>
      <Outlet />
    </>
  );
}

// Data router (instead of <BrowserRouter>) so pages can use useBlocker
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // The create page is the landing page; /dayselect keeps old links working
      { path: '/', element: <DaySelectComponent /> },
      { path: '/home', element: <HomePage /> },
      { path: '/dayselect', element: <DaySelectComponent /> },
      { path: '/edit/:eventId', element: <DaySelectComponent /> },
      { path: '/dashboard/:code', element: <DashboardRoute /> },
      { path: '/groupview/:code', element: <GroupViewRedirect /> },
      { path: '/useraccount', element: <AccountsPage /> },
      { path: '/about-us', element: <AboutUsPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function Root() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="bg-background dark:bg-background-dark h-screen overflow-auto">
          {/* <Banner title="2.0 Release is Live" text="Please report bugs" /> */}
          <RouterProvider router={router} />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Root;
