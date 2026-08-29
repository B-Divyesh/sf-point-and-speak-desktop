import { writeFileSync } from "node:fs";

const endpoint = "https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=verification-5-invalid";
const attempts = [];
let limited = 0;
for (let index = 1; index <= 50; index += 1) {
  const response = await fetch(endpoint, { headers: { Origin: "https://point-and-speak-desktop.sociobot.in" } });
  attempts.push({ index, status: response.status, retryAfter: response.headers.get("retry-after"), allowOrigin: response.headers.get("access-control-allow-origin") });
  await response.text();
  if (response.status === 429) limited += 1;
  if (limited >= 3) break;
}
const first429 = attempts.find((item) => item.status === 429);
const beforeLimit = first429 ? attempts.filter((item) => item.index < first429.index && item.status !== 429).length : attempts.length;
const invalidStatuses = attempts.filter((item) => ![200, 429].includes(item.status));
const missingRetryAfter = attempts.filter((item) => item.status === 429 && !item.retryAfter);
const report = { checkedAt: new Date().toISOString(), endpoint, observedAllowanceBefore429: beforeLimit, first429At: first429?.index || null, attempts, pass: Boolean(first429) && invalidStatuses.length === 0 && missingRetryAfter.length === 0 };
writeFileSync(".factory/evidence/verification-5/rate-limit.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
