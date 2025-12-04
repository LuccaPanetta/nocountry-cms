import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { RegisterType } from "@/types/register-type";
import { postRegister } from "../use-cases/register-service";


export const RegisterMutationsService = () => {
  const router = useRouter();
  const setUserData = useUserStore((state) => state.setUserData);

  const mutationPostRegister = useMutation({
    mutationFn: (data: RegisterType) => {
      return postRegister(data);
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
    mutationPostRegister,
  };
};
