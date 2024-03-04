import * as React from "react";
import { Link } from 'react-router-dom';
import ApiCalendar from 'react-google-calendar-api';
import { apiCalendar } from "../../firebase/calendar";
import { useState } from "react";
import { gapi } from 'gapi-script';
import { confirmPasswordReset } from "firebase/auth";

// declare var gapi: any;

 // Initialize the Google API client with desired scopes

declare var start: any;
// declare var gapi: any;


export const LandingPageButtons = () => {
    const [ loading, setLoading ] = useState(false);
    // apiCalendar.onLoad(() => {
    //     // setLoaded(true);
    // });
    // React.useEffect(() => {
    //     const script = document.createElement('script');
    //     script.src =  "https://apis.google.com/js/api.js"
    //     document.body.appendChild(script);

    //     script.onload = () => {
    //         console.log(window.gapi.load('client:auth2', () => {
    //             console.log("Then...")
    //             window.gapi.load('client:auth2', () => {
    //                 console.log("init now");
    //             })
    //         console.log("Script loaded!");
    //         }))
    //     }
    // }, []);
        // : undefined;
    // const initClient = () => {
    //     gapi.load('client', () => {
    //       console.log('loaded client')
    
    //       // It's OK to expose these credentials, they are client safe.
    //       gapi.client.init({
    //         apiKey: 'AIzaSyB922dDAqfzMmBDQezEm9bWAEqSFyidxmI',
    //         clientId: '1017679091024-mf9320n5435ab3io3hfsajie3lcb54d8.apps.googleusercontent.com',
    //         discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    //         scope: 'https://www.googleapis.com/auth/calendar'
    //       })
    
    //       gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));
    //     });
    //   }
    const testCalendarApi = () => {
        console.log("Clicked");
        apiCalendar.createEventFromNow({ time: 50, summary: 'summary', description: 'description' });
        // console.log(apiCalendar.listUpcomingEvents(5));
        return

        // if (!apiCalendar.sign){
        //     apiCalendar.handleAuthClick();
        // }

        const event = {
            'summary': 'Google I/O 2015',
            'location': '800 Howard St., San Francisco, CA 94103',
            'description': 'A chance to hear more about Google\'s developer products.',
            'start': {
            'dateTime': '2015-05-28T09:00:00-07:00',
            'timeZone': 'America/Los_Angeles'
            },
            'end': {
            'dateTime': '2015-05-28T17:00:00-07:00',
            'timeZone': 'America/Los_Angeles'
            },
            'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
            ],
            'attendees': [
            {'email': 'lpage@example.com'},
            {'email': 'sbrin@example.com'}
            ],
            'reminders': {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10}
            ]
            }
        };
        const result = apiCalendar.createEvent(event);//.then((event: any)=>{console.log(event)}).catch((error: any)=>{console.log(error)})
        // console.log(result);
        // @ts-ignore
        //add script tag
        // gapi.client.init(() => {

        // })

        // const request = gapi.client.calendar.events.insert({
        //     'calendarId': 'primary',
        //     'resource': event
        // });
        
        // request.execute(function(event: any) {
        //     console.log('Event created: ' + event.htmlLink);
        // });
        
            }


            // async function init() {
            //     // 2. Initialize the JavaScript client library.
            //     await window.gapi.client.init({
            //       discoveryDocs: ['https://discovery.googleapis.com/$discovery/rest']
            //     });
            //     start();
            //   }
            //   window.gapi.load('client', init);

    // const gapiLoaded = () => {
    //     console.log("Gapi loaded from script tag");
    //     console.log("token", gapi.auth.getToken());
    // }

    return (
        <div className='bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 h-screen w-screen flex justify-center'>
           {/* <script async defer src="https://apis.google.com/js/api.js" onLoad={gapiLoaded}></script> */}
            <div className='w-4/5 sm:w-4/6 md:w-1/2 mx-auto'>
                <div className='text-center h-30 mb-16 mt-40'>
                    <Link to='/dayselect'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                </div>
                <div className='text-center h-30'>
                    <Link to='/eventcode'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {console.log("Hilogin")}}>Use Event Code</button>
                    </Link>
                </div>
                {/* <div className='text-center h-30 mt-5 '>
                        <button disabled={loading} onClick={testCalendarApi} className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg'>
                            Test Calendar API 
                            </button>
                </div> */}
            </div>
        </div>
    );
}