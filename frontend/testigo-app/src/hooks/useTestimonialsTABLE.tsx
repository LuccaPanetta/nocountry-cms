import { TestimonyResType } from "@/types/testimony-type";
import { useState } from "react";

export const useTestimonialsTable = (testimonials: TestimonyResType[]) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  return {
    openDropdown,
    setOpenDropdown,
    currentPage,
    setCurrentPage,
    totalPages,
    currentTestimonials,
    nextPage,
    prevPage,
    toggleDropdown,
  };
};
