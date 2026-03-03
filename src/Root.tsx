import './Root.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
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
import { useState } from 'react';

// legacy support for /groupview/:code
function GroupViewRedirect() {
  const { code } = useParams();
  return <Navigate to={`/dashboard/${code}`} replace />;
}

function Root() {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="bg-background dark:bg-background-dark h-screen overflow-auto">
          {/* <Banner title="2.0 Release is Live" text="Please report bugs" /> */}
          <Router>
            <NavBar></NavBar>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dayselect" element={<DaySelectComponent />} />
              <Route path="/edit/:eventId" element={<DaySelectComponent />} />
              <Route
                path="/dashboard/:code"
                element={<UnifiedAvailabilityPage />}
              />
              <Route path="/groupview/:code" element={<GroupViewRedirect />} />
              <Route path="/useraccount" element={<AccountsPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Root;
