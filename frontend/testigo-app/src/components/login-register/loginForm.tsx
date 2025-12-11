"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "@/schemas/login-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { LoginMutationsService } from "@/services/use-mutations-service/login-mutation-service";
import { Eye, EyeClosed } from "lucide-react";



export default function LoginForm() {

  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  const { mutationPostLogin } = LoginMutationsService();

  // Handler para enviar el formulario y disparar la mutación
  const onSubmit = (data: LoginFormValues) => {
    mutationPostLogin.mutate(data);
  };

  const [inputsViewpassword, setinputsViewpass] = useState(true)


  return (
    <Form {...form} >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-4 w-full mx-auto">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="lg:col-start-1 lg:row-start-1 self-start">
              <FormLabel htmlFor="email">Correo electronico</FormLabel>
              <FormControl >
                <Input className="pl-5 bg-[#F2F4F7] placeholder:text-sm" type="email" placeholder="nombre@gmail.com" id="email"   {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative lg:col-start-2 lg:row-start-1 self-start">
                <FormLabel htmlFor="password">Contraseña</FormLabel>
                {
                  inputsViewpassword ?
                    <Eye onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-7 right-2 w-4" />
                    :
                    <EyeClosed onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-7 right-2 w-4" />
                }
                <FormControl>
                  <Input className="pl-5 bg-[#F2F4F7] placeholder:text-sm" type={`${inputsViewpassword ? "password" : "text"}`} placeholder="Ingresa tu contraseña" id="password"  {...field} />
                </FormControl>
                <FormMessage className="text-xs mb-1" />
              </FormItem>
            )}
          />
          <Link href={'/login/req-pass-reset'}><p className="text-xs text-right mt-2">¿Olvidaste tu contraseña?</p></Link>
        </div>
        {mutationPostLogin.isError && (
          <p className="text-destructive text-sm">
            {(mutationPostLogin.error as Error).message}
          </p>
        )}
        <div className="lg:col-span-2 mx-auto w-1/2">
        <Button type="submit" className="cursor-pointer mt-3 w-full mx-auto">Iniciar sesión</Button>
        </div>
      </form>
      <p className="text-center mt-4 text-sm">¿Aún no tenés cuenta?
        <Link href="/register" className="text-secondary ml-1 font-semibold">
        Registrate
      </Link></p>
    </Form>
  );
}


