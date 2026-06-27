"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

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

        <hr className="border-gray-700" />

        <input
          type="text"
          placeholder="Kart Numarası"
          className="w-full border p-3 rounded font-mono tracking-widest"
          maxLength={19}
          value={form.pan}
          onChange={(e) =>
            setForm({ ...form, pan: e.target.value.replace(/\D/g, "") })
          }
        />

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="AA (Ay)"
            className="w-1/3 border p-3 rounded text-center"
            maxLength={2}
            value={form.expMonth}
            onChange={(e) =>
              setForm({ ...form, expMonth: e.target.value.replace(/\D/g, "") })
            }
          />
          <input
            type="text"
            placeholder="YYYY (Yıl)"
            className="w-1/3 border p-3 rounded text-center"
            maxLength={4}
            value={form.expYear}
            onChange={(e) =>
              setForm({ ...form, expYear: e.target.value.replace(/\D/g, "") })
            }
          />
          <input
            type="text"
            placeholder="CVV"
            className="w-1/3 border p-3 rounded text-center"
            maxLength={4}
            value={form.cv2}
            onChange={(e) =>
              setForm({ ...form, cv2: e.target.value.replace(/\D/g, "") })
            }
          />
        </div>

        <button
          disabled={loading}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          {loading ? "Yükleniyor..." : "Ödemeyi Tamamla"}
        </button>
      </form>
    </main>
  );
}
