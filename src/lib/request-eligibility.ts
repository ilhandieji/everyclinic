export const ownServiceRequestError =
  "برای خدمت خودتان نمی‌توانید درخواست ثبت کنید.";

export const acceptedRequestError =
  "برای این خدمت یک درخواست پذیرفته‌شده دارید.";

export function requestEligibility(input: {
  ownsService: boolean;
  hasAccepted: boolean;
}): { ok: true } | { ok: false; error: string } {
  if (input.ownsService) {
    return { ok: false, error: ownServiceRequestError };
  }
  if (input.hasAccepted) {
    return { ok: false, error: acceptedRequestError };
  }
  return { ok: true };
}
