// Convert đúng tập cú pháp markdown mà prompt Gemini được yêu cầu xuất ra
// (#, ##, gạch đầu dòng, **bold**, > trích dẫn, ---) sang HTML thuần cho PDF
// server-side. Cùng tập cú pháp với components/quiz/ReportRenderer.tsx (client,
// React) — file này là bản tương đương dùng string HTML thay vì ReactNode.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

const TABLE_SEPARATOR_RE = /^\|?[\s:|-]+\|?$/;

function splitTableRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => cell.trim());
}

// Gem 1 (báo cáo VAKAD, render PDF khi khách đã làm bài test) dùng số thứ tự
// "1. 2. 3." ở Mục 5 kèm gạch đầu dòng lồng cấp 2 bên dưới — cùng cú pháp mà
// ReportRenderer.tsx (client) đã hỗ trợ, thêm vào đây để bản PDF khớp bản web.
type ListNode = { text: string; children: ListNode[] };

function renderListHtml(nodes: ListNode[], ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const items = nodes
    .map((node) => {
      const childrenHtml =
        node.children.length > 0 ? renderListHtml(node.children, false) : "";
      return `<li>${renderInline(node.text)}${childrenHtml}</li>`;
    })
    .join("");
  return `<${tag}>${items}</${tag}>`;
}

// Prompt Gemini nào yêu cầu bảng (Gem 3 — Phần III) sẽ xuất đúng cú pháp GFM
// pipe-table (| ô | ô |, dòng ---|--- phân cách header). Đây là bảng markdown
// duy nhất được phép trong hệ thống — các prompt khác (Gem 1/Gem 2) đều cấm
// dùng bảng.
export function markdownToHtml(markdown: string): string {
  const rawLines = markdown.split("\n");
  const blocks: string[] = [];
  let listRoot: ListNode[] = [];
  let listStack: ListNode[][] = [listRoot];
  let listOrdered = false;

  function flushList() {
    if (listRoot.length === 0) return;
    blocks.push(renderListHtml(listRoot, listOrdered));
    listRoot = [];
    listStack = [listRoot];
    listOrdered = false;
  }

  function pushListItem(depth: number, text: string) {
    while (listStack.length > depth + 1) listStack.pop();
    while (listStack.length <= depth) listStack.push(listStack[listStack.length - 1]);
    const node: ListNode = { text, children: [] };
    listStack[depth].push(node);
    listStack[depth + 1] = node.children;
    listStack.length = depth + 2;
  }

  let i = 0;
  while (i < rawLines.length) {
    const indent = rawLines[i].length - rawLines[i].trimStart().length;
    const line = rawLines[i].trim();

    if (!line) {
      flushList();
      i++;
      continue;
    }

    const nextLine = rawLines[i + 1]?.trim();
    if (
      line.startsWith("|") &&
      nextLine !== undefined &&
      TABLE_SEPARATOR_RE.test(nextLine)
    ) {
      flushList();
      const headerCells = splitTableRow(line);
      const bodyRows: string[][] = [];
      let j = i + 2;
      while (j < rawLines.length && rawLines[j].trim().startsWith("|")) {
        bodyRows.push(splitTableRow(rawLines[j]));
        j++;
      }
      const thead = `<thead><tr>${headerCells
        .map((c) => `<th>${renderInline(c)}</th>`)
        .join("")}</tr></thead>`;
      const tbody = `<tbody>${bodyRows
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`
        )
        .join("")}</tbody>`;
      blocks.push(`<table>${thead}${tbody}</table>`);
      i = j;
      continue;
    }

    if (line === "---") {
      flushList();
      blocks.push("<hr />");
    } else if (line.startsWith(">")) {
      // "> " (dòng có nội dung) hoặc ">" trơ trọi (ngắt đoạn trong blockquote
      // nhiều dòng, không có ký tự nào theo sau) — cả hai đều là blockquote.
      flushList();
      const content = line.startsWith("> ") ? line.slice(2) : line.slice(1);
      blocks.push(`<blockquote>${renderInline(content)}</blockquote>`);
    } else if (line.startsWith("#### ")) {
      flushList();
      blocks.push(`<h4>${renderInline(line.slice(5))}</h4>`);
    } else if (line.startsWith("### ")) {
      flushList();
      blocks.push(`<h3>${renderInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(`<h2>${renderInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(`<h1>${renderInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const depth = indent >= 2 ? 1 : 0;
      pushListItem(depth, line.slice(2));
    } else if (/^\d+\.\s+/.test(line)) {
      listOrdered = true;
      pushListItem(0, line.replace(/^\d+\.\s+/, ""));
    } else {
      flushList();
      blocks.push(`<p>${renderInline(line)}</p>`);
    }
    i++;
  }
  flushList();

  return blocks.join("\n");
}
