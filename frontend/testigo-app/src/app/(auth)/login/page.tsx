import LayoutAuth from "@/components/login-register/LayoutAuth";
import LoginForm from "@/components/login-register/loginForm";

export default function LoginPage() {
  return (
    <LayoutAuth title="Iniciá sesión" subtitle="Ingresá tus credenciales para acceder">
      <LoginForm />
    </LayoutAuth>
  );
}
