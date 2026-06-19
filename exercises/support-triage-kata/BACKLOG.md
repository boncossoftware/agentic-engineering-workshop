# Support Triage Backlog

This is the incoming work queue for the triage service. Think of it as a sprint
backlog of feature requests from the telecom support team.

Use it after the failing tests in Lab 1 are green. Pull **one ticket at a time**,
top to bottom. Each ticket is a vertical slice:

1. Write one failing `node:test` test that describes the behavior.
2. Implement the smallest production change in `src/tickets.js`.
3. Run `npm test`.
4. Stop, review the diff, then pull the next ticket.

Do not build a parser/service/validation/presentation layer. One slice, one diff.

Difficulty: ★ warm-up · ★★ rule interaction · ★★★ fuzzy / judgement.

> The current canonical rules live in `docs/requirements.md`. The tickets below
> are **new** requests that extend those rules. When a ticket and the existing
> rules disagree, the ticket wins and you should update `docs/requirements.md`.

---

## T1 — Payment arrangement ★

A customer who cannot pay should reach Billing quickly, not get lost in General Support.

**Behavior**
- If the message mentions `payment arrangement` or `cannot pay bill`, route to `Billing`.
- Add the `payment-arrangement` tag.
- Set SLA to 8 hours unless a higher-priority rule already applies.

**Done when**
- A test covers "I need a payment arrangement, cannot pay bill this month".
- Routing, tag, and SLA all assert.

---

## T2 — Stuck-abroad roaming ★

A customer with no service while travelling is higher priority than a normal mobile question.

**Behavior**
- If the message mentions `roaming` together with `abroad`, `overseas`, or `traveling`/`travelling`, set priority `high` and SLA `4` hours.
- Keep routing to `Mobile Support`.

**Done when**
- "Roaming not working, I am abroad and have no signal" → Mobile Support, high, 4h.
- A normal mobile ticket without the travel context stays `normal`.

---

## T3 — VIP escalation ★★

VIP customers should be seen sooner, and the tag alone is not enough — the SLA must reflect it.

**Behavior**
- For VIP tickets, halve the computed SLA (round down), with a floor of 1 hour.
- Add a `vip-escalation` tag in addition to the existing `vip` tag.
- This must compose with whatever priority/SLA the other rules already produced.

**Done when**
- A VIP normal ticket (24h) becomes 12h.
- A VIP high-priority network ticket (4h) becomes 2h.
- Tags include both `vip` and `vip-escalation`.

> This is the first ticket where **rule order** matters. Decide where SLA is final
> before you halve it. Let the test drive that decision.

---

## T4 — Multilingual outage detection ★★

Telecom customers report outages in Papiamento and Dutch, not only English.
The triage must not miss an outage because of the language it was written in.

**Behavior**
- Treat these as outage indicators, equivalent to the English `outage` / `no internet`:
  - Papiamento: `no tin internet`, `internet a cai`, `sin internet`
  - Dutch: `geen internet`, `internet is weg`
  - Telecom term, both languages: `interupcion`, and the Dutch loanword `storing` (customers really write this)
- A single-customer outage in any language → `Network Operations`, priority `high`, SLA `4`.

**Done when**
- "No tin internet for di awe mainta" → Network Operations, high, 4h.
- "Geen internet sinds vanochtend" → Network Operations, high, 4h.

> Teaching point: this is the same class of bug as the case-sensitive `no internet`
> check in Lab 1 — a keyword list that does not cover the real inputs. Notice how a
> small, well-named helper makes adding a language trivial.
>
> Stretch: to escalate *area* outages in another language, the area-indicator list
> needs the same treatment (e.g. `henter e bario`, `hele buurt`). That is a clean
> second slice.

---

## T5 — Recurring problem flag ★★★

A problem reported "again" is a different signal than a first report. A human should look.

**Behavior**
- If the message indicates a repeat — e.g. `again`, `still down`, `same problem`, or Papiamento `atrobe` / `ta pasa atrobe` ("it is happening again") — add a `recurring` tag and set `needsHumanReview` to `true`.
- Keep classifying priority/route/SLA normally.

**Done when**
- "Internet down again, third time this week" → `recurring` tag, `needsHumanReview` true, still routed/prioritized as an outage.
- A first-time report does not get the `recurring` tag.

> Fuzzy by design. Pick a small, defensible set of indicators and write the test
> that documents your choice. Do not try to be clever with regex.

---

## T6 — Oversized / abusive input guard ★★★ (stretch)

Untrusted user text can be huge or hostile. The service should stay safe and reviewable.

**Behavior**
- If the message is longer than 2,000 characters, or contains more than one
  prompt-injection marker (see `docs/requirements.md`), add a `needs-human-review`
  tag and set `needsHumanReview` to `true`.
- Never throw on large input; classify what you safely can.

**Done when**
- A 5,000-character message is handled without error and flagged for review.
- A message with two injection markers is flagged, not silently processed.

> Stretch goal. If you get here, you are ahead — help a neighbour, or open the
> diff and ask Claude to review your own slices for missed edge cases.
