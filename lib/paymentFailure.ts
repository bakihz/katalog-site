export function getPaymentFailureDetails(formData: FormData) {
  const errorMessage =
    getFormString(formData, "ErrMsg") ||
    getFormString(formData, "errmsg") ||
    getFormString(formData, "mdErrorMsg") ||
    getFormString(formData, "Response");

  const errorCode =
    getFormString(formData, "ErrorCode") ||
    getFormString(formData, "ProcReturnCode") ||
    getFormString(formData, "mdStatus");

  return {
    errorCode: errorCode || null,
    errorMessage: errorMessage || null,
  };
}

export function getFailureRedirectUrl({
  baseUrl,
  paymentId,
  formData,
}: {
  baseUrl: string;
  paymentId: number | null | undefined;
  formData: FormData;
}) {
  if (!paymentId) return `${baseUrl}/panel/odeme?error=1`;

  const { errorCode, errorMessage } = getPaymentFailureDetails(formData);
  const params = new URLSearchParams();

  if (errorMessage) params.set("err", errorMessage);
  if (errorCode) params.set("code", errorCode);

  const queryString = params.toString();
  return `${baseUrl}/panel/odeme/basarisiz/${paymentId}${
    queryString ? `?${queryString}` : ""
  }`;
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
