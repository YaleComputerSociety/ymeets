// where the Routing thing goes.
import React from "react";
import './Root.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import LoginPageButtons from './components/loginpage';
import DaySelectComponent from './components/daySelect/day_select_component';
import TimeSelectApp from './components/createSchedule/TimeSelectApp';
import EnterCodeComp from './components/entercodepage';
import NavBar from "./components/navbar/NavBar"
import Footer from "./components/footer/Footer"
import Accounts from './components/accounts/Accounts';
import GroupViewApp from './components/viewSchedule/GroupViewApp';
import AboutUs from "./components/aboutUs/aboutUs";
import NotFound from "./components/NotFound/NotFound";

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
                <Route path='/groupview/:code' element={<GroupViewApp />} />
                <Route path="/useraccount" element={<Accounts />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </Router>
        </>
    )
}

export default Root;