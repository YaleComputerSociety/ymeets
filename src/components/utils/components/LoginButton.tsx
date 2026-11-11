import { useAuth } from '../../../backend/authContext';
import Button from './Button';

export default function LoginButton() {
  const { login } = useAuth();

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
