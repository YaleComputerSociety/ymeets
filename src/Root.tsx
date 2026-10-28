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
import TimeSelectPage from './components/TimeSelect/TimeSelectPage';
import NavBar from './components/navbar/NavBar';
import AccountsPage from './components/Accounts/AccountsPage';
import ConditionalGroupViewRenderer from './components/GroupView/ConditionalGroupViewRenderer';
import AboutUsPage from './components/AboutUs/AboutUsPage';
import NotFound from './components/NotFound/NotFound';
import PrivacyPage from './components/Privacy/PrivacyPage';
import Banner from './components/utils/components/Banner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './backend/authContext';
import UnifiedAvailabilityPage from './components/UnifiedAvailabilityPage/UnifiedAvailabilityPage';
import GoogleOneTapPrompt from './components/utils/components/GoogleOneTap/GoogleOneTapPrompt';
import { useState } from 'react';

// legacy support for /groupview/:code
function GroupViewRedirect() {
  const { code } = useParams();
  return <Navigate to={`/dashboard/${code}`} replace />;
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
      { path: '/', element: <HomePage /> },
      { path: '/dayselect', element: <DaySelectComponent /> },
      { path: '/edit/:eventId', element: <DaySelectComponent /> },
      { path: '/dashboard/:code', element: <UnifiedAvailabilityPage /> },
      { path: '/groupview/:code', element: <GroupViewRedirect /> },
      { path: '/useraccount', element: <AccountsPage /> },
      { path: '/about-us', element: <AboutUsPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function Root() {
  const [isEditing, setIsEditing] = useState(false);
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
