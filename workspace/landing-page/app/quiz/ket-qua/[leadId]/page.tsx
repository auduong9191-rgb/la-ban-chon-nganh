import Image from "next/image";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { LogoHeader } from "@/components/LogoHeader";
import { ReportRenderer } from "@/components/quiz/ReportRenderer";

export const dynamic = "force-dynamic";

export default async function QuizResultPage(
  props: PageProps<"/quiz/ket-qua/[leadId]">
) {
  const { leadId } = await props.params;

  const { data: lead } = await supabaseAdmin
    .from("quiz_leads")
    .select("id, ho_ten, free_report, has_vakad")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    notFound();
  }

  const heading = lead.has_vakad
    ? `${lead.ho_ten}, đây là báo cáo phong cách học tập của con`
    : `${lead.ho_ten}, đây là kết quả giải mã năng lực của con`;

  return (
    <>
      <LogoHeader />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-accent text-center mb-2">
            Tiara Edu · Kết quả của con
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink text-center mb-8">
            {heading}
          </h1>

          <div className="rounded-[28px] border border-border-soft bg-background p-1.5 shadow-sm mb-10">
            <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-surface p-6 sm:p-10">
              <Image
                src="/tiara-edu-logo.png"
                alt=""
                width={480}
                height={480}
                aria-hidden
                className="pointer-events-none select-none absolute left-1/2 top-1/2 w-[70%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
              />
              <div className="relative z-10">
                <ReportRenderer
                  markdown={lead.free_report}
                  leadId={lead.id}
                  hasVakad={lead.has_vakad}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
