// src/lib/api.ts
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || "https://www.ubatechcamp.org").trim();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ---------- Error type ----------
export interface HttpError extends Error {
  status: number;
  data?: any;
}

// ---------- Types ----------
export interface CreatePaymentIntentRequest {
  registration_id: string;
  amount_cents: number;
  currency: string; // e.g. "XAF"
}
export interface CreatePaymentIntentResponse {
  client_secret: string;
  id?: string;
  status?: string;
}

export interface CreateMobilePaymentRequest {
  registration_id: string;
  provider: "orange" | "mtn";
  phone: string;
  amount_cents: number;
  currency: string;
  plan_id?: string;
}

export interface CreateMobilePaymentResponse {
  id: string;
  status: "pending" | "succeeded" | "failed";
  provider_reference?: string;
  message?: string;
}

// ---------- Helper to parse JSON safely ----------
async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
  return null;
}

// ---------- Generic Request ----------
async function request<T>(
  path: string,
  opts: { method?: HttpMethod; body?: unknown; admin?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.admin && import.meta.env.VITE_ADMIN_KEY) {
    headers["x-admin-key"] = import.meta.env.VITE_ADMIN_KEY;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });

  // ✅ Success case
  if (res.ok) {
    const txt = await res.text();
    return (txt ? (JSON.parse(txt) as T) : (undefined as T));
  }

  // ❌ Error handling
  const status = res.status;
  let data: any = undefined;
  let message = `HTTP ${res.status} ${res.statusText}`;

  try {
    const txt = await res.text();
    data = txt ? JSON.parse(txt) : undefined;
    if (data?.error) message = data.error;

    // handle field validation messages
    const fe = data?.details?.fieldErrors;
    if (fe && typeof fe === "object") {
      const first = Object.entries<any>(fe).find(
        ([, arr]) => Array.isArray(arr) && arr.length > 0
      );
      if (first)
        message = `${message}: ${first[0]} - ${(first[1] as string[])[0]}`;
    }
  } catch {
    // ignore JSON parse errors
  }

  const err = new Error(message) as HttpError;
  err.status = status;
  err.data = data;
  throw err;
}

// ---------- Public + Admin API ----------
export const api = {
  // ✅ Registration (treat 409 as success)
  createRegistration: async (data: {
    full_name: string;
    email: string;
    phone: string;
    institution?: string | null;
    field_of_study?: string | null;
    program: string;
    experience?: string | null;
    motivation?: string;
    recommendation_code?: string | null;
    payment_plan: string;
    age?: number;
    education_level?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const jsonData = await safeJson<any>(res);

    // ✅ Treat duplicate email (409) as "soft success"
    if (res.status === 409) {
      return { id: jsonData?.id ?? "", __conflict: true };
    }

    if (!res.ok) {
      throw { status: res.status, data: jsonData };
    }

    return jsonData;
  },

  // Newsletter
  subscribeNewsletter: (data: {
    email: string;
    marketing_consent: boolean;
  }) => request("/api/newsletter", { method: "POST", body: data }),

  // Contact
  sendContact: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => request("/api/contact", { method: "POST", body: data }),

  

  // ✅ Updated Mobile Money Route
  createMobilePayment: async (body: {
    registration_id: string;
    provider: "mtn" | "orange";
    phone: string;
    amount_cents: number;
    currency: string; // "XAF"
    plan_id?: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/payments/mobile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.error ||
        (res.status === 503
          ? "Orange Money is not available now. Please use MTN Mobile Money."
          : "Payment initiation failed");
      throw new Error(msg);
    }

    return data;
  },

  // FAPSHI payment creation (mock-friendly)
  createFapshiPayment: async (body: {
    registration_id: string;
    amount_cents: number;
    currency: string; // e.g. "XAF"
    phone?: string;
    email?: string;
  }) => {
    // Ensure API_BASE doesn't have a trailing slash and path starts with /api
    const baseUrl = API_BASE.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/api/payments/fapshi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || "Failed to create FAPSHI payment");
    }
    return data as { payment_id: string; checkout_url: string };
  },

  // Poll payment status
  getPaymentStatus: async (paymentId: string) => {
    const res = await fetch(`${API_BASE}/api/payments/${paymentId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to get payment status");
    }
    return (await res.json()) as { id: string; status: string; provider_reference?: string };
  },

  // Volunteer application
  submitVolunteerApplication: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/api/volunteer`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to submit volunteer application");
    }

    return res.json();
  },

  // Admin endpoints
  listRegistrationsAdmin: () => request("/api/registrations", { admin: true }),
  listPaymentsAdmin: () => request("/api/payments", { admin: true }),
  listNewsletterAdmin: () => request("/api/newsletter", { admin: true }),
};
