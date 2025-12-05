// Esquema de validación y tipado para el usuario autenticado
import { z } from "zod";

export const userSchema = z
.object({
  id: z.string().uuid(), 
  nombre: z.string(), // Nombre del usuario
  apellido: z.string(), // Apellido del usuario
  email: z.email(), // Email válido
  rol: z.enum(["admin", "editor", "contributor"]), // Roles reales del backend
  token: z.string(), // JWT recibido del backend
})
 .strip();

// Tipo inferido para usar en el store y servicios
export type User = z.infer<typeof userSchema>;
