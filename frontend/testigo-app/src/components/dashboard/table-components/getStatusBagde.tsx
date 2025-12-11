import { TestimonyStatusType } from "@/types/testimony-type";

  export const getStatusBadge = (status: TestimonyStatusType) => {
    const styles: Record<TestimonyStatusType, string> = {
      pending: 'bg-accent/20',
      approved: 'bg-Success/20',
      rejected: 'bg-destructive/20',
      in_review: 'bg-primary/20',
    };

    const labels: Record<TestimonyStatusType, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      in_review: 'En revisión'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };
