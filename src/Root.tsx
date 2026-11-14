import './Root.css';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { useState } from 'react';
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
import { checkIfLoggedIn } from './backend/events';
import { shouldLogoutOnArrival } from './components/utils/functions/navigationState';

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

// '/' sends signed-in users to My Events; everyone else (including anonymous
// guests) gets the create page. Decided once on arrival, so signing in midway
// through creating an event doesn't navigate away, and arriving to log out
// (LOGOUT_ON_ARRIVAL, while still signed in) shows the create page.
function LandingRoute() {
  const location = useLocation();
  const [goToMyEvents] = useState(
    () => checkIfLoggedIn() && !shouldLogoutOnArrival(location.state)
  );
  return goToMyEvents ? (
    <Navigate to="/useraccount" replace />
  ) : (
    <DaySelectComponent />
  );
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
      // My Events if signed in, otherwise the create page; /dayselect keeps old links working
      { path: '/', element: <LandingRoute /> },
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
