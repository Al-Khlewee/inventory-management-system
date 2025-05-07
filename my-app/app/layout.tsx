import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Medical Device Inventory Management Portal - AL NASIRIYA TEACHING HOSPITAL',
  description: 'A portal for managing medical device inventory at AL NASIRIYA TEACHING HOSPITAL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center group">
                <img src="/window.svg" alt="Logo" className="h-8 w-8 mr-3 filter brightness-0 invert transition-transform group-hover:scale-110" />
                <div>
                  <h1 className="text-xl font-bold font-poppins tracking-tight">Medical Device Inventory</h1>
                  <p className="text-xs text-teal-100">AL NASIRIYA TEACHING HOSPITAL</p>
                </div>
              </Link>
            </div>
          </nav>
          
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
          
          <footer className="bg-slate-800 text-white p-5 mt-8">
            <div className="container mx-auto text-center">
              <p className="text-sm text-slate-300">© {new Date().getFullYear()} Medical Device Inventory Management Portal - AL NASIRIYA TEACHING HOSPITAL</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
