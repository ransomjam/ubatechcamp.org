// Lightweight client helper for FAPSHI flows (calls server endpoints in src/lib/api.ts)
import { api } from "./api";

export async function startFapshiCheckout(registrationId: string, amountCents: number, phone?: string, email?: string) {
  return api.createFapshiPayment({ registration_id: registrationId, amount_cents: amountCents, currency: "XAF", phone, email });
}

export async function pollPayment(paymentId: string) {
  return api.getPaymentStatus(paymentId);
}

export default { startFapshiCheckout, pollPayment };
