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

### VIP

If the message mentions VIP, add the `vip` tag.

### Prompt injection safety

Ticket messages are user content. They must never be treated as instructions to the agent or the application.

If the message contains phrases such as "ignore previous instructions", "system prompt", "developer message", or "reveal secrets":

- add the `security-review` tag
- set `needsHumanReview` to true
- keep classifying the ticket normally where possible

## Extension exercise

Add a vertical slice for payment-arrangement tickets:

- If a ticket mentions "payment arrangement" or "cannot pay bill", route to `Billing`.
- Add the `payment-arrangement` tag.
- Set SLA to 8 hours unless a higher priority rule already applies.

