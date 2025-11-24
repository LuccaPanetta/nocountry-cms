// Componente de login principal. Utiliza React Query, React Hook Form, Zod y Zustand.
"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/schemas/login";

// Renderiza el formulario de login y maneja el flujo de autenticación
export default function LoginForm() {
  // Hook para actualizar el usuario en el store global
  const setUserData = useUserStore((state) => state.setUserData);
  // Hook de Next.js para redireccionar
  const router = useRouter();
  // Configuración de React Hook Form con Zod para validación
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Mutación de React Query para manejar el login y sus estados
  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      return await login(data.email, data.password);
    },
    onSuccess: ({ user, access_token }) => {
      // Guarda el usuario en el store y redirecciona según el rol
      setUserData({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        token: access_token,
      });
      if (user.rol === "admin") router.push("/dashboard/admin");
      else if (user.rol === "operator") router.push("/dashboard/operator");
      else router.push("/dashboard/contributor");
    },
    onError: (err: any) => {
      // Puedes personalizar el mensaje de error
    },
  });

  // Handler para enviar el formulario y disparar la mutación
  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  // Render del formulario con feedback de errores y loading
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto space-y-4 p-6 rounded-lg shadow bg-white"
    >
      <h2 className="text-xl font-semibold mb-2 text-center">Iniciar sesión</h2>
      <div>
        {/* Campo de email con validación */}
        <Input
          type="email"
          placeholder="Correo electrónico"
          autoFocus
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        {/* Campo de contraseña con validación */}
        <Input
          type="password"
          placeholder="Contraseña"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>
      {/* Mensaje de error si la mutación falla */}
      {mutation.isError && (
        <div className="text-red-500 text-sm text-center">
          {typeof mutation.error === "string"
            ? mutation.error
            : "Credenciales inválidas"}
        </div>
      )}
      {/* Botón de envío con loading */}
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
