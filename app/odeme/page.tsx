import { PaymentForm } from "@/components/PaymentForm";

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-8 text-[#17201c] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <PaymentForm mode="public" />
      </div>
    </main>
  );
}
