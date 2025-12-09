"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronFirst, ChevronLast } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils"

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
                        className={cn(
                            "border border-primary rounded-md text-primary",
                            page === 1 && "opacity-50 pointer-events-none"
                        )}
                    >
                        <ChevronFirst />
                    </PaginationLink>
                </PaginationItem>

                {/* Previuos */}
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handleNavigate(page - 1)}
                        className={cn(
                            "border border-primary rounded-md text-primary",
                            page === 1 && "opacity-50 pointer-events-none"
                        )}
                    />
                </PaginationItem>

                {/* Current Page */}
                <PaginationItem>
                    <PaginationLink
                        isActive
                        className="font-bold bg-primary text-white"
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>

                {/* Next */}
                <PaginationItem>
                    <PaginationNext
                        onClick={() => handleNavigate(page + 1)}
                        className={cn(
                            "border border-primary rounded-md text-primary",    
                            page === totalPages && "opacity-50 pointer-events-none"
                        )}
                    />
                </PaginationItem>

                {/* Last */}
                <PaginationItem>
                    <PaginationLink
                        onClick={() => page !== totalPages && handleNavigate(totalPages)}
                        className={cn(
                            "border border-primary rounded-md text-primary",  
                            page === totalPages && "opacity-50 pointer-events-none"
                        )}
                    >
                        <ChevronLast />
                    </PaginationLink>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
