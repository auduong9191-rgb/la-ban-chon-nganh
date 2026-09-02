// Bộ 10 câu hỏi trắc nghiệm VAKAD (dành cho tuổi 15+).
// Trích xuất + đối chiếu 100% khớp bảng đáp án gốc từ "test vakad 15+.docx".
// Mỗi câu có đúng 4 ý, người làm phải xếp hạng ưu tiên 4 (giống mình nhất) -> 1 (ít giống nhất).

export type VakadGroup = "V" | "A" | "K" | "AD";

export const VAKAD_GROUP_LABEL: Record<VakadGroup, string> = {
  V: "Thị giác (Visual)",
  A: "Thính giác (Auditory)",
  K: "Vận động / Xúc giác (Kinesthetic)",
  AD: "Tư duy logic nội tâm (Auditory-Digital)",
};

export type VakadOption = {
  text: string;
  group: VakadGroup;
};

export type VakadQuestion = {
  id: number;
  prompt: string;
  options: VakadOption[]; // luôn đúng 4 phần tử
};

export const VAKAD_QUESTIONS: VakadQuestion[] = [
  {
    id: 1,
    prompt:
      "Khi đứng trước một quyết định quan trọng (như chọn ngành/trường, mua đồ giá trị, nhận lời làm việc nhóm), tôi thường dựa vào:",
    options: [
      { text: "Cảm giác trong lòng hoặc linh tính mách bảo \"đúng/sai\".", group: "K" },
      { text: "Lời khuyên nghe thuyết phục và hợp tai nhất từ người khác.", group: "A" },
      { text: "Những gì tôi nhìn thấy tận mắt hoặc hình dung rõ ràng trong đầu.", group: "V" },
      { text: "Việc phân tích, so sánh kỹ lưỡng ưu - nhược điểm của từng lựa chọn.", group: "AD" },
    ],
  },
  {
    id: 2,
    prompt: "Trong một cuộc tranh luận sôi nổi với bạn bè, tôi dễ bị thuyết phục nhất bởi:",
    options: [
      { text: "Tông giọng, thái độ và cách nhả chữ của đối phương.", group: "A" },
      { text: "Việc tôi có nhìn thấy hay bắt kịp góc nhìn/bức tranh mà họ mô tả không.", group: "V" },
      { text: "Tính logic, lập luận chặt chẽ và bằng chứng rõ ràng của họ.", group: "AD" },
      { text: "Cảm xúc, sự chân thành hoặc năng lượng mà họ thể hiện.", group: "K" },
    ],
  },
  {
    id: 3,
    prompt: "Tôi cảm thấy dễ dàng và tự tin nhất khi thể hiện bản thân qua:",
    options: [
      { text: "Gu ăn mặc, phong cách thời trang và diện mạo bên ngoài.", group: "V" },
      { text: "Cảm xúc thật, năng lượng và sự kết nối trực tiếp với người khác.", group: "K" },
      { text: "Cách chọn lọc từ ngữ chính xác, suy nghĩ chu đáo và diễn đạt gãy gọn.", group: "AD" },
      { text: "Tông giọng, ngữ điệu nói chuyện hoặc khả năng giao tiếp bằng lời.", group: "A" },
    ],
  },
  {
    id: 4,
    prompt: "Việc nào sau đây tôi làm cảm thấy dễ dàng và nhanh nhất?",
    options: [
      { text: "Nghe và điều chỉnh âm thanh, giai điệu một bài hát sao cho vừa tai nhất.", group: "A" },
      { text: "Tóm tắt và lọc ra những thông tin cốt lõi, giá trị nhất từ một bài viết/bài giảng.", group: "AD" },
      { text: "Chọn được góc ngồi hay một vị trí mang lại cảm giác thoải mái, dễ chịu nhất.", group: "K" },
      { text: "Nhận ra cách phối màu, bố cục sao cho hợp mắt và có tính thẩm mỹ nhất.", group: "V" },
    ],
  },
  {
    id: 5,
    prompt: "Trong cuộc sống thường ngày, tôi nhận thấy mình:",
    options: [
      { text: "Rất nhạy cảm với tiếng ồn, âm thanh nền hoặc tạp âm xung quanh.", group: "A" },
      { text: "Luôn tò mò, thích đào sâu và tiếp thu rất nhanh các kiến thức, xu hướng mới.", group: "AD" },
      { text: "Nhạy cảm với chất liệu trang phục, thích những gì êm ái, thoải mái khi chạm vào.", group: "K" },
      { text: "Phản ứng nhanh với màu sắc, không gian bài trí hoặc sự thay đổi chi tiết nhỏ quanh mình.", group: "V" },
    ],
  },
  {
    id: 6,
    prompt: "Khi tham gia thảo luận nhóm, tôi thường bị tác động mạnh nhất bởi:",
    options: [
      { text: "Những lý lẽ có đầu có đuôi, lập luận sắc bén của các thành viên.", group: "AD" },
      { text: "Giọng điệu (trầm bổng, nhấn nhá, to nhỏ) của người phát biểu.", group: "A" },
      { text: "Ngôn ngữ cơ thể, thần thái của người nói hoặc hình ảnh tôi tự dựng họa lại trong đầu.", group: "V" },
      { text: "\"Bầu không khí\" chung hoặc thái độ, cảm xúc tỏa ra từ nhóm.", group: "K" },
    ],
  },
  {
    id: 7,
    prompt:
      "Khi đi mua sắm (quần áo, phụ kiện, đồ công nghệ), quyết định chốt đơn của tôi phụ thuộc vào:",
    options: [
      { text: "Món đồ đó trông đẹp mắt, thiết kế chuẩn gu và bắt trend.", group: "V" },
      { text: "Đánh giá từ reviewer, lời tư vấn của bán hàng hoặc ý kiến của bạn đi cùng.", group: "A" },
      { text: "Tính ứng dụng thực tế, công năng và xem giá cả có hợp lý không.", group: "AD" },
      { text: "Cảm giác khi trải nghiệm thực tế (mặc thử vừa vặn, cầm chắc tay, êm ái).", group: "K" },
    ],
  },
  {
    id: 8,
    prompt: "Khi đi xem một buổi hòa nhạc, festival âm nhạc hay concert, tôi thường:",
    options: [
      { text: "Đắm chìm vào giai điệu, chất giọng live, các nốt trầm bổng của ca sĩ/ban nhạc.", group: "A" },
      { text: "Quan sát phần dàn dựng sân khấu, hiệu ứng ánh sáng, trang phục và vũ đạo.", group: "V" },
      { text: "Cuốn theo nhịp điệu, muốn nhún nhảy, quẩy hết mình theo không khí đám đông.", group: "K" },
      { text: "Để ý nhiều đến thông điệp, ý nghĩa lời bài hát hoặc cốt chuyện của đêm diễn.", group: "AD" },
    ],
  },
  {
    id: 9,
    prompt: "Tôi tiếp thu một bài giảng, hội thảo hay buổi chia sẻ hiệu quả nhất khi:",
    options: [
      { text: "Được tham gia thực hành, tương tác trực tiếp hoặc làm bài tập tình huống.", group: "K" },
      { text: "Nội dung có slide bắt mắt, nhiều sơ đồ, hình ảnh minh họa hoặc video trực quan.", group: "V" },
      { text: "Bài nói có số liệu thực tế, cấu trúc mạch lạc và phân tích bản chất vấn đề.", group: "AD" },
      { text: "Diễn giả có giọng nói lôi cuốn, biết nhấn giọng và sử dụng ngôn từ linh hoạt.", group: "A" },
    ],
  },
  {
    id: 10,
    prompt: "Điểm mạnh tự nhiên nổi bật nhất của tôi là:",
    options: [
      { text: "Khả năng quan sát chi tiết và hình dung rõ ràng mọi thứ trong đầu.", group: "V" },
      { text: "Khả năng tư duy phản biện, phân tích dữ liệu và sắp xếp thông tin logic.", group: "AD" },
      { text: "Khả năng lắng nghe, thấu hiểu qua lời nói và truyền đạt lại bằng ngôn từ.", group: "A" },
      { text: "Khả năng cảm nhận tinh tế, nhạy bén với môi trường và tin vào trực giác cá nhân.", group: "K" },
    ],
  },
];

/** Điểm xếp hạng người dùng gán cho từng câu: index option (0-3) -> rank (4=giống nhất...1=ít giống nhất) */
export type VakadAnswer = Record<number, number>; // optionIndex -> rank(1-4)
export type VakadAnswers = Record<number, VakadAnswer>; // questionId -> VakadAnswer

export function isAnswerComplete(answer: VakadAnswer | undefined): boolean {
  if (!answer) return false;
  const ranks = Object.values(answer);
  if (ranks.length !== 4) return false;
  const sorted = [...ranks].sort((a, b) => a - b);
  return sorted.every((r, i) => r === i + 1);
}

export function isQuizComplete(answers: VakadAnswers): boolean {
  return VAKAD_QUESTIONS.every((q) => isAnswerComplete(answers[q.id]));
}

export type VakadScoreBreakdown = Record<VakadGroup, number>;

/** Tổng điểm mỗi nhóm V/A/K/AD = tổng rank người dùng gán cho các ý thuộc nhóm đó qua 10 câu. */
export function scoreVakad(answers: VakadAnswers): {
  scores: VakadScoreBreakdown;
  dominant: VakadGroup;
} {
  const scores: VakadScoreBreakdown = { V: 0, A: 0, K: 0, AD: 0 };

  for (const question of VAKAD_QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;
    question.options.forEach((opt, idx) => {
      const rank = answer[idx] ?? 0;
      scores[opt.group] += rank;
    });
  }

  let dominant: VakadGroup = "V";
  (Object.keys(scores) as VakadGroup[]).forEach((g) => {
    if (scores[g] > scores[dominant]) dominant = g;
  });

  return { scores, dominant };
}
