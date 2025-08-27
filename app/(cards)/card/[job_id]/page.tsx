import CardView from "../../components/CardView";
import type { CardMinimal } from "@/app/lib/types";

async function fetchLatest(jobId: string): Promise<CardMinimal> {
  // For v1 we reuse the mock run; in real flow we'd fetch by jobId or latest.json
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/cards/run`, { method: "POST" });
  const data = await r.json();
  return data.card;
}

export default async function CardViewer({ params }: { params: { job_id: string } }) {
  const card = await fetchLatest(params.job_id);
  return (
    <main className="min-h-screen bg-[#0a0b10] text-white flex flex-col items-center justify-center p-6">
      <CardView card={card} />
    </main>
  );
}


