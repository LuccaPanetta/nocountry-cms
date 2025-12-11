import { updateStatusOfTestimonyById } from '@/services/use-cases/testimonials.service';
import { TestimonyResType, TestimonyStatusType, TestimonyStatusTypeReq } from '@/types/testimony-type';

import { QueryObserverResult, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useUserStore } from '@/store/userStore';
import { Button } from '../ui/button';

type TestimonialStatusModalProps = {
    statusModalOpen: boolean;
    setStatusModalOpen: Dispatch<SetStateAction<boolean>>;
    selectedTestimonial: TestimonyResType | null;
    setSelectedTestimonial: Dispatch<SetStateAction<TestimonyResType | null>>;
    refetch: () => Promise<QueryObserverResult<any, Error>>;
};

export const TestimonialStatusModal = ({
    statusModalOpen,
    setStatusModalOpen,
    selectedTestimonial,
    setSelectedTestimonial,
    refetch
}: TestimonialStatusModalProps) => {

    const { rol } = useUserStore()

    const [newStatus, setNewStatus] = useState<TestimonyStatusType>(
        selectedTestimonial?.status ?? "pending"
    );

    const mutationUpdateStatusTestimonyById = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TestimonyStatusTypeReq }) =>
            updateStatusOfTestimonyById(id, data),
    });

    const saveStatusChange = async () => {
        if (!selectedTestimonial) return;

        try {
            await mutationUpdateStatusTestimonyById.mutateAsync({
                id: selectedTestimonial.id,
                data: { status: newStatus },
            });

            await refetch();
            setStatusModalOpen(false);
            setSelectedTestimonial(null);
        } catch (error) {
            console.error("Error al actualizar estado", error);
            alert("No se pudo actualizar el estado.");
        }
    };

    const statusOptions =
        rol === "admin"
            ? [
                { value: "in_review", label: "En revisión" },
                { value: "approved", label: "Aprobado" },
                { value: "rejected", label: "Rechazado" },
            ]
            : [
                { value: "pending", label: "Pendiente" },
                { value: "in_review", label: "En revisión" },
                { value: "rejected", label: "Rechazado" },
            ];

    useEffect(() => {
        if (selectedTestimonial) {
            setNewStatus(selectedTestimonial.status);
        }
    }, [selectedTestimonial]);


    return (
        <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
            <DialogContent className="sm:max-w-md backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle>Cambiar estado</DialogTitle>
                    <DialogDescription>
                        Selecciona un nuevo estado para este testimonio.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <label className="text-sm text-gray-700 mb-1 block">Nuevo estado</label>
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TestimonyStatusType)}
                        className="w-full p-2 border rounded-md"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setStatusModalOpen(false)}
                        className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>

                    <Button
                        onClick={saveStatusChange}
                        disabled={mutationUpdateStatusTestimonyById.isPending}
                        
                    >
                        {mutationUpdateStatusTestimonyById.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

    );
};