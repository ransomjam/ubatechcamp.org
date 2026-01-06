// Payment configuration constants
export const PAYMENT_CONFIG = {
  REGISTRATION_FEE_XAF: 100, // Change this value to update payment amount globally
  LEARN_ONLINE_FEE_XAF: 100,
  CURRENCY: 'XAF'
} as const;

export const formatAmount = (amount: number, currency: string = PAYMENT_CONFIG.CURRENCY) => {
  return `${amount} ${currency}`;
};