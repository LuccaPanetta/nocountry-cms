"use client";

import { useUserStore } from "@/store/userStore";
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
import TitleSection from "../ui/TitleSection";



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
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="">
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
                <FormItem className="relative">
                  <FormLabel htmlFor="password">Contraseña</FormLabel>
                  {
                    inputsViewpassword ?
                      <Eye onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-[31px] right-2" />
                      :
                      <EyeClosed onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-[31px] right-2" />
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
          <Button type="submit" className="cursor-pointer w-1/2 mx-auto">Iniciar sesión</Button>
        </form>
        <p className="text-center mt-4 text-sm">¿Aún no tenés cuenta? <span onClick={() => router.push("/register")} className="text-secondary">Registrate</span></p>
    </Form>
  );
}


