import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EPI Manager", template: "%s | EPI Manager" },
  description: "Sistema digital de gestão, rastreabilidade e assinatura de EPIs",
  keywords: ["EPI", "segurança do trabalho", "SST", "gestão de EPIs", "NR-6"],
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
