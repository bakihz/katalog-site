"use client";

import { type FormEvent, useMemo, useState } from "react";
import { InteractiveCard } from "./InteractiveCard";
import {
  FocusedCardField,
  formatCardInput,
  getExpiryYearOptions,
  isValidExpiryYear,
  limitText,
  MAX_CARD_DIGITS,
  MAX_CARD_HOLDER_LENGTH,
  MAX_CVV_DIGITS,
  MAX_EXPIRY_YEAR_OFFSET,
  MONTH_OPTIONS,
  normalizeExpiryYear,
  onlyDigits,
  PaymentMode,
} from "./paymentUtils";

export function PaymentForm({ mode }: { mode: PaymentMode }) {
  const currentYear = new Date().getFullYear();
  const expiryYearOptions = useMemo(
    () => getExpiryYearOptions(currentYear),
    [currentYear],
  );
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FocusedCardField>(null);
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

  async function handleSubmit(e: FormEvent) {
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
