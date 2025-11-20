"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/user";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function loginService(data: LoginInput) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Error de autenticación");
  return result;
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const setUser = useUserStore((s) => s.setUser);
  const [backendError, setBackendError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      setUser({
        idUser: data.id,
        email: data.email,
        username: data.username,
        hasHydrated: true,
        accessToken: data.access_token,
      });
      // Redirigir según verificación
      if (data.verified === false) {
        window.location.href = "/verificacion";
      } else {
        window.location.href = "/";
      }
    },
    onError: (error: any) => {
      setBackendError(error.message);
    },
  });

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Form
      {...{
        ...form,
        register,
        handleSubmit,
        formState: { errors },
      }}
    >
      <form
        className="max-w-sm mx-auto p-4 flex flex-col gap-4"
        onSubmit={handleSubmit((data) => {
          setBackendError(null);
          mutation.mutate(data);
        })}
      >
        <FormField
          name="email"
          render={() => (
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="border rounded w-full p-2"
                />
              </FormControl>
              <FormMessage>
                {errors.email && (
                  <span className="text-red-500 text-sm">
                    {errors.email.message}
                  </span>
                )}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="password"
          render={() => (
            <FormItem>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="border rounded w-full p-2"
                />
              </FormControl>
              <FormMessage>
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </FormMessage>
            </FormItem>
          )}
        />
        {backendError && (
          <div className="text-red-600 text-sm">{backendError}</div>
        )}
        <Button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
          disabled={mutation.status === "pending"}
        >
          {mutation.status === "pending" ? "Ingresando..." : "Ingresar"}
        </Button>
        <a href="/recuperar" className="text-blue-500 text-sm underline">
          ¿Olvidaste tu contraseña?
        </a>
      </form>
    </Form>
  );
}
