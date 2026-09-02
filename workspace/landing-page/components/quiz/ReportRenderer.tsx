// Renderer markdown tối giản, chỉ hỗ trợ đúng tập cú pháp mà prompt Gemini
// được yêu cầu xuất ra (#, ##, gạch đầu dòng, **bold**, > trích dẫn, ---, và
// placeholder [[UNLOCK_CTA]] thay bằng nút mua hàng thật). Không dùng lib
// markdown ngoài / không dangerouslySetInnerHTML — an toàn với nội dung AI sinh ra.

import type { ReactNode } from "react";
import { UnlockButton } from "./UnlockButton";

const UNLOCK_CTA_MARKER = "[[UNLOCK_CTA]]";

function UnlockCtaBox({ leadId }: { leadId: string }) {
  return (
    <div className="rounded-2xl bg-primary text-white p-6 sm:p-8 text-center my-6">
      <p className="text-xs font-medium tracking-widest uppercase text-white/70 mb-2">
        Con vừa thấy 1 trong 3 phần
      </p>
      <h3 className="font-heading text-xl sm:text-2xl font-semibold mb-3">
        Mở khoá trọn bộ Career Map + Chiến lược đỗ đại học mơ ước
      </h3>
      <p className="text-sm text-white/85 mb-6 leading-relaxed">
        Career Map cá nhân hóa (599.000đ) và Chiến lược đỗ đại học mơ ước —
        định hướng ngành, phương thức xét tuyển phù hợp nhất (499.000đ) —
        trọn bộ chỉ 299.000đ thay vì 1.597.000đ.
      </p>
      <UnlockButton leadId={leadId} />
    </div>
  );
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

type ListNode = { text: string; children: ListNode[] };

function renderList(
  nodes: ListNode[],
  depth: number,
  keyPrefix: string,
  ordered: boolean
): ReactNode {
  const Tag = depth === 0 && ordered ? "ol" : "ul";
  const className =
    depth === 0
      ? ordered
        ? "list-decimal pl-5 space-y-1.5 mb-4"
        : "list-disc pl-5 space-y-1.5 mb-4"
      : "list-[circle] pl-5 space-y-1 mt-1";
  return (
    <Tag key={keyPrefix} className={className}>
      {nodes.map((node, i) => (
        <li key={i} className="text-ink leading-relaxed">
          {renderInline(node.text)}
          {node.children.length > 0 &&
            renderList(node.children, depth + 1, `${keyPrefix}-${i}`, false)}
        </li>
      ))}
    </Tag>
  );
}

export function ReportRenderer({
  markdown,
  leadId,
}: {
  markdown: string;
  leadId?: string;
}) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let listRoot: ListNode[] = [];
  let listStack: ListNode[][] = [listRoot];
  let listOrdered = false;
  let key = 0;
  let ctaRendered = false;

  function flushList() {
    if (listRoot.length === 0) return;
    blocks.push(renderList(listRoot, 0, `ul-${key++}`, listOrdered));
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

  for (const rawLine of lines) {
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line === UNLOCK_CTA_MARKER) {
      flushList();
      if (leadId) {
        blocks.push(<UnlockCtaBox key={key++} leadId={leadId} />);
        ctaRendered = true;
      }
    } else if (line === "---") {
      flushList();
      blocks.push(<hr key={key++} className="border-border-soft my-6" />);
    } else if (line.startsWith("> ")) {
      flushList();
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-accent pl-4 italic text-ink/80 my-4"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2
          key={key++}
          className="font-heading text-lg sm:text-xl font-semibold uppercase tracking-wide text-primary-dark bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-l-4 border-accent rounded-r-xl px-4 py-2 mt-8 mb-3"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h1
          key={key++}
          className="font-heading text-2xl sm:text-3xl font-semibold text-ink mb-4 pb-2 border-b-2 border-accent/40"
        >
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const depth = indent >= 2 ? 1 : 0;
      pushListItem(depth, line.slice(2));
    } else if (/^\d+\.\s+/.test(line)) {
      listOrdered = true;
      pushListItem(0, line.replace(/^\d+\.\s+/, ""));
    } else {
      flushList();
      blocks.push(
        <p key={key++} className="text-ink leading-relaxed mb-3">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();

  // Báo cáo tạo trước khi có mục 5 (không chứa marker) — vẫn hiện nút mua ở
  // cuối để không mất CTA khi khách mở lại link kết quả cũ.
  if (!ctaRendered && leadId) {
    blocks.push(<UnlockCtaBox key={key++} leadId={leadId} />);
  }

  return <div>{blocks}</div>;
}
