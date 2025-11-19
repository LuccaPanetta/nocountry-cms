import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(), // UUID del usuario
  name: z.string(), // Nombre del usuario
  email: z.email(), // Email válido
  role: z.enum(["admin", "user"]), // Rol fijo: admin o user
  token: z.string(), // JWT recibido del backend
});

// Tipo inferido para usar en el store y servicios
export type User = z.infer<typeof userSchema>;
