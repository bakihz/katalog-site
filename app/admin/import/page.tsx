"use client";

import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch("/api/products/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    alert(`${data.count} ürün içe aktarıldı`);

    setLoading(false);
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-8">Ürün İçe Aktarma</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-white text-black px-6 py-3 rounded-xl ml-4"
      >
        {loading ? "Yükleniyor..." : "İçe Aktar"}
      </button>
    </main>
  );
}
