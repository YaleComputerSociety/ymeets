// where the Routing thing goes.
//import './Root.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LandingPageButtons from './landingpage/index.tsx';
import LoginPageButtons from './loginpage/index.tsx';
import DaySelectComponent from './daySelect/day_select_component/index.tsx';
import TimeSelectComponent from './schedulee/timeselectpage/TimeSelectDriver.js';
import EnterCodeComp from './entercodepage/index.tsx';
import GroupViewComp from './schedulee/groupviewpage/App.js'

function Root() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LoginPageButtons />} />
                <Route path='/landingpage' element={<LandingPageButtons />} />
                <Route path='/dayselect' element={<DaySelectComponent />} />
                <Route path='/eventcode' element={<EnterCodeComp />} />
                <Route path='/timeselect' element={<TimeSelectComponent />} />
                <Route path='/groupview' element={<GroupViewComp />} />

            </Routes>
        </Router>
    )
}

export default Root;