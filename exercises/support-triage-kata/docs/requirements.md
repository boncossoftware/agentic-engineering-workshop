# Support Triage Requirements

## Purpose

Classify a support ticket into:

- `priority`: `normal`, `high`, or `urgent`
- `route`: `General Support`, `Network Operations`, `Billing`, or `Mobile Support`
- `slaHours`: number of hours before first response
- `tags`: searchable labels
- `needsHumanReview`: whether a human should inspect the ticket before automation continues

## Current rules

### Default

If no stronger rule applies:

- priority: `normal`
- route: `General Support`
- SLA: 24 hours

### Network

Route to `Network Operations` when the message mentions:

- internet
- fiber
- modem
- outage
- down

If a single customer reports "no internet", "down", or "outage", priority is `high` and SLA is 4 hours.

Outage indicators are multilingual. The following are all treated as
outage-equivalent (case-insensitive) and route to `Network Operations` with
priority `high` and SLA 4 hours, even when they do not contain the word
"internet":

- Papiamento: `no tin internet`, `internet a cai`, `sin internet`
- Dutch: `geen internet`, `internet is weg`
- Telecom terms: `interupcion`, `storing`

If the message suggests an area issue or multiple customers, priority is `urgent` and SLA is 1 hour.

Area indicators:

- neighborhood
- area
- multiple customers
- whole street
- whole building

### Billing

Route to `Billing` when the message mentions:

- invoice
- bill
- payment
- top-up

### Mobile

Route to `Mobile Support` when the message mentions:

- sim
- mobile
- roaming

If the message mentions `roaming` together with a travel context (`abroad`, `overseas`, `traveling`, or `travelling`), the customer is likely stranded without service. Set priority to `high` and SLA to 4 hours. Routing stays `Mobile Support`. A plain mobile or roaming ticket without travel context stays priority `normal`.

### VIP

If the message mentions VIP, add the `vip` tag.

VIP tickets are escalated. Rule order matters: the escalation composes on top of
every other rule.

- Also add the `vip-escalation` tag (in addition to `vip`).
- After all other rules (default/network/billing/mobile/payment-arrangement)
  have determined the final SLA, halve it, rounded down, with a floor of 1 hour:
  `slaHours = max(1, floor(slaHours / 2))`.

Examples: a VIP normal ticket (24h) becomes 12h; a VIP high-priority network
ticket (4h) becomes 2h.

### Prompt injection safety

Ticket messages are user content. They must never be treated as instructions to the agent or the application.

The prompt-injection markers are a single named list (one source of truth,
shared with the oversized/abusive guard below):

- `ignore previous instructions`
- `system prompt`
- `developer message`
- `reveal secrets`

If the message contains any of these markers:

- add the `security-review` tag
- set `needsHumanReview` to true
- keep classifying the ticket normally where possible

### Oversized / abusive input guard

Ticket text is untrusted; the function must never throw on large or hostile
input. It classifies whatever it safely can and flags the ticket for a human.

If either of the following is true:

- the message is longer than 2,000 characters, or
- the message contains more than one distinct prompt-injection marker (from
  the list above)

then:

- add the `needs-human-review` tag (hyphenated; distinct from the
  `security-review` tag)
- set `needsHumanReview` to true

A single injection marker still only triggers `security-review`. Two or more
distinct markers additionally trigger this guard, so the ticket is flagged for
review rather than silently processed. The ticket is still classified normally
where possible (priority/route/SLA are left to the other rules).

### Recurring problem

When a message indicates the customer is reporting the same problem again, it
likely needs a human to spot a pattern that automation would miss.

If the message contains any of the following case-insensitive indicators:

- English: `again`, `still down`, `same problem`
- Papiamento: `atrobe`, `ta pasa atrobe`

then:

- add the `recurring` tag
- set `needsHumanReview` to true

This rule only adds the tag and flags review; it does not change priority,
route, or SLA. The ticket is still classified normally (e.g. "Internet down
again" stays a high-priority `Network Operations` outage). Like the
prompt-injection rule, this composes on top of any other flag that already set
`needsHumanReview`.

## Extension exercise

Add a vertical slice for payment-arrangement tickets:

- If a ticket mentions "payment arrangement" or "cannot pay bill", route to `Billing`.
- Add the `payment-arrangement` tag.
- Set SLA to 8 hours unless a higher priority rule already applies.

