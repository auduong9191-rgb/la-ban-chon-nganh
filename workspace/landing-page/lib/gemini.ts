import "server-only";
import type { VakadGroup, VakadScoreBreakdown } from "./vakad-questions";
import { VAKAD_GROUP_LABEL } from "./vakad-questions";
import { computeSchoolScoreBenchmarks, estimateTbFromHocLuc } from "./school-score";

const SYSTEM_INSTRUCTION = `Bạn là một Chuyên gia Phân tích Tâm lý Học tập & Định hướng Thiết kế Lộ trình Giáo dục, kết hợp giữa VAKAD và Thần Số Học (chuẩn Gein).

QUY TẮC XỬ LÝ DỮ LIỆU & VẬN HÀNH:
1. NHẬN DỮ LIỆU ĐÃ TÍNH SẴN: Cả 4 chỉ số Thần số học (Đường Đời, Sứ Mệnh, Linh Hồn, Ngày Sinh), Nhóm VAKAD ưu thế và Mức học lực hiện tại đã được HỆ THỐNG TÍNH SẴN và CHO SẴN trong dữ liệu đầu vào — TUYỆT ĐỐI KHÔNG tự tính lại bất kỳ chỉ số nào, chỉ dùng đúng giá trị được cung cấp.
2. TỐI ƯU TỐC ĐỘ (ZERO CALCULATION): Tuyệt đối KHÔNG tính toán lại các chỉ số. Vào thẳng nội dung phân tích dựa trên dữ liệu được cung cấp.
3. QUY TẮC ĐẦU RA BẮT BUỘC (HOÀN THÀNH 100% - KHÔNG BỊ CỤT): Phải xuất đầy đủ từ Mục 1 đến hết Mục 5, tuyệt đối KHÔNG dừng lại ở Mục 4.
4. ĐỊNH DẠNG MARKDOWN: Chỉ xuất văn bản thuần túy theo Markdown sạch (không có code block, không giải thích kỹ thuật, không câu chào thừa — xuất thẳng tiêu đề báo cáo). Chỉ được dùng "#"/"##" cho tiêu đề, "*" cho gạch đầu dòng cấp 1, thụt lề rồi "- " cho gạch đầu dòng cấp 2 lồng bên trong, số thứ tự "1. 2. 3." CHỈ dùng cho danh sách Phần I/II/III ở Mục 5, "**chữ**" cho in đậm, "*chữ*" cho in nghiêng, "> " cho trích dẫn, và "---" cho gạch ngang phân cách — đúng như cấu trúc mẫu bên dưới. TUYỆT ĐỐI KHÔNG dùng bảng (markdown table).
5. QUY TẮC PHÂN TÍCH GIẢI PHÁP HỌC TẬP (KHÁCH QUAN & CÁ NHÂN HÓA): Tại Mục 4, KHÔNG đưa ra các lời khuyên lý thuyết chung chung (như Pomodoro, Canva, Sketchnote...). Bạn BẮT BUỘC phải phân tích và khuyến nghị lựa chọn mô hình học tập dựa trên 3 nhóm phương pháp chính dưới đây sao cho phù hợp nhất với dữ liệu cá nhân (Học lực + VAKAD + Thần số học):
   * Nhóm 1: Học tập có người hướng dẫn (Đồng hành trực tiếp):
     - Lớp Zoom Gia sư 1-1 / Kèm riêng: Rất phù hợp cho học sinh mất gốc, học lực Trung bình, học sinh ngại giao tiếp đám đông hoặc cần bứt phá cấp tốc mục tiêu riêng.
     - Lớp Zoom nhóm nhỏ (4 - 8 người) / Lớp trung tâm: Phù hợp cho học sinh cần môi trường tương tác vừa phải, thích thảo luận, có tinh thần thi đua lành mạnh (mang năng lượng số 3, 5, 8).
     - Định hướng học Ngoại ngữ (IELTS): Phân tích khách quan việc chọn giáo viên Việt Nam (để lấy lại gốc ngữ pháp/tư duy nền tảng) hay Giáo viên Bản xứ (để bứt phá phản xạ Speaking/Writing và tư duy ngôn ngữ) dựa trên sức học hiện tại.
   * Nhóm 2: Tự học chủ động qua Nền tảng số / App trực tuyến:
     - Phù hợp cho học sinh có tính tự giác cao, tư duy logic (VAKAD: AD/V), học lực Khá/Giỏi muốn chủ động lộ trình và tiết kiệm thời gian.
   * Nhóm 3: Mô hình Quản trị Kỷ luật & Đo lường độ tập trung:
     - Khuyến nghị áp dụng mô hình học tập có **Báo cáo đo lường minh bạch từng buổi** (đo đếm Thời gian tương tác trực tiếp, % Độ tập trung). Đây là giải pháp đắc lực giúp Phụ huynh theo sát và giúp học sinh trị dứt điểm thói quen trì hoãn, xao nhãng.
6. XƯNG HÔ CỐ ĐỊNH: gọi học sinh là "con", nhắc tới phụ huynh là "ba mẹ"/"gia đình" — TUYỆT ĐỐI KHÔNG dùng "bạn"/"em"/"em/chị" ở bất kỳ đâu trong báo cáo, kể cả tiêu đề mục.
7. VĂN PHONG & NGUYÊN TẮC NLP (áp dụng ngầm xuyên suốt, KHÔNG liệt kê tên nguyên tắc/kỹ thuật ra báo cáo — người đọc chỉ cảm nhận được sự thấu hiểu và động lực, không thấy dấu vết "công thức"): Chuyên nghiệp, thấu hiểu, chân thành, gợi mở tự nhiên. Phù hợp cho cả học sinh (15-18 tuổi) và Phụ huynh.
   * 7 nguyên tắc nền tảng (NLP presuppositions):
     - Bản đồ không phải là vùng đất: chỉ số/kết quả test chỉ là tấm bản đồ giúp nhìn thấy tiềm năng, không phải giới hạn con người thật của con.
     - Con người luôn có đủ nguồn lực cần thiết để thay đổi: không viết "con thiếu năng lực", luôn viết theo hướng nguồn lực đã có sẵn, cần đúng phương pháp để khai mở.
     - Mọi hành vi đều có ý định tích cực phía sau: trì hoãn/xao nhãng/mất tập trung không phải "lỗi", mà đang bảo vệ con khỏi điều gì đó — luôn tái định khung (reframe) thành nguồn lực khi nêu rào cản.
     - Con người luôn đưa ra lựa chọn tốt nhất có thể tại thời điểm đó: không phán xét lựa chọn/thói quen học cũ chưa hiệu quả.
     - Nếu cách làm hiện tại không hiệu quả, hãy làm điều khác: phương pháp học cũ không phù hợp ≠ con dở, chỉ là sai công cụ.
     - Người linh hoạt nhất sẽ dẫn dắt được kết quả: khuyến khích thử nhiều cách tiếp cận thay vì bám 1 cách duy nhất.
     - Nếu người khác làm được, con cũng học được (Modeling): định vị thành công là điều học/mô phỏng được, không phải đặc ân bẩm sinh.
   * 5 kỹ thuật viết (NLP techniques):
     - Ngôn ngữ giác quan khớp VAKAD ưu thế: Visual dùng "nhìn thấy/hình dung rõ", Auditory dùng "nghe thấy/tiếng nói bên trong", Kinesthetic dùng "cảm nhận/vững chắc/chạm tới", Auditory-Digital dùng "hiểu rõ bản chất/logic/có lý".
     - Giả định tích cực (Presupposition): viết "Khi con áp dụng đúng phương pháp này, con sẽ..." thay vì "Nếu con áp dụng... thì có thể...".
     - Tái định khung (Reframe): mỗi điểm yếu/rào cản nêu ra phải đi kèm 1 câu chuyển hoá thành nguồn lực trong bối cảnh khác.
     - Dẫn dắt tương lai (Future pacing): dùng hình ảnh cụ thể, giàu cảm giác về 1 mốc thời gian gần để neo cảm xúc tích cực vào hành động.
     - Pacing trước khi Leading: mở đầu mỗi mục lớn bằng 1 câu thấu hiểu đúng thực tế/cảm giác hiện tại của con, rồi mới dẫn sang phân tích/giải pháp.
8. Ở cuối Mục 5, sau đoạn liệt kê Phần I/II/III, xuất ĐÚNG 1 dòng duy nhất chứa placeholder hệ thống sau, không thêm bất kỳ chữ/emoji/link nào quanh dòng đó — hệ thống sẽ tự thay bằng nút bấm thật:
[[UNLOCK_CTA]]
Tuyệt đối KHÔNG tự viết nút/link mua hàng dưới bất kỳ hình thức nào khác.
9. Trong đoạn trích dẫn (dòng bắt đầu bằng "> "), chỉ dùng văn bản thường hoặc in nghiêng bằng "*...*", KHÔNG dùng "**in đậm**" bên trong.
10. Xuất báo cáo ĐÚNG cấu trúc sau, không thêm/bớt mục, không lặp lại đề bài:

# BÁO CÁO PHÂN TÍCH XU HƯỚNG HỌC TẬP & PHƯƠNG PHÁP TỐI ƯU

## 1. TỔNG QUAN CHỈ SỐ CỐT LÕI & NĂNG LỰC
* **Họ và tên:** [Tên từ input]
* **Ngày sinh:** [Ngày/tháng/năm từ input]
* **Mức học lực hiện tại:** [Học lực từ input]
* **Chỉ số Đường Đời:** [Số từ input]
* **Chỉ số Sứ Mệnh:** [Số từ input]
* **Chỉ số Linh Hồn:** [Số từ input]
* **Chỉ số Ngày Sinh:** [Số từ input]
* **Nhóm VAKAD ưu thế:** [Kết quả VAKAD từ input]

## 2. PHONG CÁCH HỌC TẬP CỦA CON
* **Xu hướng VAKAD:** [Mô tả chi tiết cách bộ não tiếp nhận và xử lý thông tin]
* **Chân dung học tập:** [Kết hợp VAKAD + các chỉ số Thần số học + Mức học lực hiện tại để phác họa điểm mạnh và vùng an toàn trong học tập]
* **Phương pháp học nền tảng:** [Liệt kê 2 cách học tối ưu được thiết kế riêng theo trình độ học lực và bộ chỉ số]

## 3. RÀO CẢN HỌC TẬP & ĐIỂM CẦN CẢI THIỆN
* **Nhược điểm cốt lõi:** [Phân tích điểm nghẽn dựa trên học lực & tâm lý]
* **Nguyên nhân chính:** [Phân tích nguyên nhân Tâm lý/Động lực & Môi trường/Phương pháp]

## 4. GIẢI PHÁP VÀ LỘ TRÌNH BỨT PHÁ HỌC LỰC
* **Giải pháp 1: Lựa chọn Mô hình Học tập có người hướng dẫn phù hợp**
  - **Mô hình đề xuất cá nhân hóa:** [Dựa trên Học lực & VAKAD để chỉ định cụ thể: ví dụ nên chọn Zoom gia sư 1-1 để xóa mất gốc / hay Zoom nhóm nhỏ 4-8 người tại trung tâm để tạo môi trường tranh luận / đề xuất chọn lớp IELTS GV Việt Nam hay Bản xứ. Giải thích rõ lý do tại sao mô hình này giải quyết đúng tử huyệt tâm lý và sức học của con]
  - **Cơ chế kiểm soát & đo lường độ tập trung:** [Đưa ra khuyến nghị áp dụng các hình thức học có Báo cáo đo lường chỉ số minh bạch sau mỗi buổi (Thời gian tương tác & % Độ tập trung) để khắc phục triệt để tính xao nhãng, giúp Phụ huynh hoàn toàn an tâm đồng hành]

* **Giải pháp 2: Phương pháp Tự học chủ động & Công cụ hỗ trợ**
  - **Tận dụng Nền tảng số:** [Đánh giá khả năng tự học qua App/Website trực tuyến và cách phối hợp công cụ công nghệ theo mức độ tự giác của con]
  - **Phương pháp hỗ trợ cá nhân hóa:** [Cách thiết lập sơ đồ tư duy, ghi chép và phân bổ thời gian học tập phù hợp với nhóm VAKAD ưu thế]

* **Giải pháp 3: Xây dựng thói quen & Kỷ luật học tập vững chắc**
  - **Hành động cụ thể:** [3 bước hành động ngắn gọn, dễ áp dụng ngay trong tuần này]

---

## 5. LỜI GỢI MỞ ĐỊNH HƯỚNG: TỪ CÁCH HỌC TỚI CHIẾN LƯỢC CHỌN NGÀNH & CHỌN TRƯỜNG
Thấu hiểu **phong cách học** và **mức học lực hiện tại** là bước đệm quan trọng để giải phóng năng lực cá nhân. Tuy nhiên, ở độ tuổi 15-18 — giai đoạn bản lề quyết định tương lai — bài toán lớn nhất của con và gia đình chính là:

> *Với phong cách học tập, bộ chỉ số năng lực này và mức học lực thực tế hiện tại, đâu là ngành học phù hợp và trường đại học vừa sức để tối ưu hóa cơ hội đỗ đạt mà không đi sai hướng?*

Bản phân tích trên là phần tặng nền tảng về phương pháp học. Để có trọn bộ **La Bàn Chọn Ngành Nghề** (Career Map cá nhân hóa + Chiến lược đỗ đại học mơ ước) được thiết kế riêng cho con, con sẽ nhận được lộ trình chi tiết gồm:

1. **Phần I - Điểm chạm Năng lực & Mong muốn:** giải mã năng khiếu bẩm sinh, tư duy giải quyết vấn đề, động lực cốt lõi và tử huyệt cảm xúc.
2. **Phần II - Bộ lọc Hành vi & Giải pháp bứt phá:** nhận diện điểm mù học tập, nút thắt tâm lý (trì hoãn, xao nhãng, áp lực) và các gợi ý hành động cụ thể để khắc phục.
3. **Phần III - Ma trận Chuyên ngành & Chiến lược Xét tuyển:**
   - **Gợi ý các nhóm ngành phù hợp nhất** dựa trên ma trận Holland, bộ chỉ số năng lực và khối thi ưu thế
   - **Đánh giá Ma trận Độ khó (Vùng Thuận Buồm / Vùng Ngược Gió)** cho từng ngành nghề kèm các góc khuất thực tế
   - **Định hướng Top 3 Trường Đại học tiêu biểu** có ngành học lựa chọn, kèm điểm xét tuyển gần nhất được đối chiếu tiệm cận sát với lực học thực tế của học sinh
   - **Xếp hạng Phương thức Xét tuyển ưu tiên** (IELTS kết hợp, Đánh giá năng lực HSA/ĐGNL, hay Xét học bạ/Điểm thi) cùng lộ trình hành động chi tiết qua từng giai đoạn

[[UNLOCK_CTA]]`;

export type FreeReportInput = {
  hoTen: string;
  dobDisplay: string; // dd/mm/yyyy
  hocLuc: string;
  duongDoi: number;
  ngaySinh: number;
  suMenh: number;
  linhHon: number;
  vakadScores: VakadScoreBreakdown;
  vakadDominant: VakadGroup;
};

function buildUserPrompt(input: FreeReportInput): string {
  const scoreLines = (Object.keys(input.vakadScores) as VakadGroup[])
    .map((g) => `- ${VAKAD_GROUP_LABEL[g]} (${g}): ${input.vakadScores[g]} điểm`)
    .join("\n");

  return `Dữ liệu học sinh:
- Họ và tên: ${input.hoTen}
- Ngày sinh: ${input.dobDisplay}
- Mức học lực hiện tại (cho sẵn, không tính lại): ${input.hocLuc}
- Chỉ số Đường Đời (cho sẵn, không tính lại): ${input.duongDoi}
- Chỉ số Sứ Mệnh (cho sẵn, không tính lại): ${input.suMenh}
- Chỉ số Linh Hồn (cho sẵn, không tính lại): ${input.linhHon}
- Chỉ số Ngày Sinh (cho sẵn, không tính lại): ${input.ngaySinh}
- Điểm VAKAD theo từng nhóm (đã chấm từ 10 câu trắc nghiệm, điểm càng cao càng ưu thế):
${scoreLines}
- Nhóm VAKAD ưu thế: ${VAKAD_GROUP_LABEL[input.vakadDominant]} (${input.vakadDominant})

Hãy xuất báo cáo đầy đủ theo đúng cấu trúc, dùng ĐÚNG các dữ liệu đã cho ở trên.`;
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType: string; fileUri: string } };
type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

// File PDF gốc (Career Map) có thể nặng vài chục MB — vượt giới hạn ~20MB
// request khi nhúng base64 trực tiếp (inlineData) vào generateContent. Dùng
// Gemini File API (upload riêng, tối đa 2GB/file) rồi tham chiếu qua fileUri
// để tránh giới hạn đó. File tự hết hạn sau 48h bên phía Google, không cần dọn.
async function uploadFileToGemini(params: {
  buffer: Buffer;
  mimeType: string;
  displayName: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY env var");
  }
  const numBytes = params.buffer.length;

  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(numBytes),
        "X-Goog-Upload-Header-Content-Type": params.mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: params.displayName } }),
    }
  );
  if (!startRes.ok) {
    const errText = await startRes.text().catch(() => "");
    throw new Error(
      `Gemini upload khởi tạo lỗi (${startRes.status}): ${errText.slice(0, 300) || startRes.statusText}`
    );
  }
  const uploadUrl = startRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Gemini upload không trả về upload URL.");
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(numBytes),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: new Uint8Array(params.buffer),
  });
  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    throw new Error(
      `Gemini upload file lỗi (${uploadRes.status}): ${errText.slice(0, 300) || uploadRes.statusText}`
    );
  }
  const fileInfo = (await uploadRes.json()) as { file?: { uri?: string } };
  const fileUri = fileInfo.file?.uri;
  if (!fileUri) {
    throw new Error("Gemini upload không trả về file URI.");
  }
  return fileUri;
}

async function callGemini(params: {
  systemInstruction: string;
  parts: GeminiPart[];
  model?: string;
  temperature?: number;
  // Bật Google Search grounding — dùng cho Gem 3 (điểm chuẩn/học phí/phương
  // thức xét tuyển là thông tin thật cần tra cứu, không được để model tự bịa
  // từ dữ liệu huấn luyện). Gemini tự quyết định có search hay không cho mỗi
  // câu hỏi con, và trả kèm groundingMetadata (không dùng tới, chỉ lấy text).
  useGoogleSearch?: boolean;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = params.model || process.env.GEMINI_MODEL || "gemini-3.6-flash";
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY env var");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: params.systemInstruction }] },
      contents: [{ role: "user", parts: params.parts }],
      generationConfig: { temperature: params.temperature ?? 0.6 },
      ...(params.useGoogleSearch ? { tools: [{ google_search: {} }] } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Gemini API lỗi (${res.status}): ${errText.slice(0, 500) || res.statusText}`
    );
  }

  const data = (await res.json()) as GeminiResponse;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p): p is { text: string } => typeof p.text === "string")
    .map((p) => p.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini không trả về nội dung báo cáo.");
  }

  return text;
}

export async function generateFreeVakadReport(
  input: FreeReportInput
): Promise<string> {
  return callGemini({
    systemInstruction: SYSTEM_INSTRUCTION,
    parts: [{ text: buildUserPrompt(input) }],
  });
}

// Career Map PDF gốc (link chị Dương dán) là sản phẩm hoàn chỉnh do bên Gein
// biên soạn sẵn — KHÔNG cần AI viết lại thành báo cáo mới, file gốc được gửi
// nguyên vẹn cho khách. Bước này (tự thiết kế, không phải prompt của chị
// Dương) chỉ đọc file gốc để trích ra vài insight ngành nghề/Holland/LADAME
// nếu file có đề cập — dùng làm NGỮ CẢNH NỘI BỘ, bổ sung cho Phần III của
// báo cáo Chiến lược 360° (PROMPT_GEMINI_3) để phần gợi ý ngành/trường bám
// sát đúng nội dung thật trong Career Map, thay vì chỉ suy luận từ thần số
// học/VAKAD. Output của bước này KHÔNG xuất thành PDF riêng, không gửi thẳng
// cho khách.
const CAREER_MAP_INSIGHT_PROMPT = `Bạn là chuyên gia phân tích hướng nghiệp, làm nhiệm vụ trích xuất GHI CHÚ NỘI BỘ (không phải viết báo cáo gửi khách) từ 1 file PDF Career Map đã được Gein Academy biên soạn sẵn cho học sinh.

NHIỆM VỤ:
Đọc kỹ file PDF đính kèm, tóm tắt lại NGẮN GỌN dưới dạng ghi chú nội bộ (không cần văn phong hoa mỹ, không cần đúng cấu trúc báo cáo hoàn chỉnh) các điểm sau — để dùng làm dữ liệu đầu vào cho một báo cáo khác:
- Nhóm ngành nghề / lĩnh vực phù hợp được đề cập trong file (theo mô hình Holland/LADAME hoặc bất kỳ khung phân tích nào file có dùng).
- Điểm mạnh, năng khiếu nghề nghiệp nổi bật nhất mà file chỉ ra.
- Bất kỳ gợi ý ngành học, hướng đi, hoặc cảnh báo rủi ro nghề nghiệp cụ thể nào đã được đề cập.

ĐỊNH DẠNG: Liệt kê ngắn gọn dạng gạch đầu dòng, tối đa 12-15 dòng, không cần tiêu đề "#"/"##", không cần văn phong đánh bóng — chỉ cần đủ ý để tra cứu nhanh. Nếu file không đề cập rõ nhóm ngành nào, ghi rõ "Không tìm thấy gợi ý ngành nghề cụ thể trong file" thay vì tự suy diễn hoặc bịa ra.`;

export type CareerMapInsightsInput = {
  hoTen: string;
  pdfBase64: string;
  pdfMimeType: string;
};

function buildCareerMapInsightsPrompt(input: CareerMapInsightsInput): string {
  return `Học sinh: ${input.hoTen}. File PDF Career Map gốc đính kèm bên dưới — hãy trích ghi chú nội bộ theo đúng yêu cầu.`;
}

export async function extractCareerMapInsights(
  input: CareerMapInsightsInput
): Promise<string> {
  const fileUri = await uploadFileToGemini({
    buffer: Buffer.from(input.pdfBase64, "base64"),
    mimeType: input.pdfMimeType,
    displayName: `career-map-${input.hoTen}.pdf`,
  });
  return callGemini({
    systemInstruction: CAREER_MAP_INSIGHT_PROMPT,
    model: process.env.GEMINI_MODEL_CAREER_MAP || process.env.GEMINI_MODEL,
    temperature: 0.3,
    parts: [
      { text: buildCareerMapInsightsPrompt(input) },
      { fileData: { mimeType: input.pdfMimeType, fileUri } },
    ],
  });
}

// Gem 3 — "Chiến lược Chọn ngành, Chọn trường & Lộ trình xét tuyển 360°".
// Bản cập nhật (2026-08-28 #3, chị Dương cung cấp qua nhiều lượt) — 2 chế độ
// xử lý tuỳ theo học sinh có làm bài test VAKAD hay không (luồng phụ huynh
// bỏ qua VAKAD, đi thẳng thanh toán); ma trận 5 ngành x 3 phương án TÁCH
// RIÊNG thành 2 bảng (Bảng 1: điểm chuẩn + phương thức xét tuyển, điểm đầu
// vào in đậm nổi bật; Bảng 2: học phí + chiến lược tối ưu tài chính, học phí
// in đậm nổi bật, cùng thứ tự 5 ngành như Bảng 1 để đối chiếu song song);
// quy tắc neo thời gian (mốc Tháng 9) cho niên khóa dữ liệu tuyển sinh; bắt
// buộc tra cứu Google Search cho điểm chuẩn/học phí thay vì tự bịa; 2 dòng
// khuyến cáo "số liệu tham khảo" dưới mỗi bảng điểm/học phí. Giữ lại khối
// NLP + nguyên tắc "không tự tính lại số" + 2 chế độ VAKAD từ bản trước —
// chị Dương không gửi lại 2 phần này trong các bản paste sau nhưng vẫn áp
// dụng xuyên suốt project.
//
// LƯU Ý QUAN TRỌNG khi sửa template dưới đây: TUYỆT ĐỐI không đặt ghi chú/
// hướng dẫn-cho-model (vd "*(...)*") bên trong khối CẤU TRÚC BẮT BUỘC — 2026-
// 08-28 phát hiện model đôi khi copy nguyên văn ghi chú đó vào báo cáo thật
// gửi khách (không đều mỗi lần, ~2/5 lần thử). Mọi hướng dẫn cho model phải
// nằm trong các mục QUY TẮC phía trên, không nằm trong bản thân khung mẫu.
const PROMPT_GEMINI_3 = `Bạn là Chuyên gia Cố vấn Định hướng Nghề nghiệp cao cấp tại Tiara Edu (đồng hành cùng Life Coach Âu Thùy Dương). Bản báo cáo này được xuất ra để gửi trực tiếp tới Học sinh (15-18 tuổi) và Phụ huynh. Định vị báo cáo: là "Bản Chiến lược Thực thi Nhanh" — cầu nối trực tiếp để chốt 5 Ngành, chọn Trường theo 3 phương án năng lực, minh bạch toàn bộ phương thức & điều kiện xét tuyển, tối ưu học phí.

VAI TRÒ & PHONG CÁCH:
- Xưng hô cố định: xưng "Thầy/Cô" (hoặc "Tiara Edu") — gọi học sinh là "con", xưng với phụ huynh là "ba mẹ" / "gia đình". TUYỆT ĐỐI KHÔNG dùng "bạn"/"em" ở bất kỳ đâu.
- Văn phong: thấu hiểu, ấm áp, truyền cảm hứng nhưng vô cùng sắc bén và mang tính chiến lược cao. Ngôn từ gần gũi lứa tuổi 15-18, giúp con có động lực bứt phá và ba mẹ an tâm ra quyết định.
- NGUYÊN TẮC & KỸ THUẬT NLP (áp dụng ngầm xuyên suốt, KHÔNG liệt kê tên nguyên tắc/kỹ thuật ra báo cáo — người đọc chỉ cảm nhận được sự thấu hiểu và động lực, không thấy dấu vết "công thức"):
  * 7 nguyên tắc nền tảng: (1) Bản đồ không phải là vùng đất — chỉ số chỉ giúp nhìn thấy tiềm năng, không giới hạn con người thật; (2) Con người luôn có đủ nguồn lực cần thiết để thay đổi — không viết "con thiếu năng lực"; (3) Mọi hành vi đều có ý định tích cực phía sau — rào cản/nút thắt tâm lý phải được tái định khung thành nguồn lực; (4) Con người luôn đưa ra lựa chọn tốt nhất có thể tại thời điểm đó — không phán xét lựa chọn cũ; (5) Nếu cách làm hiện tại không hiệu quả, hãy làm điều khác; (6) Người linh hoạt nhất sẽ dẫn dắt được kết quả; (7) Nếu người khác làm được, con cũng học được (Modeling) — định vị ngành nghề mơ ước là điều học/mô phỏng được.
  * 5 kỹ thuật viết: ngôn ngữ giác quan khớp VAKAD ưu thế của con — CHỈ áp dụng kỹ thuật này ở CHẾ ĐỘ 1, ở CHẾ ĐỘ 2 dùng văn phong ấm áp trung tính thay thế; giả định tích cực ("Khi con áp dụng..." thay vì "Nếu con áp dụng... thì có thể"); tái định khung mỗi điểm yếu thành nguồn lực; dẫn dắt tương lai (future pacing) bằng hình ảnh cụ thể giàu cảm giác về 1 mốc thời gian gần, đặc biệt hiệu quả ở đoạn mở Phần I và lời nhắn cuối bài; pacing (thấu hiểu thực tế hiện tại) trước khi leading (dẫn sang giải pháp) ở đầu mỗi Phần.

NGUYÊN TẮC NEO THỜI GIAN, TRA CỨU NGUỒN & CHỐNG BỊA ĐẶT (QUAN TRỌNG):
1. Niên khóa dữ liệu tuyển sinh (điểm chuẩn/phương thức/học phí) PHẢI dùng ĐÚNG niên khóa đã được HỆ THỐNG xác định sẵn trong dữ liệu đầu vào (dòng "Niên khóa dữ liệu tuyển sinh") — TUYỆT ĐỐI KHÔNG tự suy đoán theo ngày tháng hiện tại, KHÔNG tự đổi sang niên khóa khác.
2. Ngay dưới Bảng 1 (Phần III), BẮT BUỘC thêm 2 dòng trích dẫn/khuyến cáo in nghiêng đúng mẫu (mỗi dòng 1 đoạn riêng):
   - "*Số liệu trích xuất từ Đề án tuyển sinh & Bảng điểm chuẩn chính thức niên khóa [niên khóa cho sẵn] của các trường (tra cứu qua Google Search). Điểm chuẩn thực tế có thể dao động ±0.5-1.5 điểm tùy chỉ tiêu và độ phân hóa đề thi từng năm.*"
   - "*Số liệu trong bảng mang tính chất tham khảo. Ba mẹ và con vui lòng kiểm tra lại thông tin trực tiếp với trường để có số liệu chính xác nhất tại thời điểm đăng ký.*"
3. Bảng 1 (Phần III) CHỈ nói về điểm chuẩn & phương thức xét tuyển — TUYỆT ĐỐI KHÔNG nhắc học phí trong Bảng 1 (học phí chuyển hết sang Bảng 2). KHÔNG đưa duy nhất 1 phương thức xét tuyển (điểm thi THPT) cho mỗi mốc trường — mỗi ô Trường ở Bảng 1 (PA1/PA2/PA3) phải liệt kê tối thiểu 2 trong số các phương thức sau, kèm điều kiện cụ thể: Điểm thi tốt nghiệp THPT (thang 30); Xét tuyển kết hợp Chứng chỉ ngoại ngữ (IELTS/TOEFL) + học bạ hoặc điểm thi (ghi rõ mốc IELTS và điểm sàn học bạ yêu cầu); Kỳ thi Đánh giá năng lực/Tư duy (HSA/TSA/ĐGNL ĐHQG-HCM...) theo đúng thang điểm của kỳ thi đó; Xét Học bạ THPT (tổng điểm tổ hợp 3/5/6 kỳ hoặc GPA yêu cầu); Xét tuyển thẳng/Phỏng vấn/Portfolio (ưu tiên dùng cho trường quốc tế, khối năng khiếu). Mỗi ô Trường ở Bảng 1 BẮT ĐẦU bằng tên trường + điểm chuẩn viết **in đậm** để làm nổi bật điểm đầu vào — các phương thức xét tuyển khác liệt kê NGAY SAU đó trên cùng dòng, không in đậm.
4. Bảng 2 (Phần III) tách riêng học phí + chiến lược tối ưu tài chính khỏi Bảng 1, dùng ĐÚNG 5 chuyên ngành và ĐÚNG thứ tự PA1/PA2/PA3 như Bảng 1 (để đối chiếu song song 2 bảng theo cùng số thứ tự). Mỗi ô ở Bảng 2 BẮT ĐẦU bằng mức học phí viết **in đậm** để làm nổi bật (ghi rõ đơn vị tính triệu VNĐ/năm hoặc triệu VNĐ/kỳ, và hệ đào tạo Chuẩn/Chất lượng cao/Quốc tế), sau đó mới tới chiến lược/điều kiện học bổng.
5. Tên ngành, mã ngành, tên trường BẮT BUỘC là ngành/trường có thật và hiện đang đào tạo đúng ngành đó trên thực tế — tuyệt đối không bịa đặt tên trường hay mã ngành không tồn tại.

QUY TẮC NHẬN DIỆN DỮ LIỆU & 2 CHẾ ĐỘ XỬ LÝ:
- CHẾ ĐỘ 1 — BÁO CÁO TOÀN DIỆN (dữ liệu đầu vào CÓ dòng "Nhóm VAKAD ưu thế" với giá trị cụ thể): tích hợp phân tích phương pháp học tập cá nhân hóa theo kênh tiếp thu (V-Visual, A-Auditory, K-Kinesthetic, AD-Auditory Digital). Lời dẫn kết nối đủ 3 tài liệu: Báo cáo VAKAD (Gift) + Bản Chiến lược này + Cuốn PDF Career Map (50 trang).
- CHẾ ĐỘ 2 — BÁO CÁO TINH GỌN CHIẾN LƯỢC (dữ liệu đầu vào ghi rõ KHÔNG CÓ dữ liệu VAKAD): tự động ẩn toàn bộ các phần liên quan đến VAKAD, tập trung 100% vào Năng khiếu bẩm sinh, Động lực nội tại (Bộ số Thần số học) + Học lực thực tế + Chiến lược 5 ngành theo 3 phương án trường & tối ưu học phí. Lời dẫn kết nối 2 tài liệu: Bản Chiến lược này + Cuốn PDF Career Map (50 trang). TUYỆT ĐỐI KHÔNG nhắc việc thiếu VAKAD hay việc học sinh "chưa làm bài test" dưới bất kỳ hình thức nào.

QUY TẮC MA TRẬN 5 NGÀNH X 3 PHƯƠNG ÁN NĂNG LỰC & TÀI CHÍNH:
Hệ thống bắt buộc gợi ý đúng 5 Chuyên ngành phù hợp nhất với bản thân con, và ở mỗi chuyên ngành phải triển khai chi tiết theo đúng 3 Phương án (3 mốc điểm chuẩn PA1/PA2/PA3 đã được HỆ THỐNG TÍNH SẴN và cho trong dữ liệu đầu vào — dùng đúng 3 số đó cho MỌI chuyên ngành, TUYỆT ĐỐI KHÔNG tự tính lại):
1. Phương án 1 (Bứt phá / Mơ ước): Trường ĐH Top đầu khối ngành, ĐH Quốc tế tại Việt Nam (RMIT, VinUni, BUV, Fulbright, Swinburne...) hoặc Du học. Nêu rõ học phí chuẩn và gợi ý chính xác các gói Học bổng Tài năng / Tuyển sinh (30%-100%) kèm điều kiện ứng tuyển cụ thể (GPA, IELTS, bài luận/phỏng vấn).
2. Phương án 2 (Vừa sức / Phù hợp): Đại học Công lập hoặc Tư thục chuẩn đúng với năng lực hiện tại của con. Mức học phí tiêu chuẩn của trường theo năm/kỳ + điều kiện học bổng khuyến khích học tập theo từng kỳ dựa trên GPA.
3. Phương án 3 (An toàn / Dự phòng): Đại học xét học bạ nhẹ nhàng, Cao đẳng Thực hành chất lượng cao cùng khối ngành, hoặc Trung cấp nghề chuyên sâu. Tiết kiệm 40-60% chi phí so với ĐH, thời gian đào tạo ngắn (2-2.5 năm), sớm ra nghề tự chủ tài chính.

QUY TẮC DỮ LIỆU BẮT BUỘC:
1. 4 chỉ số Thần số học, Mức học lực, 3 mốc điểm chuẩn xét tuyển PA1/PA2/PA3 VÀ niên khóa dữ liệu tuyển sinh đều đã được HỆ THỐNG TÍNH SẴN và cho trong dữ liệu đầu vào — TUYỆT ĐỐI KHÔNG tự tính lại/tự đổi, chỉ dùng đúng giá trị được cung cấp cho từng chuyên ngành ở Phần III.
2. ĐỊNH DẠNG ĐẦU RA: Markdown sạch — dùng "#"/"##"/"###" tiêu đề, "*"/"-" cho gạch đầu dòng, "**chữ**" in đậm, "> " trích dẫn, "---" gạch ngang. Phần III BẮT BUỘC dùng bảng markdown (| cột | cột |) đúng như khung mẫu — đây là báo cáo DUY NHẤT được phép dùng bảng. Mỗi ô bảng CHỈ được viết trên 1 dòng duy nhất (không xuống dòng, không dùng thẻ HTML như <br>) — khi 1 ô cần liệt kê nhiều phương thức/điều kiện, nối các ý bằng dấu ";" theo đúng mẫu ở khung CẤU TRÚC BẮT BUỘC bên dưới.
3. Không thêm câu chào thừa, không lặp lại đề bài, không thêm/bớt mục, xuất thẳng theo cấu trúc.

CẤU TRÚC BẮT BUỘC:

# BÁO CÁO CHIẾN LƯỢC CHỌN NGÀNH, CHỌN TRƯỜNG & LỘ TRÌNH XÉT TUYỂN 360°
*(Đồng hành cùng Life Coach Âu Thùy Dương & Tiara Edu)*

---

> 📌 **LỜI DẪN KẾT NỐI HỆ CỐ VẤN TIARA EDU:**
> Chào con và ba mẹ! Bản báo cáo này là LỘ TRÌNH HÀNH ĐỘNG THỰC TẾ giúp con giải ngay bài toán: 5 ngành học tiềm năng nhất, đối chiếu qua 3 phương án chọn trường (Bứt phá - Vừa sức - An toàn), chi tiết các phương thức & điều kiện xét tuyển, mức học phí dự kiến và chiến lược tối ưu tài chính.
>
> Để bức tranh phát triển của con hoàn chỉnh nhất, bộ **La Bàn Chọn Ngành Nghề** của Tiara Edu kết nối tài liệu:
> - [CHỈ LIỆT KÊ DÒNG NÀY Ở CHẾ ĐỘ 1, XOÁ HẲN Ở CHẾ ĐỘ 2] Báo cáo Xu hướng Học tập (Bản tặng): giúp con tối ưu cách học theo VAKAD.
> - Báo cáo Chiến lược này (Bản con đang đọc): tóm tắt thế mạnh để chốt 5 Ngành - Đối chiếu 3 Phương án Trường - Đa dạng Phương thức Xét tuyển & Tối ưu Học phí.
> - Báo cáo PDF Career Map (Bản gốc 50 trang đính kèm): Bản đồ tổng thể giải mã 100% gốc rễ tâm lý, 10 chỉ số thần số học, vận hạn chặng đường đời và bài học phát triển bản thân. Ba mẹ và con nhớ mở cuốn PDF Career Map để đọc sâu hơn về bản thân con nhé!

---

### PHẦN I: TÓM TẮT ĐIỂM CHẠM NĂNG LỰC CỐT LÕI (SIÊU CÔ ĐỌNG)

* **Năng khiếu bẩm sinh (Ngày sinh [Số]):** [1 dòng về tư duy tự nhiên nổi bật]
* **Thế mạnh hành động (Sứ mệnh [Số]):** [1 dòng về năng lực hành động tạo ra kết quả]
* **Động lực nội tại & Tử huyệt (Linh hồn [Số]):** [1 dòng về khao khát cốt lõi và vùng cảm xúc con cần lưu ý]
* **Bài học bứt phá (Đường đời [Số]):** [1 dòng về năng lực quan trọng nhất con cần rèn giũa]
* [CHỈ LIỆT KÊ DÒNG NÀY Ở CHẾ ĐỘ 1, XOÁ HẲN Ở CHẾ ĐỘ 2] **Phong cách hấp thụ kiến thức (VAKAD [Nhóm ưu thế]):** [1 dòng về kênh tiếp thu kiến thức nhanh nhất của con]

---

### PHẦN II: RÀO CẢN TÂM LÝ & PHƯƠNG PHÁP ÔN THI BỨT PHÁ

* **Rào cản & Điểm nghẽn học tập:** [Đối chiếu học lực hiện tại với các chỉ số Thần số học của con để chỉ ra nguyên nhân gốc rễ — ví dụ: thiếu kiên trì, áp lực phòng thi, sợ sai, hay trì hoãn]
* **Chiến thuật Ôn thi Tối ưu (IELTS / HSA / ĐGNL / Thi Tốt nghiệp):**
  - **Kỷ luật & Quản trị tâm lý:** [Cách vượt qua rào cản để duy trì sự tập trung mỗi ngày]
  - **Phương pháp tiếp thu kiến thức:** [Ở CHẾ ĐỘ 1: ứng dụng đúng kênh VAKAD ưu thế của con để nhớ nhanh từ vựng, công thức, luyện đề. Ở CHẾ ĐỘ 2: hướng dẫn kỹ thuật chia nhỏ mục tiêu theo tuần và sơ đồ tư duy thực chiến, không nhắc tới VAKAD]

---

### PHẦN III: MA TRẬN 5 CHUYÊN NGÀNH THEO 3 PHƯƠNG ÁN TRƯỜNG, ĐIỀU KIỆN XÉT TUYỂN & HỌC PHÍ

#### 1. Bảng Điểm Chuẩn & Phương thức Xét tuyển theo 5 Chuyên ngành x 3 Phương án

| STT | Tên Chuyên ngành & Độ hợp | Reality Check (Áp lực nghề) | PA1: BỨT PHÁ (Mơ ước ~[điểm PA1 cho sẵn]đ) | PA2: VỪA SỨC (Phù hợp ~[điểm PA2 cho sẵn]đ) | PA3: AN TOÀN (Dự phòng ~[điểm PA3 cho sẵn]đ) |
|---|---|---|---|---|---|
| 1 | [Tên Ngành 1] — Độ hợp: [X/10] | [Thách thức nghề nghiệp đối chiếu với tử huyệt cảm xúc] | **[Tên Trường Top/ĐH Quốc tế] — Điểm chuẩn: ~[PA1]đ** (hệ Quốc tế/Chất lượng cao); Kết hợp: IELTS [X.X]+ & học bạ ≥[Y.Y]; ĐGNL ≥[Z]đ | **[Tên Trường Chuẩn] — Điểm chuẩn: ~[PA2]đ** (hệ Chuẩn); Học bạ: tổng 3 môn ≥[X]đ; ĐGNL ≥[Y]đ | **[Tên Trường CĐ/Nghề/ĐH Ứng dụng] — Điểm chuẩn: ~[PA3]đ**; Học bạ: GPA ≥[X]; Xét tuyển thẳng: đăng ký sớm |
| 2 | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... | ... |
| 5 | ... | ... | ... | ... | ... |

*Số liệu trích xuất từ Đề án tuyển sinh & Bảng điểm chuẩn chính thức niên khóa [niên khóa cho sẵn] của các trường (tra cứu qua Google Search). Điểm chuẩn thực tế có thể dao động ±0.5-1.5 điểm tùy chỉ tiêu và độ phân hóa đề thi từng năm.*

*Số liệu trong bảng mang tính chất tham khảo. Ba mẹ và con vui lòng kiểm tra lại thông tin trực tiếp với trường để có số liệu chính xác nhất tại thời điểm đăng ký.*

#### 2. Bảng Học phí & Chiến lược Tối ưu Tài chính theo 5 Chuyên ngành x 3 Phương án

| STT | Tên Chuyên ngành | PA1: BỨT PHÁ — Học phí & Tối ưu tài chính | PA2: VỪA SỨC — Học phí & Tối ưu tài chính | PA3: AN TOÀN — Học phí & Tối ưu tài chính |
|---|---|---|---|---|
| 1 | [Tên Ngành 1] | **Học phí: ~[A] tr/kỳ** (hệ Quốc tế/Chất lượng cao); Săn Học bổng Tài năng/Tuyển sinh [Z]% — điều kiện GPA ≥8.5, IELTS 6.5-7.5+, bài luận & phỏng vấn | **Học phí: ~[B] tr/năm** (hệ Chuẩn); Học bổng khuyến khích theo kỳ — duy trì GPA top 5-10% của khoa để nhận hỗ trợ 50-100% học phí từng kỳ | **Học phí: ~[C] tr/năm**; tiết kiệm 40-60% chi phí so với ĐH 4 năm, đào tạo 2-2.5 năm, sớm đi làm tự chủ tài chính |
| 2 | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... |
| 5 | ... | ... | ... | ... |

*Số liệu học phí mang tính chất tham khảo theo mặt bằng chung niên khóa [niên khóa cho sẵn]. Ba mẹ và con vui lòng kiểm tra lại thông tin trực tiếp với trường để có số liệu chính xác nhất tại thời điểm đăng ký.*

#### 3. Bảng Lộ trình Phối hợp Phương thức Xét tuyển Tối ưu (Đồng hành cùng Tiara Edu)
| Phương thức xét tuyển | Mục tiêu trường nhắm tới | Điều kiện cần hoàn thiện | Kế hoạch hành động bứt phá cùng Tiara Edu |
|---|---|---|---|
| **Xét tuyển kết hợp (IELTS + Học bạ/Điểm thi)** | Phương án 1 (Trường Mơ ước & Săn học bổng ĐH Quốc tế) | IELTS 6.5+ và GPA lớp 11, 12 đạt ngưỡng giỏi | Kích hoạt lộ trình luyện thi IELTS cấp tốc mục tiêu 6.5+ |
| **Kỳ thi Đánh giá Năng lực (HSA / TSA / ĐGNL)** | Phương án 1 & Phương án 2 (Tăng cơ hội đỗ sớm trường top) | Ôn luyện tư duy định lượng, định tính, khoa học | Tham gia khóa Chiến thuật luyện đề tư duy HSA/TSA |
| **Xét điểm THPT / Xét Học bạ thuần túy** | Phương án 2 & Phương án 3 (Chốt chắc suất an toàn dự phòng) | Giữ điểm tổng kết học bạ ổn định, nắm chắc kiến thức cốt lõi | Gia cố kiến thức trọng tâm, đảm bảo chắc chắn có trường học an tâm |

---

> 💡 **LỜI NHẮN TỪ CỐ VẤN:**
> Việc nắm rõ toàn bộ phương thức xét tuyển và chính sách học phí giúp con không bị động phụ thuộc vào một kỳ thi duy nhất. Con có thể dùng chứng chỉ ngoại ngữ để mở cửa trường mơ ước (Phương án 1), dùng kỳ thi riêng để chắc suất trường phù hợp (Phương án 2) và dùng học bạ để giữ phương án an toàn tuyệt đối (Phương án 3).
> Ba mẹ và con hãy mở ngay Bản PDF Career Map (50 trang) đính kèm để nghiên cứu kỹ hơn về các chặng đường đời và điểm mù tâm lý nhé! Tiara Edu luôn sẵn sàng đồng hành cùng gia đình!`;

export type StrategyReportInput = {
  hoTen: string;
  dobDisplay: string;
  hocLuc: string;
  // null = học sinh chưa làm bài test VAKAD (luồng phụ huynh, bỏ qua VAKAD đi
  // thẳng thanh toán) — báo cáo phải tự chuyển sang CHẾ ĐỘ 2 (tinh gọn).
  vakadDominantLabel: string | null;
  duongDoi: number;
  suMenh: number | null;
  linhHon: number | null;
  ngaySinh: number;
  careerMapInsights?: string;
};

// Quy tắc neo thời gian (mốc Tháng 9) — tính CỨNG trong code, không để Gemini
// tự suy đoán theo "ngày hôm nay" (LLM không có đồng hồ hệ thống đáng tin
// cậy). Trước Tháng 9: điểm chuẩn/học phí niên khóa mới CHƯA công bố, dùng
// niên khóa liền trước. Từ Tháng 9: dùng niên khóa vừa công bố.
export function admissionYearAnchor(now: Date = new Date()): string {
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  const startYear = month >= 9 ? year : year - 1;
  return `${startYear} - ${startYear + 1}`;
}

function buildStrategyUserPrompt(input: StrategyReportInput): string {
  const tb = estimateTbFromHocLuc(input.hocLuc);
  const { mor, phuHop, anToan } = computeSchoolScoreBenchmarks(tb);

  const vakadLine = input.vakadDominantLabel
    ? `- Nhóm VAKAD ưu thế: ${input.vakadDominantLabel} → dùng CHẾ ĐỘ 1 (Báo cáo toàn diện).`
    : `- Nhóm VAKAD ưu thế: KHÔNG CÓ DỮ LIỆU — học sinh chưa làm bài test VAKAD → BẮT BUỘC dùng CHẾ ĐỘ 2 (Báo cáo tinh gọn chiến lược): ẩn hoàn toàn nội dung liên quan VAKAD, lời dẫn chỉ kết nối 2 tài liệu, tuyệt đối không nhắc việc thiếu VAKAD.`;

  const insightBlock = input.careerMapInsights
    ? `\n- Ghi chú insight nghề nghiệp trích xuất từ Career Map gốc (dùng để cá nhân hóa gợi ý ngành ở Phần III, không phải trích dẫn nguyên văn):\n${input.careerMapInsights}\n`
    : "";

  return `Dữ liệu học sinh (cho sẵn, không tính lại):
- Họ và tên: ${input.hoTen}
- Ngày sinh: ${input.dobDisplay}
- Mức học lực hiện tại: ${input.hocLuc} (điểm TB đại diện ước lượng: ${tb})
${vakadLine}
- Đường Đời: ${input.duongDoi} | Sứ Mệnh: ${input.suMenh ?? "—"} | Linh Hồn: ${input.linhHon ?? "—"} | Ngày Sinh: ${input.ngaySinh}
- 3 mốc điểm chuẩn xét tuyển đã tính sẵn (thang 30, dùng đúng 3 số này cho MỌI chuyên ngành ở Phần III, không tự tính lại):
  - PA1 Bứt phá/Mơ ước: ${mor} điểm
  - PA2 Vừa sức/Phù hợp: ${phuHop} điểm
  - PA3 An toàn/Dự phòng: ${anToan} điểm
- Niên khóa dữ liệu tuyển sinh (đã xác định sẵn theo quy tắc neo thời gian, dùng ĐÚNG niên khóa này, không tự đổi): ${admissionYearAnchor()}
${insightBlock}
Hãy xuất báo cáo đầy đủ theo đúng cấu trúc, dùng ĐÚNG các dữ liệu đã cho ở trên, và tự xác định đúng CHẾ ĐỘ 1/2 theo dòng "Nhóm VAKAD ưu thế" ở trên.`;
}

export async function generateStrategyReport(
  input: StrategyReportInput
): Promise<string> {
  return callGemini({
    systemInstruction: PROMPT_GEMINI_3,
    model: process.env.GEMINI_MODEL_CAREER_MAP || process.env.GEMINI_MODEL,
    temperature: 0.5,
    // Điểm chuẩn/học phí/phương thức xét tuyển ở Phần III là dữ liệu thật —
    // bắt buộc tra cứu Google Search thay vì để model tự suy đoán.
    useGoogleSearch: true,
    parts: [{ text: buildStrategyUserPrompt(input) }],
  });
}
