const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export async function sendVerificationCode(
  email: string,
  companyName: string,
  language?: string
) {
  const response = await fetch(`${API_URL}/api/auth/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, companyName, language }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send verification code");
  }

  return response.json();
}

export async function verifyEmail(email: string, code: string) {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Verification failed");
  }

  return response.json();
}

export async function register(data: {
  companyName: string;
  ownerName: string;
  phone: string;
  address: string;
  industry: string;
  locale: string;
  language: string;
  email: string;
  password: string;
  zipcode?: string;
  referralCode?: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
}
