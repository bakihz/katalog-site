"use client";

import { useMemo, useState } from "react";

type PaymentMode = "public" | "agent";
type FocusedField = "pan" | "customerName" | "expiry" | "cv2" | null;

const MAX_CARD_DIGITS = 16;
const MAX_CARD_HOLDER_LENGTH = 32;
const MAX_CVV_DIGITS = 3;
const MAX_EXPIRY_YEAR_OFFSET = 12;
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

function onlyDigits(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

function limitText(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

function formatCardNumber(value: string) {
  const safeValue = onlyDigits(value, MAX_CARD_DIGITS);
  const maskedValue = Array.from({ length: MAX_CARD_DIGITS }, (_, index) => {
    const digit = safeValue[index];

    if (!digit) {
      return "•";
    }

    if (index < 4 || index >= MAX_CARD_DIGITS - 4) {
      return digit;
    }

    return "*";
  }).join("");

  return maskedValue.match(/.{1,4}/g)?.join(" ") ?? "";
}

function formatCardInput(value: string) {
  return onlyDigits(value, MAX_CARD_DIGITS)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(month: string, year: string) {
  const safeMonth = month || "AA";
  const safeYear = year || "YY";
  return `${safeMonth.padEnd(2, "A")}/${safeYear.padEnd(2, "Y")}`;
}

function normalizeExpiryYear(year: string) {
  const twoDigitYear = onlyDigits(year, 2);
  return twoDigitYear.length === 2 ? `20${twoDigitYear}` : twoDigitYear;
}

function isValidExpiryYear(year: string, currentYear: number) {
  const fullYear = Number(normalizeExpiryYear(year));
  return (
    fullYear >= currentYear && fullYear <= currentYear + MAX_EXPIRY_YEAR_OFFSET
  );
}

function getExpiryYearOptions(currentYear: number) {
  return Array.from({ length: MAX_EXPIRY_YEAR_OFFSET + 1 }, (_, index) =>
    String(currentYear + index).slice(-2),
  );
}

function InteractiveCard({
  pan,
  customerName,
  expMonth,
  expYear,
  cv2,
  focused,
}: {
  pan: string;
  customerName: string;
  expMonth: string;
  expYear: string;
  cv2: string;
  focused: FocusedField;
}) {
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

export function PaymentForm({ mode }: { mode: PaymentMode }) {
  const currentYear = new Date().getFullYear();
  const expiryYearOptions = useMemo(
    () => getExpiryYearOptions(currentYear),
    [currentYear],
  );
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    description: "",
    amount: "",
    pan: "",
    cv2: "",
    expMonth: "",
    expYear: "",
  });

  const isAgent = mode === "agent";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Lütfen geçerli bir ödeme tutarı girin.");
      return;
    }

    if (!form.customerName.trim()) {
      setError("Lütfen kart üzerindeki ad soyad bilgisini girin.");
      return;
    }

    if (form.pan.length !== MAX_CARD_DIGITS) {
      setError("Kart numarası 16 hane olmalıdır.");
      return;
    }

    if (!MONTH_OPTIONS.includes(form.expMonth)) {
      setError("Son kullanma ayı 01 ile 12 arasında olmalıdır.");
      return;
    }

    if (!isValidExpiryYear(form.expYear, currentYear)) {
      setError(
        `Son kullanma yılı ${currentYear} ile ${
          currentYear + MAX_EXPIRY_YEAR_OFFSET
        } arasında olmalıdır.`,
      );
      return;
    }

    if (form.cv2.length !== MAX_CVV_DIGITS) {
      setError("CVV 3 hane olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          agentFlow: isAgent,
          expYear: normalizeExpiryYear(form.expYear),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Ödeme başlatılamadı.");
        setLoading(false);
        return;
      }

      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = data.gatewayUrl;

      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        paymentForm.appendChild(input);
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch {
      setError("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
    >
      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-xl shadow-[#10231d]/10 md:p-8 lg:sticky lg:top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]">
          {isAgent ? "Ödeme Al" : "Sanal POS"}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          {isAgent ? "Müşteri bilgileri" : "Ödeme bilgileri"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#68746e]">
          {isAgent
            ? "Tahsilat kaydı temsilci hesabınızla ilişkilendirilir. Müşteri ve açıklama bilgilerini net girmeniz işlem takibini kolaylaştırır."
            : "Firma, açıklama ve tutar bilgilerini girerek güvenli ödeme adımına geçebilirsiniz."}
        </p>

        <div className="mt-8 grid gap-4">
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Firma / Cari *
            </span>
            <input
              type="text"
              required
              placeholder="Firma veya cari adı"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Açıklama / Fatura No
            </span>
            <textarea
              placeholder="Ödeme açıklaması"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-28 w-full resize-none rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Tutar (TL) *
            </span>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#17201c]/10 bg-white p-6 shadow-xl shadow-[#10231d]/10 md:p-8">
        <div className="mb-8">
          <InteractiveCard
            pan={form.pan}
            customerName={form.customerName}
            expMonth={form.expMonth}
            expYear={form.expYear}
            cv2={form.cv2}
            focused={focused}
          />
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c2853e]">
              Kart Bilgileri
            </p>
          </div>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Ad Soyad *
            </span>
            <input
              type="text"
              required
              placeholder="Kart üzerindeki ad soyad"
              maxLength={MAX_CARD_HOLDER_LENGTH}
              value={form.customerName}
              onFocus={() => setFocused("customerName")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName: limitText(
                    e.target.value,
                    MAX_CARD_HOLDER_LENGTH,
                  ),
                })
              }
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold">
              Kart Numarası *
            </span>
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={formatCardInput(form.pan)}
              onFocus={() => setFocused("pan")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({
                  ...form,
                  pan: onlyDigits(e.target.value, MAX_CARD_DIGITS),
                })
              }
              className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 font-mono tracking-[0.12em] outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr]">
            <label>
              <span className="mb-1.5 block text-sm font-semibold">Ay *</span>
              <select
                required
                autoComplete="cc-exp-month"
                value={form.expMonth}
                onFocus={() => setFocused("expiry")}
                onBlur={() => setFocused(null)}
                onChange={(e) => setForm({ ...form, expMonth: e.target.value })}
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
              >
                <option value="">Ay</option>
                {MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-semibold">Yıl *</span>
              <select
                required
                autoComplete="cc-exp-year"
                value={form.expYear}
                onFocus={() => setFocused("expiry")}
                onBlur={() => setFocused(null)}
                onChange={(e) => setForm({ ...form, expYear: e.target.value })}
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
              >
                <option value="">Yıl</option>
                {expiryYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2 sm:col-span-1">
              <span className="mb-1.5 block text-sm font-semibold">CVV *</span>
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="000"
                maxLength={MAX_CVV_DIGITS}
                value={form.cv2}
                onFocus={() => setFocused("cv2")}
                onBlur={() => setFocused(null)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cv2: onlyDigits(e.target.value, MAX_CVV_DIGITS),
                  })
                }
                className="w-full rounded-2xl border border-[#17201c]/10 bg-[#f8f6f1] px-4 py-3 text-center outline-none transition focus:border-[#173f32]/40 focus:bg-white focus:ring-2 focus:ring-[#173f32]/10"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-[#10231d] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#10231d]/20 transition hover:bg-[#173f32] disabled:cursor-not-allowed disabled:bg-[#d8d2c6] disabled:text-[#7a867f]"
          >
            {loading
              ? "Yönlendiriliyor..."
              : isAgent
                ? "Ödemeyi Başlat"
                : "Ödemeyi Tamamla"}
          </button>
        </div>
      </section>
    </form>
  );
}
