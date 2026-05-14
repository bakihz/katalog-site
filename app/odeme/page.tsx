"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    description: "",
    amount: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log(data);

    setLoading(false);

    if (data.success) {
      const form = document.createElement("form");

      form.method = "POST";

      form.action = data.gatewayUrl;

      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement("input");

        input.type = "hidden";

        input.name = key;

        input.value = value as string;

        form.appendChild(input);
      });

      document.body.appendChild(form);

      form.submit();
    }
  }

  return (
    <main className="max-w-xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Ödeme Yap</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ad Soyad"
          className="w-full border p-3 rounded"
          value={form.customerName}
          onChange={(e) =>
            setForm({
              ...form,
              customerName: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Firma / Cari"
          className="w-full border p-3 rounded"
          value={form.companyName}
          onChange={(e) =>
            setForm({
              ...form,
              companyName: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Açıklama"
          className="w-full border p-3 rounded"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Tutar"
          className="w-full border p-3 rounded"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value,
            })
          }
        />

        <button
          disabled={loading}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          {loading ? "Yükleniyor..." : "Sanal POS'a Git"}
        </button>
      </form>
    </main>
  );
}
