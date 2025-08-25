import h3 from "https://esm.sh/h3-js@3.7.2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");
  const res = parseInt(url.searchParams.get("res") ?? "9");

  if (isNaN(lat) || isNaN(lng) || isNaN(res)) {
    return new Response("Missing or invalid lat/lng/res", { status: 400 });
  }

  const h3Index = h3.latLngToCell(lat, lng, res);
  return new Response(JSON.stringify({ h3: h3Index }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
