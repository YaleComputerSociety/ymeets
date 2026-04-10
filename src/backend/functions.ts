import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

if (window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { functions };