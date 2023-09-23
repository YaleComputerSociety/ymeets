// where the Routing thing goes.
import './Root.css';
import logo from './ymeetslogo.png';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LandingPageButtons from './landingpage/index.tsx';
import LoginPageButtons from './loginpage/index.tsx';
import DaySelectComponent from './daySelect/day_select_component/index.tsx';
// import TimeSelectComponent from './schedulee/timeselectpage/TimeSelectDriver.js';
import TimeSelectComponent from './schedulee/timeselect/TimeSelectApp.js';
import EnterCodeComp from './entercodepage/index.tsx';
import AdminGroupViewComp from './schedulee/admingroupviewpage/App.js'
import GroupViewComp from './schedulee/groupviewpage/GroupViewApp.tsx'
// import ShareInviteButton from './ShareInviteButton/ShareInviteButton.js';

// TODO require auth on some pages

function Root() {
    return (
        <>
        <header>
            <div class="header-logo">
                <img src={logo} alt="YMeets"></img>
            </div>
        </header>
        <Router>
            <Routes>
                <Route path='/' element={<LoginPageButtons />} />
                <Route path='/landingpage' element={<LandingPageButtons />} />
                <Route path='/dayselect' element={<DaySelectComponent />} />
                <Route path='/eventcode' element={<EnterCodeComp />} />
                <Route path='/timeselect/:code' element={<TimeSelectComponent />} />
                <Route path='/adminview' element={<AdminGroupViewComp />} />
                <Route path='/groupview' element={<GroupViewComp />} />
                {/* <Route path='/shareinvitebutton' element={<ShareInviteButton ending="obama"/>} /> */}
            </Routes>
        </Router>
        </>
    )
}

export default Root;