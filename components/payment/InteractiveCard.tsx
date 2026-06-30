"use client";

import { useMemo } from "react";
import {
  FocusedCardField,
  formatCardNumber,
  formatExpiry,
  limitText,
  MAX_CARD_HOLDER_LENGTH,
} from "./paymentUtils";

type InteractiveCardProps = {
  pan: string;
  customerName: string;
  expMonth: string;
  expYear: string;
  cv2: string;
  focused: FocusedCardField;
};

export function InteractiveCard({
  pan,
  customerName,
  expMonth,
  expYear,
  cv2,
  focused,
}: InteractiveCardProps) {
  const flipped = focused === "cv2";
  const cardNumber = useMemo(() => formatCardNumber(pan), [pan]);
  const cardHolderName =
    limitText(customerName, MAX_CARD_HOLDER_LENGTH).trim() || "AD SOYAD";

  return (
    <div className="mx-auto w-full max-w-[25rem] [perspective:1200px]">
      <div
        className={`relative h-52 w-full transition-transform duration-500 sm:h-56 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[#10231d] p-5 text-white shadow-2xl shadow-[#10231d]/25 [backface-visibility:hidden] sm:p-6">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#c2853e]/40 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                  Lale EDT
                </p>
                <p className="mt-1 text-sm text-white/75">Güvenli Ödeme</p>
              </div>
              <div className="grid h-11 w-14 place-items-center rounded-xl bg-[#d7b36a] shadow-inner shadow-black/20">
                <div className="h-7 w-9 rounded-md border border-black/20 bg-gradient-to-br from-[#f4d58d] to-[#b9852f]" />
              </div>
            </div>

            <div
              className={`overflow-hidden rounded-2xl px-3 py-2 font-mono text-xl font-semibold tracking-[0.1em] transition sm:text-2xl sm:tracking-[0.1em] ${
                focused === "pan" ? "bg-white/12 ring-1 ring-white/25" : ""
              }`}
            >
              {cardNumber}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div
                className={`min-w-0 rounded-2xl px-3 py-2 transition ${
                  focused === "customerName"
                    ? "bg-white/12 ring-1 ring-white/25"
                    : ""
                }`}
              >
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Kart Sahibi
                </p>
                <p className="mt-1 truncate text-sm font-bold uppercase tracking-wide">
                  {cardHolderName}
                </p>
              </div>

              <div
                className={`rounded-2xl px-3 py-2 text-right transition ${
                  focused === "expiry" ? "bg-white/12 ring-1 ring-white/25" : ""
                }`}
              >
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Tarih
                </p>
                <p className="mt-1 font-mono text-sm font-bold">
                  {formatExpiry(expMonth, expYear)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[#10231d] py-7 text-white shadow-2xl shadow-[#10231d]/25 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="h-12 bg-black/70" />
          <div className="mt-8 px-6">
            <p className="mb-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Güvenlik Kodu
            </p>
            <div className="flex h-12 items-center justify-end rounded-xl bg-white px-4 font-mono text-lg font-bold tracking-[0.22em] text-[#10231d]">
              {cv2 || "•••"}
            </div>
          </div>
          <div className="mt-6 space-y-2 px-6">
            <div className="h-2 rounded-full bg-white/15" />
            <div className="h-2 w-2/3 rounded-full bg-white/10" />
            <div className="h-2 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
