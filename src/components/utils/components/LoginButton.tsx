import { useAuth } from '../../../firebase/authContext';
import Button from './Button';

export default function LoginButton() {
  const { login, currentUser } = useAuth();

  return (
    <Button
      bgColor="primary"
      textColor="white"
      onClick={async () => {
        await login();
      }}
    >
      Login
    </Button>
  );
}
