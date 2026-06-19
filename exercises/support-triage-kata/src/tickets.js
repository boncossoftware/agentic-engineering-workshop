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

  // Intentional workshop bug: this check is case-sensitive and incomplete.
  if (message.includes("outage") || message.includes("down") || message.includes("no internet")) {
    priority = "high";
  }

  const slaHours = priority === "urgent" ? 1 : priority === "high" ? 4 : 24;

  return {
    priority,
    route,
    slaHours,
    tags,
    needsHumanReview: false
  };
}

