import {
  GetTestimonialsParams,
  TestimonyStatusType,
} from "@/types/testimony-type";
import {
  apiPublicEmbedsService,
  apiPublicTestimonialsService,
  apiTestimonialsService,
} from "../general-api";
import { useUserStore } from "@/store/userStore";

export const postTestimonials = async (data: FormData) => {
  const { token } = useUserStore.getState();

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }
  try {
    const res = await apiTestimonialsService.post("/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const getTestimonials = async () => {
  const { token } = useUserStore.getState();

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  try {
    const res = await apiTestimonialsService.get("/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const getTestimonyById = async (id: string) => {
  const { token } = useUserStore.getState();

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }

  try {
    const res = await apiTestimonialsService.get(`/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const updateTestimonyById = async (id: string, data: FormData) => {
  const { token } = useUserStore.getState();

  if (!token) {
    throw new Error("No hay token de autenticación.");
  }
  try {
    const res = await apiTestimonialsService.patch(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const updateStatusOfTestimonyById = async (
  id: string,
  data: TestimonyStatusType
) => {
  try {
    const res = await apiTestimonialsService.patch(`/${id}/status`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const deleteTestimonyById = async (id: string) => {
  try {
    const res = await apiTestimonialsService.delete(`/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

//Public Testimonials 

export const getPublicTestimonials = async (params: GetTestimonialsParams) => {
  try {
    const res = await apiPublicTestimonialsService.get("/", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        category: params.category,
        order: params.order,
      },
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};


export const getPublicTestimonyById = async (id : string) => {
  try {
    const res = await apiPublicTestimonialsService.get(`/${id}`);

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const getPublicTestimonyEmbedCode = async (id : string) => {
  try {
    const res = await apiPublicEmbedsService.get(`/${id}/code`);

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

