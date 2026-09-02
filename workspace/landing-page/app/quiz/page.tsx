import type { Metadata } from "next";
import { LogoHeader } from "@/components/LogoHeader";
import { QuizApp } from "@/components/quiz/QuizApp";

export const metadata: Metadata = {
  title: "Bài Test Phong Cách Học Tập VAKAD | Tiara Edu",
  description:
    "10 câu trắc nghiệm miễn phí giúp con biết mình tiếp nhận kiến thức theo kiểu nào — và cách ôn hợp với kiểu đó. Khoảng 4-5 phút.",
};

export default function QuizPage() {
  return (
    <>
      <LogoHeader />
      <QuizApp />
    </>
  );
}
