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

  const page = Number(params.get("page") ?? 1);
  const limit = 6;

  const { data, isLoading } = useGetPublicTestimonials({
    page,
    limit,
    search: keyword,
    category: filteredCategory,
    order: orderValue,
  });

  const total = data?.total ?? 0;
  const testimonials = data?.testimonials ?? [];
  const totalPages = Math.ceil(total / limit);

  const onPageChange = useCallback(
    (newPage: number) => {
      const query = new URLSearchParams(params.toString());
      query.set("page", String(newPage));
      router.replace(`?${query.toString()}`);
    },
    [router, params]
  );

  useEffect(() => {
    const query = new URLSearchParams(params.toString());
    query.set("page", "1");
    router.replace(`?${query.toString()}`);
  }, [keyword, filteredCategory, orderValue]);

  return {
    page,
    totalPages,
    testimonials,
    pageSize: limit,
    total,
    isLoading,
    onPageChange,
  };
}
