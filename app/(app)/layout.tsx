import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UploadProvider } from "@/components/upload/UploadContext";
import { UploadQueue } from "@/components/upload/UploadQueue";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <UploadProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* Polished Modular Sidebar */}
        <Sidebar
          user={{
            name: session.user?.name,
            email: session.user?.email,
          }}
        />

        {/* Main View Area */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            minHeight: "100vh",
          }}
        >
          {children}
        </main>

        {/* Persistent Floating Upload Tray */}
        <UploadQueue />
      </div>
    </UploadProvider>
  );
}
