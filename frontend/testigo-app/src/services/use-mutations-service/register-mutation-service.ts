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
       router.push("/register/success");
    },
  });

  return {
    mutationPostRegister,
  };
};
