# PostHog Self-driving Setup Report

**Project:** CottBook — Brokerage Management  
**Date:** 2026-08-26  
**Inbox:** https://eu.posthog.com/project/234247/inbox

## Summary

PostHog Self-driving has been configured for CottBook. Session Replay, Error Tracking, and Support signal sources are wired to the inbox; a selective scout troop of 6 agents (including one custom bargain-to-bill funnel scout) is active; and two Replay Vision scanners are armed and ready to push findings as soon as session recordings begin. Findings will start appearing in the [Self-driving inbox](https://eu.posthog.com/project/234247/inbox) within approximately 30 minutes.

---

## AI data processing

Approved. Organization-level AI data processing consent was verified before this run.

---

## GitHub

**Connected** — GitHub account `dakshs12` was already integrated (connected 2026-07-28, integration id 73904). Self-driving can research findings in code and open draft fix PRs.

---

## Products enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | Follow-up required | `products-enable` call timed out. Server flip needed. `posthog.init` is clean — no `disable_session_recording` override. |
| Error Tracking | Follow-up required | Same call timeout. `capture_exceptions: true` is already set in `instrumentation-client.ts` — client-side capture is on. |
| Support (Conversations) | Follow-up required | Same call timeout. Tickets will only arrive once an inbound channel is connected (see Follow-ups). |

> **Follow-up:** Enable all three products manually: PostHog → Settings → Session replay ("Record user sessions"), Settings → Error tracking ("Enable exception autocapture"), and Support in the product sidebar. The signal sources are already enabled and will pick up data with no re-setup once the products are on.

`posthog.init` check result: **clean** — `capture_exceptions: true` is set, no `disable_session_recording` or `capture_exceptions: false` overrides found in `frontend/instrumentation-client.ts`.

---

## Signal sources

| source_product | source_type | Action | Config ID |
|---|---|---|---|
| `signals_scout` | `cross_source_issue` | On by default — no row needed | — |
| `health_checks` | `health_issue` | **Enabled** | `01a03c64-b35f-7bb9-96ec-a0ace2e8e3c1` |
| `error_tracking` | `issue_created` | **Enabled** | `01a03c64-c24a-7f21-9a91-c1b8703d72b7` |
| `error_tracking` | `issue_reopened` | **Enabled** | `01a03c64-d1c8-7b8c-bcf0-a83875543233` |
| `error_tracking` | `issue_spiking` | **Enabled** | `01a03c64-e253-7623-a151-2e489a32c72f` |
| `session_replay` | `session_analysis_cluster` | **Enabled** (sample_rate: 0.1) | `01a03c64-f0dd-7c29-86cf-54f7a44cc4ef` |
| `conversations` | `ticket` | **Enabled** (dormant until channel connected) | `01a03c65-02cb-7ad2-8fe9-503e13ecc97f` |
| `replay_vision` | — | Skipped — scanners are self-authorizing via `emits_signals: true` | — |
| `llm_analytics` | — | Skipped — not a user-facing responder | — |
| `logs` | — | Skipped — not a v1 responder | — |

---

## Connected tools

No external issue-tracker or support-desk tools were selected. All skipped (not used).

| Tool | Status |
|---|---|
| GitHub Issues | Not used |
| Linear | Not used |
| Jira | Not used |
| Sentry | Not used |
| Zendesk | Not used |
| All others | Not used |

---

## Scout troop

**Run budget:** 100 runs/day (max 3/tick) — early access default. Banner: *"Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."*  
**Total enabled:** 6 (within the 10-scout ceiling)

### Enabled

| Scout | What it watches |
|---|---|
| `general` | Cross-product correlations and surfaces no specialist covers |
| `product-analytics` | Saved funnels, retention, and lifecycle flows for conversion regressions |
| `web-analytics` | Per-channel session volume, attribution breakage, and landing-page health |
| `health-checks` | PostHog's own health issues, weighted by blast radius |
| `observability-gaps` | High-volume events with no insight, dashboard, or alert coverage |
| `transaction-funnel` *(custom)* | CottBook's bargain→passing→delivery→bill completion rate (see Custom scouts) |

### Disabled (22 scouts)

Key disables and their reason:

| Scout | Reason disabled |
|---|---|
| `error-tracking` | Covered by the native error_tracking source (3 rows enabled above) |
| `session-replay` | Covered by the native session_replay source (enabled above) |
| `feature-flags` | No feature flags in use — enable if you adopt them |
| `experiments` | No experiments — enable if you run A/B tests |
| `surveys` | No surveys — enable if you add PostHog surveys |
| `revenue-analytics` | No payment SDK connected |
| `ai-observability` | No AI/LLM instrumentation |
| `logs` | Logs product not in use |
| `csp-violations` | No CSP reporting configured |
| `customer-analytics` | No group/accounts analytics |
| `data-pipelines` | No CDP destinations or hog flows |
| `conversations` | Support channel not connected yet |
| `inbox-validation` | Fresh setup — no resolved reports to validate yet |
| `replay-vision` | Scanners created in step 6c but no observations yet; enable once recordings accumulate |
| All others | Not applicable to this project's current surface |

---

## Custom scouts

### Created

**`signals-scout-transaction-funnel`**  
- **Watches:** CottBook's core brokerage pipeline — `bargain_deal_created` → `passing_created` → `delivery_created` → `brokerage_bill_generated` — for completion-rate drops
- **Discriminator:** Bill-to-bargain ratio drops >15% week-over-week while ≥10 bargains were created that week; closes out empty when the funnel is on track (a quiet run is correct)
- **Explore patterns:** Stage-level drop-off, deal_type breakdown, delivery_type breakdown, day-by-day trend (cliff vs. gradual slide)
- **Why no built-in covers it:** `signals-scout-product-analytics` watches *saved* funnels and retention flows — there are no saved funnels yet on this fresh project. This scout watches the raw events directly
- **Config id:** `01a03c73-743e-7d91-954a-b1676a87e7d7`

### Considered and ruled out

| Surface | Filter that killed it |
|---|---|
| Subscription lifecycle | Only 1 captured event (`subscription_plan_contact_clicked`); no renewal or expiry event to close the loop — surface too thin for a discriminator |
| Auth/registration funnel | Partially covered by `web-analytics` for traffic drops; too generic without downstream conversion events |
| Master data pages (firm/party) | No events captured from those pages |

### Noise escape hatch

If `signals-scout-transaction-funnel` turns noisy, set `emit: false` on its config (`01a03c73-743e-7d91-954a-b1676a87e7d7`) in PostHog to switch it to dry-run. It will keep running and logging without writing to the inbox.

---

## Replay Vision scanners

Scanners are an LLM that watches individual session recordings on a schedule and pushes what it finds to the Self-driving inbox. Findings arrive at half weight — a single finding needs corroboration before being promoted into a report. The sizing skill was unavailable on this deploy (404), so monthly credit spend was not verified; at 5 credits/observation and 0 current recordings the projected spend is $0. Scanners start working the day recordings begin — no second setup needed.

| Scanner | Type | Query scope | Sampling | emits_signals | Status |
|---|---|---|---|---|---|
| Brokerage bill generation failures | monitor | `$current_url` icontains `/bill-generation` | 0.5 | ✓ | **Created** (`01a03c74-c481-76a8-af97-7c74bcde496f`) |
| Broker deal-entry rage clicks | monitor | `$rageclick` event gate (no URL scope) | 1.0 | ✓ | **Created** (`01a03c74-f59e-7e23-b231-932ca5d2aca5`) |

**Breakage monitor** (`Brokerage bill generation failures`) — scoped to the bill generation completion flow (`/bill-generation`). Watches for: form submission failures, party/bargain dropdowns not populating, spinners that never resolve, bill amounts rendering as zero, and blank due-list report rows.

**Frustration monitor** (`Broker deal-entry rage clicks`) — gated on `$rageclick` across all sessions. Watches for: rage-clicking deal forms after silent validation errors, hammering the bill generate button, dropdown search not returning results, repeated failing form submissions in passing/delivery entry.

No recordings exist yet — both scanners are armed and will start scanning the day recordings arrive.

---

## Follow-ups

- [ ] **Enable products manually:** PostHog → Settings → Session replay ("Record user sessions"), Settings → Error tracking ("Enable exception autocapture"), and Support product sidebar. The `products-enable` API call timed out during setup; everything else is wired and ready.
- [ ] **Connect a Support inbound channel** (email / inbox / Slack) in PostHog so the `conversations / ticket` source starts producing findings. Until then the source is enabled but dormant.
- [ ] **Enable `signals-scout-feature-flags`** in PostHog if you introduce PostHog feature flags.
- [ ] **Enable `signals-scout-experiments`** if you run A/B experiments.
- [ ] **Enable `signals-scout-surveys`** if you add PostHog surveys.
- [ ] **Enable `signals-scout-replay-vision`** once Replay Vision scanners have accumulated several days of observations — this scout reads trends across aggregated data, not individual recordings.
- [ ] **Create saved funnels** in PostHog for your core flows (bargain → bill) so `signals-scout-product-analytics` has flows to watch. Until then it will find little to report.
- [ ] **Connect an issue tracker** (GitHub Issues, Linear, Jira) via https://eu.posthog.com/project/234247/pipeline/new/source when ready — Self-driving will then read open issues and open draft PRs for what it can fix automatically ($15/PR).
- [ ] **Verify Replay Vision credit spend** once recordings begin — the sizing tool was unavailable during setup.

---

## What happens next

The scout coordinator picks up fresh configs within ~30 minutes. Each enabled scout draws from the project's 100 runs/day budget. Findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/234247/inbox); immediately actionable ones can start coding tasks. The two Replay Vision scanners will begin watching sessions as soon as recordings start arriving.
