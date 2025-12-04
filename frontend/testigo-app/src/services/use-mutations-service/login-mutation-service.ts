import { useMutation } from "@tanstack/react-query";
import { postLogin } from "../use-cases/login-service";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { LoginType } from "@/types/login-type";

export const LoginMutationsService = () => {
  const router = useRouter();
  const setUserData = useUserStore((state) => state.setUserData);

  const mutationPostLogin = useMutation({
    mutationFn: (data: LoginType) => {
      return postLogin(data);
    },
    onSuccess: function Exito(_res) {
      setUserData({
        id: _res.user.id,
        nombre: _res.user.nombre,
        apellido: _res.user.apellido,
        email: _res.user.email,
        rol: _res.user.rol,
        token: _res.access_token,
      });
      if (_res.user.rol === "admin") router.push("/dashboard/admin");
      else if (_res.user.rol === "editor") router.push("/dashboard/editor");
      else router.push("/testimonials/create");
    },
  });

  return {
    mutationPostLogin,
  };
};
