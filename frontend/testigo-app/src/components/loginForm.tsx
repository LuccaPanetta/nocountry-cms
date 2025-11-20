"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/user";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

// Helper function to decode JWT token (basic implementation)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export default function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [backendError, setBackendError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      // Decode JWT to extract user information
      const decodedToken = decodeJWT(data.access_token);
      
      if (decodedToken) {
        // Store the access token and user info from JWT
        setUser({
          idUser: decodedToken.sub ? parseInt(decodedToken.sub) : null,
          email: decodedToken.email || null,
          hasHydrated: true,
          accessToken: data.access_token,
        });
      } else {
        // Fallback: store only access token if decode fails
        setUser({
          hasHydrated: true,
          accessToken: data.access_token,
        });
      }
      
      // Use Next.js router for navigation
      router.push("/");
    },
    onError: (error: any) => {
      setBackendError(error.message);
    },
  });

  return (
    <Form {...form}>
      <form
        className="max-w-sm mx-auto p-4 flex flex-col gap-4"
        onSubmit={form.handleSubmit((data) => {
          setBackendError(null);
          mutation.mutate(data);
        })}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
