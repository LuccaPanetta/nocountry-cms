import { useMutation } from "@tanstack/react-query";
import {
  deleteTestimonyById,
  postTestimonials,
  updateStatusOfTestimonyById,
  updateTestimonyById,
} from "../use-cases/testimonials.service";
import { TestimonyStatusType, TestimonyType } from "@/types/testimony-type";

export const TestimonialsMutationsService = () => {
  const mutationPostTestimony = useMutation({
    mutationFn: (data: TestimonyType) => {
      return postTestimonials(data);
    },
  });

  const mutationUpdateTestimonyById = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestimonyType }) => {
      return updateTestimonyById(id, data);
    },
  });

   const mutationUpdateStatusTestimonyById = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestimonyStatusType }) => {
      return updateStatusOfTestimonyById(id, data);
    },
  });

  const mutationDeleteTestimonyById = useMutation({
    mutationFn: (id: string) => {
      return deleteTestimonyById(id);
    },
  });

  return {
    mutationPostTestimony,
    mutationUpdateTestimonyById,
    mutationUpdateStatusTestimonyById,
    mutationDeleteTestimonyById,
  };
};
