export async function generateItinerary(prompt, signal) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    let msg = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      if (err.error) msg = err.error;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();

  if (!data.result) {
    throw new Error("No result returned from server");
  }

  return data.result;
}
