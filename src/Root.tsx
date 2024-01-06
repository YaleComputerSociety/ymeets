// where the Routing thing goes.
import './Root.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import LoginPageButtons from './components/loginpage';
import DaySelectComponent from './components/daySelect/day_select_component';
import TimeSelectApp from './components/schedulee/TimeSelectApp';
import EnterCodeComp from './components/entercodepage';
import GroupViewComp from './components/schedulee/GroupViewApp'
import NavBar from "./components/navbar/NavBar"
import Footer from "./components/footer/Footer"
import Accounts from './components/accounts/Accounts';
import AdminGroupViewApp from './components/scheduler/AdminGroupViewApp';

function Root() {

    return (
        <>
        <Router>

        <header>
            <NavBar></NavBar>
        </header>

            <Routes>
                <Route path='/' element={<LoginPageButtons />} />
                <Route path='/dayselect' element={<DaySelectComponent />} />
                <Route path='/eventcode' element={<EnterCodeComp />} />
                <Route path='/timeselect/:code' element={<TimeSelectApp />} />
                <Route path='/adminview' element={<AdminGroupViewApp />} />
                <Route path="/useraccount" element={<Accounts />} />
                <Route path='/groupview/:code' element={<GroupViewComp />} />
            </Routes>
        </Router>
        <Footer/>
        </>
    )
}

export default Root;