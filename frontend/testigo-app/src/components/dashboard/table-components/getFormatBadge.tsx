import { TestimonyResType } from "@/types/testimony-type";

  export const getFormatBadge = (multimedia?: TestimonyResType['multimedia']) => {
    if (!multimedia) {
      return (
        <span className="inline-flex justify-center py-1  rounded-full text-xs font-medium border-foreground border w-18 text-center">
          TEXTO
        </span>
      );
    }

    const styles: Record<string, string> = {
      VIDEO: 'border-secondary border text-secondary',
      IMAGEN: 'border-primary border text-primary',
    };

    return (
      <span className={`inline-flex justify-center  py-1 rounded-full text-xs font-bold w-18 text-center ${styles[multimedia.tipo] || 'bg-gray-100 text-gray-800'}`}>
        {multimedia.tipo}
      </span>
    );
  };
