// hooks/usePaginationTestimonials.ts
import { useGetPublicTestimonials } from "@/services/use-queries-service/testimonials-query-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export function usePaginatedTestimonials({
  keyword,
  filteredCategory,
  orderValue,
}: {
  keyword: string;
  filteredCategory: string;
  orderValue: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  // Asegurar que page sea al menos 1
  const pageParam = params.get("page");
  const page = pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  const limit = 6;

  const { data, isLoading, isFetching } = useGetPublicTestimonials({
    page,
    limit,
    search: keyword,
    category: filteredCategory,
    order: orderValue,
  });

  const total = data?.total ?? 0;
  const testimonials = data?.testimonials ?? [];
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const onPageChange = useCallback(
    (newPage: number) => {
      const query = new URLSearchParams(params.toString());
      query.set("page", String(newPage));
      router.replace(`?${query.toString()}`, { scroll: false });
    },
    [router, params]
  );

  // Solo resetear página cuando cambian los filtros
  useEffect(() => {
    if (page !== 1) {
      const query = new URLSearchParams(params.toString());
      query.set("page", "1");
      router.replace(`?${query.toString()}`, { scroll: false });
    }
  }, [keyword, filteredCategory, orderValue]);

  return {
    page: Math.min(page, totalPages), // Asegurar que page no exceda totalPages
    totalPages,
    testimonials,
    pageSize: limit,
    total,
    isLoading: isLoading || isFetching,
    onPageChange,
  };
}