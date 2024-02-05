export function Privacy() {
    
    return (
        <div className="bg-sky-100 ml-20 mr-20">

            <h1 className="text-xl">ymeets is an app designed to make group scheudling more convenient, tailored to the Yale community.
            To accomplish this goal, we collect some data from your Google Account and Calendar if you chose to log in with Google.
            
            </h1>

            <br></br>

            <h1 className="text-3xl font-bold underline ">Privacy Policy: What does this app do with your data?</h1>

            <p className="text-xl">This application makes requests to your Google Calendar to pull in information about your events
            to learn times you may be unavailable. This information is unaccessible to the developers and is not stored
            in any way. The only information we store associated with an account are active scheduling events, including all the event details; each time
            you exit a scheduling event, we do not persist the GCal data we pulled. It is repulled once you revist that scheduling event.

            <br></br>
            <br></br>

            Cookies are used for login purposes. No information is given to other parties, except this site does include google analytics which records anonymized browsing behaviour. 
            
            <br></br>
            <br></br>

            If you are not the person creating the event, you do not need to log in with Google at all!

            <br></br>
            <br></br>

            <strong>By continuing to use this site, you accept this privacy policy in full. If you disagree with this policy, you must not use this site.</strong>
            </p>

        </div>
    )
}