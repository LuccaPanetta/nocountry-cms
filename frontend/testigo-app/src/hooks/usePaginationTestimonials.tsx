import { useGetPublicTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function usePaginatedTestimonials({
  keyword,
  filteredCategory,
}: {
  keyword: string;
  filteredCategory: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const page = Number(params.get("page") ?? 1);
  const limit = 6;

  const { data, isLoading } = useGetPublicTestimonials({
    page,
    limit,
    search: keyword,
    category: filteredCategory,
  });

  const total = data?.total ?? 0;
  const testimonials = data?.testimonials ?? [];

  // total pages from backend
  const totalPages = Math.ceil(total / limit);

  // update URL on page change
  const onPageChange = useCallback(
    (newPage: number) => {
      const query = new URLSearchParams(params.toString());
      query.set("page", String(newPage));
      router.push(`?${query.toString()}`);
    },
    [router, params]
  );

  return {
    page,
    totalPages,
    testimonials,
    total,
    isLoading,
    onPageChange,
  };
}