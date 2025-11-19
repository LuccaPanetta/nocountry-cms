import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Aquí puedes agregar navegación, sidebar, header, etc. */}
      {children}
    </section>
  );
}
