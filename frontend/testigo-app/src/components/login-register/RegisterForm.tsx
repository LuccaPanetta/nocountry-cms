"use client";

import { useRouter } from "next/navigation";
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




export default function RegisterForm() {

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
    mutationPostRegister.mutate(dataPost);
  };

  const [inputsViewpassword, setinputsViewpass] = useState(true)
  const [inputsViewconfpassword, setinputsViewconfpass] = useState(true)


  return (
    <Form {...form} >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
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
            <FormItem>
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
            <FormItem className="relative">
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
            <FormItem className="relative">
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
              <FormMessage className="text-xs" ><span className="text-foreground text-[10px]">*Debe incluir entre 6 y 8 caracteres, y al menos: 1 mayúscula,
                1 número y 1 caracter especial</span></FormMessage>
            </FormItem>
          )}
        />
        {mutationPostRegister.isError && (
          <p className="text-destructive text-sm">
            {(mutationPostRegister.error as Error).message}
          </p>
        )}
        <Button type="submit" className="cursor-pointer mt-4 w-1/2 mx-auto">Registrar</Button>
      </form>
      <p className="text-center mt-4 text-sm">¿Ya tenés cuenta?
        <Link href="/login" className="text-secondary ml-1">
        Iniciar sesión
        </Link></p>
    </Form>);
}


