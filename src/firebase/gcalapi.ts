
// import { SCOPES } from './firebase';

// // Credit to CourseTable Team, specifically Ben Xu <3
// import { loadGapiInsideDOM, loadAuth2 } from 'gapi-script';

// const GAPI_CLIENT_NAME = 'client:auth2';

// async function loadGapi() {
//     const newGapi = await loadGapiInsideDOM();
//     loadGapiClient(newGapi);
//     const newAuth2 = await loadAuth2(
//         newGapi,
//         process.env.REACT_APP_CLIENT_ID_GAPI || "",
//         SCOPES,
//     );
//     setGapi(newGapi);
//     setAuthInstance(newAuth2);
//     setLoading(false);
// }

// const loadGapiClient = (gapiInstance: typeof globalThis.gapi) => {
//     gapiInstance.load(GAPI_CLIENT_NAME, () => {
//     try {
//         gapiInstance.client.load('calendar', 'v3');

//     } catch {
//     gapiInstance.client.init({
//         apiKey: process.env.REACT_APP_API_KEY_GAPI,
//         clientId: process.env.REACT_APP_CLIENT_ID_GAPI,
//         scope: SCOPES,
//     });
//     gapiInstance.client.load('calendar', 'v3');

//     }
//     });
// };

export {}