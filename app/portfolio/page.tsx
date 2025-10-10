"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortfolioBubblesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page with portfolio section
    router.replace('/#portfolio');
  }, [router]);

  return (
    <main className="relative bg-[#0a0b10] min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-white/50">Redirecting to portfolio...</div>
        </div>
      </div>
    </main>
  );
}