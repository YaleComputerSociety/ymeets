import './Root.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import DaySelectComponent from './components/DaySelect/day_select_component';
import TimeSelectPage from './components/TimeSelect/TimeSelectPage';
import NavBar from './components/navbar/NavBar';
import AccountsPage from './components/Accounts/AccountsPage';
import GroupViewApp from './components/GroupView/GroupViewPage';
import AboutUsPage from './components/AboutUs/AboutUsPage';
import NotFound from './components/NotFound/NotFound';
import PrivacyPage from './components/Privacy/PrivacyPage';
import { GAPIContextWrapper } from './firebase/gapiContext';
import Banner from './components/utils/components/Banner';

function Root() {
  return (
    <>
      <Banner title="1.0 Release is Live" text="Please report bugs" />
      <GAPIContextWrapper>
        <Router>
          <NavBar></NavBar>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dayselect" element={<DaySelectComponent />} />
            <Route path="/timeselect/:code" element={<TimeSelectPage />} />
            <Route path="/groupview/:code" element={<GroupViewApp />} />
            <Route path="/useraccount" element={<AccountsPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </Router>
      </GAPIContextWrapper>
    </>
  );
}

export default Root;
