import { AppButton } from "@/components/ui";
import { ProviderFormFields } from "./provider-form-fields";

export function ProviderCreate() {
  return (
    <section className="rounded-[1.75rem] border border-[#17201c]/10 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold">Sanal POS Ekle</h3>
      <p className="mt-1 text-sm text-[#68746e]">
        Yeni bir sanal POS sağlayıcısı tanımlayın. Eklenen POS pasif başlar;
        bilgileri tamamlandıktan sonra aktif edilebilir.
      </p>

      <form
        action="/api/admin/providers/create"
        method="POST"
        className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <ProviderFormFields />
        <div className="lg:col-span-2">
          <AppButton type="submit">Ekle</AppButton>
        </div>
      </form>
    </section>
  );
}
