// Tipos e interfaces para login y usuario

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  idUser: string;
  email: string;
  username: string;
  roles: ("admin" | "editor" | "visitante")[];
}

export interface UserState extends User {
  setUserData: (data: Partial<UserState>) => void;
  clearUserData: () => void;
}
