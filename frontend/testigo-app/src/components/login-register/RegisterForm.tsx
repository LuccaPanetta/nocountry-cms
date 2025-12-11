"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { Eye, EyeClosed } from "lucide-react";
import { registerformSchema, RegisterFormValues } from "@/schemas/register-schema";
import { RegisterMutationsService } from "@/services/use-mutations-service/register-mutation-service";
import { RegisterType } from "@/types/register-type";
import Link from "next/link";
import { useRouter } from "next/navigation";

type onSuccessProps = {
  onSuccess?: () => void
}


export default function RegisterForm({ onSuccess }: onSuccessProps) {

  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerformSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmpassword: ""
    },
  });

  const { mutationPostRegister } = RegisterMutationsService();

  // Handler para enviar el formulario y disparar la mutación
  const onSubmit = (data: RegisterFormValues) => {
    const dataPost: RegisterType = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password: data.password
    }
    console.log({dataPost});
    
    mutationPostRegister.mutate(dataPost, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/register/success")
        }
      }, });


  };

  const [inputsViewpassword, setinputsViewpass] = useState(true)
  const [inputsViewconfpassword, setinputsViewconfpass] = useState(true)


  return (
    <Form {...form} >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-4 w-full mx-auto">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="lg:col-start-1 lg:row-start-1 self-start">
              <FormLabel htmlFor="nombre">Nombre</FormLabel>
              <FormControl>
                <Input type="text" className="pl-5 bg-[#F2F4F7] placeholder:text-sm" placeholder="Ingresa tu nombre" id="nombre"  {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apellido"
          render={({ field }) => (
            <FormItem className="lg:col-start-1 lg:row-start-2 self-start">
              <FormLabel htmlFor="apellido">Apellido</FormLabel>
              <FormControl>
                <Input type="text" className="pl-5 bg-[#F2F4F7] placeholder:text-sm" placeholder="Ingresa tu apellido" id="apellido"  {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="lg:col-start-1 lg:row-start-3 self-start">
              <FormLabel htmlFor="email">Correo electronico</FormLabel>
              <FormControl>
                <Input className="pl-5 bg-[#F2F4F7] placeholder:text-sm" type="email" placeholder="nombre@gmail.com" id="email"   {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative lg:col-start-2 lg:row-start-1 self-start">
              <FormLabel htmlFor="password">Contraseña*</FormLabel>
              {
                inputsViewpassword ?
                  <Eye onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-7 right-2 w-4" />
                  :
                  <EyeClosed onClick={() => setinputsViewpass(!inputsViewpassword)} className="absolute top-7 right-2 w-4" />
              }
              <FormControl>
                <Input className="pl-5 bg-[#F2F4F7] placeholder:text-sm" type={`${inputsViewpassword ? "password" : "text"}`} placeholder="Ingresa tu contraseña" id="password"  {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmpassword"
          render={({ field }) => (
            <FormItem className="relative lg:col-start-2 lg:row-start-2 self-start">
              <FormLabel htmlFor="password">Confirmar contraseña</FormLabel>
              {
                inputsViewconfpassword ?
                  <Eye onClick={() => setinputsViewconfpass(!inputsViewconfpassword)} className="absolute top-7 right-2 w-4" />
                  :
                  <EyeClosed onClick={() => setinputsViewconfpass(!inputsViewconfpassword)} className="absolute top-7 right-2 w-4" />
              }
              <FormControl>
                <Input className="pl-5 bg-[#F2F4F7] placeholder:text-sm" type={`${inputsViewconfpassword ? "password" : "text"}`}
                  placeholder="Confirma tu contraseña" id="confirmpassword"  {...field} />
              </FormControl>
              <FormMessage className="text-xs" ></FormMessage>
            </FormItem>
          )}
        />
        <span className="text-foreground text-[10px] ">*Debe incluir entre 6 y 8 caracteres, y al menos: 1 mayúscula y 1 número</span>
        {mutationPostRegister.isError && (
          <p className="text-destructive text-sm">
            {(mutationPostRegister.error as Error).message}
          </p>
        )}
        <div className="lg:col-span-2 mx-auto w-1/2">
        <Button type="submit" className="cursor-pointer mt-4 w-full mx-auto">Registrar</Button>
        </div>
      </form>
      <p className="text-center mt-4 text-sm">¿Ya tenés cuenta?
        <Link href="/login" className="text-secondary ml-1 font-semibold">
        Iniciar sesión
        </Link></p>
    </Form>);
}


