// Monetbil integration removed — archived in src/lib/backup/monetbil.ts.bak
// Keep a stub to prevent build-time import errors.
export const initiateMonetbilPayment = () => {
  throw new Error('Monetbil integration removed — use server-side Fapshi integration at /api/payments/fapshi');
};

export const updateMonetbilServiceKey = () => {
  // noop
};
