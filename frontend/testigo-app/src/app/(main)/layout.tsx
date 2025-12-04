import LayoutGeneral from "@/components/layout/LayoutGeneral";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutGeneral>
      {children}
    </LayoutGeneral>
  );
}