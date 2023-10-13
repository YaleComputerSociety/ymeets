// where the Routing thing goes.
import './Root.css';
import logo from './static/ymeetslogo.png';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LandingPageButtons from './components/landingpage';
import LoginPageButtons from './components/loginpage';
import DaySelectComponent from './components/daySelect/day_select_component';
import TimeSelectApp from './components/schedulee/timeselect/TimeSelectApp.tsx';
import EnterCodeComp from './components/entercodepage';
// import AdminGroupViewComp from './components/schedulee/admingroupviewpage/App.js'
import GroupViewComp from './components/schedulee/groupviewpage/GroupViewApp'

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
                <Route path='/timeselect/:code' element={<TimeSelectApp />} />
                {/* <Route path='/adminview' element={<AdminGroupViewComp />} /> */}
                <Route path='/groupview' element={<GroupViewComp />} />
            </Routes>
        </Router>
        </>
    )
}

export default Root;

// TODO : Reintegrate the select component into the necessary pages, and also code review it
// convert selectCalander to use contexts 
// 
// 