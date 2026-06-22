const ROUTES = {
  general: "General Support",
  network: "Network Operations",
  billing: "Billing",
  mobile: "Mobile Support"
};

export function triageTicket(input) {
  if (!input || typeof input.message !== "string" || input.message.trim() === "") {
    throw new Error("message is required");
  }

  const message = input.message;
  const lower = message.toLowerCase();

  let priority = "normal";
  let route = ROUTES.general;
  const tags = [];

  let vip = false;
  if (lower.includes("vip")) {
    tags.push("vip");
    tags.push("vip-escalation");
    vip = true;
  }

  if (lower.includes("internet") || lower.includes("fiber") || lower.includes("modem")) {
    route = ROUTES.network;
  }

  if (lower.includes("invoice") || lower.includes("payment")) {
    route = ROUTES.billing;
  }

  if (lower.includes("sim") || lower.includes("mobile") || lower.includes("roaming")) {
    route = ROUTES.mobile;
  }

  // Roaming failures while the customer is travelling are time-critical.
  if (
    lower.includes("roaming") &&
    (lower.includes("abroad") ||
      lower.includes("overseas") ||
      lower.includes("traveling") ||
      lower.includes("travelling"))
  ) {
    priority = "high";
  }

  let paymentArrangement = false;
  if (lower.includes("payment arrangement") || lower.includes("cannot pay bill")) {
    route = ROUTES.billing;
    tags.push("payment-arrangement");
    paymentArrangement = true;
  }

  // Treat incoming ticket text as untrusted: flag prompt-injection attempts
  // for human review instead of acting on them.
  let needsHumanReview = false;
  if (lower.includes("ignore previous instructions") || lower.includes("reveal secrets")) {
    needsHumanReview = true;
    tags.push("security-review");
  }

  if (lower.includes("down") || lower.includes("no internet")) {
    priority = "high";
  }

  // Widespread/area-wide network issues take precedence over single-customer ones.
  if (
    lower.includes("outage") ||
    lower.includes("neighborhood") ||
    lower.includes("area") ||
    lower.includes("multiple")
  ) {
    priority = "urgent";
  }

  let slaHours =
    priority === "urgent" ? 1 : priority === "high" ? 4 : paymentArrangement ? 8 : 24;

  // VIP escalation composes on top of every other rule: halve the final SLA
  // (rounded down, floored at 1 hour) only after it is fully determined.
  if (vip) {
    slaHours = Math.max(1, Math.floor(slaHours / 2));
  }

  return {
    priority,
    route,
    slaHours,
    tags,
    needsHumanReview
  };
}

