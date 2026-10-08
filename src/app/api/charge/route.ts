import { NextResponse } from "next/server";

function coreUrl(): string {
  return process.env.CORE_URL ?? "http://localhost:8080";
}

export async function POST(request: Request) {
  const deaKey = process.env.DEA_API_KEY;
  if (!deaKey) {
    return NextResponse.json({ error: "experience_not_configured" }, { status: 503 });
  }
  const playerAuth = request.headers.get("x-player-authorization");
  if (!playerAuth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "player_unauthorized" }, { status: 401 });
  }
  const meRes = await fetch(`${coreUrl()}/v1/me`, {
    headers: { Authorization: playerAuth },
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: "player_unauthorized" }, { status: 401 });
  }
  const me = await meRes.json();
  const personId = me.id as string;
  const body = await request.json();
  const amountMinor = String(body.amount_minor ?? "500");
  const reference = String(body.reference ?? "template-demo-1");
  const idem = `template-${personId}-${amountMinor}-${Date.now()}`;
  const chargeRes = await fetch(`${coreUrl()}/v1/commerce/charge`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deaKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idem,
    },
    body: JSON.stringify({
      person_id: personId,
      amount_minor: amountMinor,
      currency_code: "NL",
      reason: "Template experience purchase",
      reference,
    }),
  });
  const data = await chargeRes.json();
  return NextResponse.json(data, { status: chargeRes.status });
}
