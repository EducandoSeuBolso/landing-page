import type { Tier } from "@/components/diagnostico/diagnostico-data";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://backend.educandoseubolso.blog.br";

export interface CreateSubmissionPayload {
  name?: string;
  answers: Record<string, number | string>;
  dimScores: { urgencia: number; vulnerabilidade: number; bemestar: number };
  total: number;
  tier: Tier;
  contactReason?: string;
}

export interface AttachLeadPayload {
  email?: string;
  phone?: string;
  consent?: boolean;
}

export async function createSubmission(
  payload: CreateSubmissionPayload,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/diagnostico/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createSubmission failed: ${res.status}`);
  return res.json() as Promise<{ id: string }>;
}

export async function attachLead(
  id: string,
  payload: AttachLeadPayload,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/diagnostico/submissions/${id}/lead`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`attachLead failed: ${res.status}`);
}
