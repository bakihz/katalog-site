"use client";

import { useState } from "react";

export default function PanelOdemePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    description: "",
    amount: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, agentFlow: true }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Bir hata oluştu.");
        setLoading(false);
        return;
      }

      // Build the bank form and auto-submit
      const bankForm = document.createElement("form");
      bankForm.method = "POST";
      bankForm.action = data.gatewayUrl;

      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        bankForm.appendChild(input);
      });

      document.body.appendChild(bankForm);
      bankForm.submit();
    } catch {
      setError("Sunucu hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-3xl font-bold mb-2">Ödeme Al</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Müşteri bilgilerini girin ve sanal pos ile kartı çekin.
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Ad Soyad *</label>
          <input
            type="text"
            required
            placeholder="Müşteri adı soyadı"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Firma / Cari</label>
          <input
            type="text"
            placeholder="Firma adı (opsiyonel)"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            Açıklama / Fatura No
          </label>
          <input
            type="text"
            placeholder="Ödeme açıklaması"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Tutar (TL) *</label>
          <input
            type="number"
            required
            min="1"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 disabled:opacity-60 transition-colors"
        >
          {loading ? "Yönlendiriliyor..." : "Kartı Çek"}
        </button>
      </form>
    </div>
  );
}
