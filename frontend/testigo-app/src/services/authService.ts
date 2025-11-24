// Servicio de autenticación: login, logout y validación de token
export async function login(email: string, password: string) {
  const API_URL = "https://nocountry-cms.onrender.com/api/v1/auth/login";
  try {
    // Realiza la petición POST al backend para autenticar el usuario
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      // Si la respuesta no es exitosa, lanza el mensaje de error
      const errorData = await res.json().catch(() => ({}));
      throw errorData.message || "Credenciales inválidas";
    }
    // Devuelve los datos del usuario y el token
    const data = await res.json();
    // data: { user, access_token }
    return data;
  } catch (err) {
    throw typeof err === "string" ? err : "Error de conexión";
  }
}

// Puedes implementar logout y validación de token si lo necesitas
export async function logout() {
  // Lógica para cerrar sesión y limpiar datos
}

export async function validateToken(token: string) {
  // Lógica para validar el token (opcional: con backend o local)
}
