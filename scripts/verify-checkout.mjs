const slug = "point-and-speak-desktop";
const base = "https://api.sociobot.in/api/v1";
const catalog = await fetch(`${base}/products`).then((response) => {
  if (!response.ok) throw new Error(`product catalog returned HTTP ${response.status}`);
  return response.json();
});
const product = catalog.data?.find((entry) => entry.slug === slug);
if (!product || product.price_minor !== 1900 || product.currency !== "USD") {
  throw new Error("live catalog does not list the $19 USD supporter product");
}
let response;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  response = await fetch(`${base}/products/${slug}/checkout`, { redirect: "manual" });
  if (response.status < 500 || attempt === 3) break;
  await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
}
const location = response.headers.get("location");
if (response.status !== 303 || !location) throw new Error(`checkout did not redirect: HTTP ${response.status}`);
const target = new URL(location);
if (target.protocol !== "https:" || target.hostname !== "checkout.dodopayments.com" || !target.pathname.startsWith("/session/")) {
  throw new Error(`checkout redirected to an unexpected target: ${target.origin}${target.pathname}`);
}
console.log(`@claim:checkout-live $19 USD; HTTP ${response.status} -> ${target.origin}/session/<redacted>`);
