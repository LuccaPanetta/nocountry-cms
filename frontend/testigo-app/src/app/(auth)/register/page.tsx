import LayoutAuth from "@/components/login-register/LayoutAuth";
import RegisterForm from "@/components/login-register/RegisterForm";


export default function LoginPage() {
  return (
    <LayoutAuth title="Creá tu cuenta" subtitle="Ingresá tus datos para comenzar">
      <RegisterForm />
    </LayoutAuth>
  );
}
