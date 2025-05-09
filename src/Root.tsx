import './Root.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import DaySelectComponent from './components/DaySelect/day_select_component';
import TimeSelectPage from './components/TimeSelect/TimeSelectPage';
import NavBar from './components/navbar/NavBar';
import AccountsPage from './components/Accounts/AccountsPage';
import ConditionalGroupViewRenderer from './components/GroupView/ConditionalGroupViewRenderer';
import AboutUsPage from './components/AboutUs/AboutUsPage';
import NotFound from './components/NotFound/NotFound';
import PrivacyPage from './components/Privacy/PrivacyPage';
import { GAPIContextWrapper } from './firebase/gapiContext';
import Banner from './components/utils/components/Banner';
import { ThemeProvider } from './contexts/ThemeContext';
import UnifiedAvailabilityPage from './components/UnifiedAvailabilityPage/UnifiedAvailabilityPage';
import { useState } from 'react';

function Root() {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <ThemeProvider>
      <div className="bg-background dark:bg-background-dark h-screen overflow-auto">
        <Banner title="2.0 Release is Live" text="Please report bugs" />
        <GAPIContextWrapper>
          <Router>
            <NavBar></NavBar>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dayselect" element={<DaySelectComponent />} />
              <Route path="/dashboard/:code" element={<UnifiedAvailabilityPage />} />
              <Route path="/useraccount" element={<AccountsPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </GAPIContextWrapper>
      </div>
    </ThemeProvider>
  );
}

export default Root;
