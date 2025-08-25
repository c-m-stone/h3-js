// Option A: default import (works across h3-js v3/v4)
import h3 from "npm:h3-js@4";

// Option B: named import (v4+ only)
// import { latLngToCell, cellToLatLng, cellToBoundary } from "npm:h3-js@4";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // GET /cell?lat=-34.6037&lng=-58.3816&res=7
  if (url.pathname === "/cell") {
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));
    const res = Number(url.searchParams.get("res") ?? 7);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(res)) {
      return json({ error: "lat, lng, res required" }, 400);
    }

    const index = h3.latLngToCell(lat, lng, res); // or latLngToCell(...)
    const center = h3.cellToLatLng(index);
    const boundary = h3.cellToBoundary(index, true); // geojson order [lng, lat]

    return json({ index, center, boundary, res });
  }

  // GET /kring?index=8928308280fffff&k=1
  if (url.pathname === "/kring") {
    const index = url.searchParams.get("index") ?? "";
    const k = Number(url.searchParams.get("k") ?? 1);
    if (!index || !Number.isFinite(k)) return json({ error: "index, k required" }, 400);

    const ring = h3.gridDisk(index, k);
    return json({ index, k, ring });
  }

  return json({ ok: true, routes: ["/cell", "/kring"] });
});
