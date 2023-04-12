// where the Routing thing goes.
//import './Root.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LandingPageButtons from './landingpage/index.tsx';
import LoginPageButtons from './loginpage/index.tsx';
import DaySelectComponent from './daySelect/day_select_component/index.tsx';
import TimeSelectComponent from './schedulee/timeselectpage/App.js';

function Root() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<LoginPageButtons />} />
                <Route path='/landingpage' element={<LandingPageButtons />} />
                <Route path='/dayselect' element={<DaySelectComponent />} />
                <Route path='/timeselect' element={<TimeSelectComponent />} />
            </Routes>
        </Router>
    )
}

export default Root;