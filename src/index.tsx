import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root';
import { Favi } from './components/navbar/CalendarIcon';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './backend/firebase';

const functions = getFunctions(app);
if (window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// test

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <>
    <Favi></Favi>

    <Root />
  </>
);
