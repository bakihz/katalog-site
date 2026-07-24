import type { PaymentProviderRecord } from "./types";
import {
  providerHelperTextClassName,
  providerInputClassName,
  providerLabelClassName,
} from "./provider-ui";

type ProviderFormFieldsProps = {
  provider?: PaymentProviderRecord;
};

export function ProviderFormFields({ provider }: ProviderFormFieldsProps) {
  const isEditing = Boolean(provider);

  return (
    <>
      <div>
        <label className={providerLabelClassName}>Ad</label>
        <input
          name="name"
          required
          defaultValue={provider?.name}
          className={providerInputClassName}
          placeholder="Ziraat Sanal POS"
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Panelde ve ödeme kayıtlarında görünecek sağlayıcı adı."
            : "Örn: Ziraat Sanal POS, Halkbank Sanal POS."}
        </p>
      </div>

      <div>
        <label className={providerLabelClassName}>
          Client ID / Üye İşyeri No
        </label>
        <input
          name="merchantId"
          defaultValue={provider?.merchantId ?? ""}
          className={providerInputClassName}
          placeholder="700100000"
          inputMode="numeric"
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Bankanın verdiği üye işyeri numarasıdır."
            : "POS aktif etmek için zorunludur."}
        </p>
      </div>

      <div>
        <label className={providerLabelClassName}>
          Store Key{" "}
          {isEditing && (
            <span className="font-normal text-[#89938e]">
              (boş bırakırsan değişmez)
            </span>
          )}
        </label>
        <input
          name="storeKey"
          type="password"
          className={providerInputClassName}
          autoComplete="new-password"
          placeholder={
            provider?.storeKey ? "Kayıtlı store key mevcut" : "STOREKEY..."
          }
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Hash doğrulamasında kullanılır. Boş bırakılırsa mevcut değer korunur."
            : "POS aktif etmek için zorunludur."}
        </p>
      </div>

      <div>
        <label className={providerLabelClassName}>Gateway URL</label>
        <input
          name="gatewayUrl"
          type="url"
          defaultValue={provider?.gatewayUrl ?? ""}
          className={providerInputClassName}
          placeholder="https://entegrasyon.asseco-see.com.tr/fim/est3Dgate"
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Müşterinin kart doğrulamasına yönleneceği banka adresi."
            : "POS aktif etmek için zorunludur."}
        </p>
      </div>

      <div>
        <label className={providerLabelClassName}>API Kullanıcı</label>
        <input
          name="apiUser"
          defaultValue={provider?.apiUser ?? ""}
          className={providerInputClassName}
          placeholder="APIUSER"
          autoComplete="off"
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Kullanılmıyorsa boş kalabilir; gerektiğinde bankanın verdiği değer yazılır."
            : "Bankaya göre opsiyonel olabilir."}
        </p>
      </div>

      <div>
        <label className={providerLabelClassName}>
          API Şifresi{" "}
          {isEditing && (
            <span className="font-normal text-[#89938e]">
              (boş bırakırsan değişmez)
            </span>
          )}
        </label>
        <input
          name="apiPassword"
          type="password"
          className={providerInputClassName}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <p className={providerHelperTextClassName}>
          {isEditing
            ? "Boş bırakılırsa mevcut değer korunur."
            : "Bankaya göre opsiyonel olabilir."}
        </p>
      </div>
    </>
  );
}
