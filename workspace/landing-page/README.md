# Map For Success — Sales Page

Trang bán hàng cho **Bản Đồ Sự Nghiệp 21 Chỉ Số**, được build từ offer đã đóng gói qua `biz-offer-alex-hormozi` (xem `../../output/cases/map-for-success-21-chi-so/`).

## Style direction đã chọn

**B — Warm Social Proof**

- Màu: Sky blue trust (`#0EA5E9`) + CTA cam ấm (`#F97316`), nền `#F0F9FF`, chữ `#0C4A6E`
- Font: **Newsreader** (heading, serif) + **Roboto** (body) — pairing "News Editorial", cảm giác đáng tin cậy, dễ đọc cho trang dài
- Pattern: Hero → Vấn đề → Giải pháp/Mechanism → Lợi ích → Bằng chứng xã hội → Offer Stack + Giá → Bảo đảm → Urgency → FAQ → CTA cuối (Hormozi long-form)
- Toàn bộ nội dung lấy từ `lib/offer.ts`, sinh ra từ `offer.json`/`conversion-copy.md`

## Chạy dự án

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Build production:

```bash
npm run build
npm start
```

## Cấu trúc

- `app/page.tsx` — ghép các section lại
- `components/*` — từng section (Hero, ProblemSection, SolutionSection, BenefitsSection, SocialProofSection, OfferStackSection, GuaranteeSection, UrgencySection, FaqSection, FinalCtaSection, Header, Footer, LeadForm, StickyMobileCta)
- `lib/offer.ts` — toàn bộ nội dung/số liệu offer (sửa nội dung ở đây, không cần sửa component)
- `app/api/lead/route.ts` — nhận submit từ form (Tên/SĐT/Email), validate, hiện chỉ `console.log`

## Việc cần làm trước khi launch thật

1. **Thay case study placeholder** trong `components/SocialProofSection.tsx` bằng câu chuyện thật từ Bonus 2 (Thư viện 30+ case study) — hiện đang là placeholder, chưa có testimonial thật nào.
2. **Wire `/api/lead` vào email/CRM thật** — chạy skill `/biz-email-setup` để gắn Resend auto-responder, hoặc `/biz-setup-sepay-payment` nếu cần thu tiền trực tiếp qua VietQR.
3. **Deploy lên Vercel** — chạy skill `/biz-deploy-vercel`.
4. Thay ảnh đại diện/logo nếu có (hiện trang chưa dùng ảnh, chỉ text + icon SVG).
