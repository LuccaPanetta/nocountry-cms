"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export const CustomPagination = ({ page, totalPages, onPageChange }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleNavigate = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        // Update page param
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());

        router.push(`?${params.toString()}`, { scroll: false });

        onPageChange(newPage);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Pagination className="mt-8">
            <PaginationContent>

                {/* First */}
                <PaginationItem>
                    <PaginationLink
                        onClick={() => page !== 1 && handleNavigate(1)}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    >
                        Primero
                    </PaginationLink>
                </PaginationItem>

                {/* Previous */}
                <PaginationItem>
                    <PaginationPrevious
                        aria-label="Página anterior"
                        onClick={() => handleNavigate(page - 1)}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {/* Current Page */}
                <PaginationItem>
                    <PaginationLink
                        isActive
                        className="font-bold bg-secondary text-white"
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>

                {/* Next */}
                <PaginationItem>
                    <PaginationNext
                        aria-label="Página siguiente"
                        onClick={() => handleNavigate(page + 1)}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {/* Last */}
                <PaginationItem>
                    <PaginationLink
                        onClick={() => page !== 1 && handleNavigate(1)}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    >
                        Último
                    </PaginationLink>
                </PaginationItem>

            </PaginationContent>
        </Pagination>
    );
};
