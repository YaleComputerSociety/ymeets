import { signInWithGoogle } from '../../../firebase/auth';
import { useContext } from 'react';
import { GAPIContext } from '../../../firebase/gapiContext';
import Button from './Button';

export default function LoginButton() {
  const { gapi, handleIsSignedIn } = useContext(GAPIContext);

  return (
    <Button
      bgColor="blue-500"
      textColor="white"
      onClick={() => {
        signInWithGoogle(undefined, gapi, handleIsSignedIn).then(
          (loginSuccessful) => {
            if (loginSuccessful) {
              window.location.reload();
            }
          }
        );
      }}
    >
      Login
    </Button>
  );
}
