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

  if (lower.includes("vip")) {
    tags.push("vip");
  }

  if (lower.includes("internet") || lower.includes("fiber") || lower.includes("modem")) {
    route = ROUTES.network;
  }

  if (lower.includes("invoice") || lower.includes("payment")) {
    route = ROUTES.billing;
  }

  if (lower.includes("sim") || lower.includes("mobile")) {
    route = ROUTES.mobile;
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

  const slaHours = priority === "urgent" ? 1 : priority === "high" ? 4 : 24;

  return {
    priority,
    route,
    slaHours,
    tags,
    needsHumanReview
  };
}

