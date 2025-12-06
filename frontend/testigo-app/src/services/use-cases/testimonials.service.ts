import { GetTestimonialsParams, TestimonyReqType, TestimonyStatusType } from "@/types/testimony-type";
import {apiPublicTestimonialsService, apiTestimonialsService } from "../general-api";

export const postTestimonials = async (data: TestimonyReqType) => {
  try {
    const res = await apiTestimonialsService.post("/", data);
    return res.data;
  } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error de conexión");
  }
};


export const getTestimonials = async () => {
  try {
    const res = await apiTestimonialsService.get("/");
    return res.data;
  } catch (error: any) {  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};


export const getTestimonyById = async (id: string) => {
  try {
    const res = await apiTestimonialsService.get(`/${id}`);
    return res.data;
  } catch (error: any) {  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const updateTestimonyById = async (id: string, data: TestimonyReqType) => {
  try {
    const res = await apiTestimonialsService.patch(`/${id}`, data);
    return res.data;
  } catch (error: any) {  
    throw new Error(error.response?.data?.message || "Error de conexión");
  }
};

export const updateStatusOfTestimonyById = async (id: string, data: TestimonyStatusType) => {
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

