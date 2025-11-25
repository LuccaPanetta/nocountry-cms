import { useUserStore } from "@/store/userStore";
import { useParams } from "next/navigation";

export default function ContributorDashboardId() {
  const { id } = useParams();
  const nombre = useUserStore((state) => state.nombre);
  const apellido = useUserStore((state) => state.apellido);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        👤 Bienvenido, {nombre} {apellido} (Contributor)
      </h1>
      <p>Tu ID: {id}</p>
      {/* ...resto del dashboard... */}
    </div>
  );
}
