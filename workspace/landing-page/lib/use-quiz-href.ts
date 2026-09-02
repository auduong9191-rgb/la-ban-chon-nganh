"use client";

import { useState, useEffect } from "react";

/* eslint-disable react-hooks/set-state-in-effect -- cập nhật href sau mount
   để tránh hydration mismatch (giá trị chỉ biết được ở client), không phải
   pattern data-fetch-trong-effect mà rule này nhắm tới. */

/**
 * Href tới /quiz, giữ nguyên mã CTV (?r=) nếu trang hiện tại đang có — cần
 * thiết vì link CTV nhóm 1 trỏ vào "/" (trang chủ, có phần giới thiệu chuyên
 * môn) chứ không phải thẳng /quiz, nên các nút CTA trên trang chủ phải mang
 * theo mã CTV khi dẫn qua /quiz, nếu không mã sẽ bị rơi mất. Tham số đặt tên
 * trung tính "r" (không phải "ctv") để không lộ đây là link giới thiệu.
 *
 * Render mặc định "/quiz" (khớp server) rồi mới cập nhật sau khi mount qua
 * effect — đọc thẳng window.location lúc render (như QuizApp.tsx đang làm
 * với ctvCode) sẽ gây hydration mismatch vì giá trị này render ra thuộc tính
 * href thật, không phải chỉ giữ trong state nội bộ như ctvCode.
 */
export function useQuizHref(): string {
  const [href, setHref] = useState("/quiz");
  useEffect(() => {
    const ctv = new URLSearchParams(window.location.search).get("r");
    if (ctv) {
      setHref(`/quiz?r=${encodeURIComponent(ctv)}`);
    }
  }, []);
  return href;
}
