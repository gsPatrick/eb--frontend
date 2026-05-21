import '@/styles/globals.css';
import Providers from './providers';

export const metadata = {
  title: 'EB Services — Limpeza profissional com tecnologia',
  description: 'Plataforma EB Services — Cleaning and Maintenance com geofence, prova visual e portais integrados.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
