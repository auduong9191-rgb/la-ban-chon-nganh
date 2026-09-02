import { PhoneIcon, MessengerIcon, ZaloIcon } from "./icons";

const HOTLINE_DISPLAY = "0948 645 419";
const HOTLINE_TEL = "0948645419";
const MESSENGER_URL = "https://m.me/au.duong";
const ZALO_URL = "https://zalo.me/84948645419";

export function FloatingContactBar() {
  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        title="Chat Zalo"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg transition-transform duration-200 hover:scale-110"
      >
        <ZaloIcon className="w-6 h-6" />
      </a>
      <a
        href={MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nhắn tin qua Messenger"
        title="Nhắn tin qua Messenger"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg transition-transform duration-200 hover:scale-110"
      >
        <MessengerIcon className="w-6 h-6" />
      </a>
      <a
        href={`tel:${HOTLINE_TEL}`}
        aria-label={`Gọi hotline ${HOTLINE_DISPLAY}`}
        title={`Gọi hotline ${HOTLINE_DISPLAY}`}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-pulse transition-transform duration-200 hover:scale-110 hover:animate-none"
      >
        <PhoneIcon className="w-6 h-6" />
      </a>
    </div>
  );
}
