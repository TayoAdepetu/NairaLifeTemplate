"use client";

import { useState } from "react";

/** Example price in minor NL units (500 minor = 5.00 NL). */
const PRODUCT_MINOR = "500";

export default function ExperiencePage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function buy() {
    setError(null);
    setOk(false);
    setLoading(true);
    const token = sessionStorage.getItem("nl_access_token");
    if (!token) {
      setError(
        "Sign in on NairaLife web, approve COMMERCE_CHARGE for this experience, then open it from /experiences.",
      );
      setLoading(false);
      return;
    }
    const res = await fetch("/api/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Player-Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ amount_minor: PRODUCT_MINOR }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Charge failed — check DEA key, grant, and Core logs.");
      return;
    }
    setOk(true);
  }

  return (
    <main style={{ maxWidth: "28rem", margin: "2rem auto", padding: "1rem" }}>
      <h1>My NairaLife experience</h1>
      <p>
        Sample DEA-hosted UI. NL charges go through Core Commerce with a server-side{" "}
        <code>DEA_API_KEY</code> — never exposed to the browser.
      </p>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <strong>Demo item</strong>
        <p>{PRODUCT_MINOR} minor NL (5.00 NL)</p>
        <button type="button" onClick={buy} disabled={loading}>
          {loading ? "Processing…" : "Buy with NL"}
        </button>
      </div>
      {error ? (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      ) : null}
      {ok ? <p style={{ color: "#15803d" }}>Charged successfully.</p> : null}
    </main>
  );
}
