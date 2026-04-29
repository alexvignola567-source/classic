
export const metadata = {
  title: "FantaLega Classic",
  description: "Fantasy football app"
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
