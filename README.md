# Turn Event Registrations into a Person-Centric Membership Engagement Database

![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform: Browser + Excel](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-green.svg)
![Tool Type: Membership Engagement Analytics](https://img.shields.io/badge/Tool-Decision%20Support-orange.svg)

**Track lifetime participation history, identify member churn risk, discover high-potential non-members, and analyze community engagement trends — using a free browser version or a reusable Excel workbook, with no signup and no installation required.**

> ## **No signup. No installation. Free.**
>
> 🌐 **Open in Browser** → [here](https://hyvoid.github.io/Membership-Engagement-Analytics-Workspace/)
>
> 📥 **Download Excel** → *GitHub Releases / Gumroad (Coming Soon)*

---

## Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Interactive membership engagement dashboard showing participation trends, engagement scores, churn risk, and event retention analysis.*

### Excel Version

<!-- screenshot: excel version -->

*Operational workbook showing attendee history, event participation ledger, member scoring engine, and organizational engagement analytics.*

---

## What It Helps You Track

* Complete lifetime participation history for every member and non-member.
* Members showing early signs of disengagement before renewal failure occurs.
* Non-members with participation patterns indicating strong membership conversion potential.
* Event formats that generate long-term community retention rather than one-time attendance.
* Individual engagement trajectories across months and years.
* Actual attendee participation instead of distorted purchaser-level registration records.

---

# Why I Built This

Most nonprofit organizations do not actually have an event management problem.

They have an institutional memory problem.

Organizations often run dozens or hundreds of events over multiple years. Registration systems successfully collect payments, issue tickets, and track attendance for individual events. However, they frequently fail to answer the question that matters operationally:

> **What is this person's long-term relationship with our community?**

I repeatedly observed nonprofit teams making membership decisions using fragmented information:

* separate spreadsheets for each event;
* registration systems tracking purchasers rather than attendees;
* no consolidated participation history;
* no objective measurement of engagement or attrition.

The resulting analytical failure is subtle but costly:

```
Event-centric thinking
```

instead of:

```
Person-centric relationship analysis
```

### Before

A nonprofit administrator asks:

> "Has Mary been actively engaged over the last two years?"

The answer requires manually opening:

* Event A spreadsheet;
* Event B spreadsheet;
* Event C spreadsheet;
* donor database;
* membership records.

The result is usually an estimate.

### After

The same question becomes:

| Person     | Lifetime Events | Last Event | Last 12 Months | Engagement Score | Churn Risk |
| ---------- | --------------: | ---------- | -------------: | ---------------: | ---------- |
| Mary Smith |              18 | May 2026   |              7 |               84 | Low        |

Decision quality changes immediately.

This workbook is therefore not an event tracker.

It is a **productized engagement reasoning framework** that converts fragmented attendance records into a continuously growing community relationship database.

---

## Common Nonprofit Membership Problems This Solves

| Problem                                                        | Without This Tool                                    | With This Tool                                             |
| -------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Event attendance exists only per event                         | Historical participation disappears after each event | Every attendee accumulates a lifetime participation record |
| Purchaser and attendee are treated as the same person          | Group registrations distort engagement metrics       | Individual attendee records remain intact                  |
| Membership renewal decisions rely on intuition                 | High-risk members are identified too late            | Churn indicators are continuously monitored                |
| Non-member engagement is invisible                             | Potential members are missed                         | Conversion candidates are automatically identified         |
| Event effectiveness cannot be measured longitudinally          | Event planning relies on anecdotal evidence          | Retention and participation impact become measurable       |
| Historical reporting requires manual spreadsheet consolidation | Staff time is consumed by reconciliation             | Participation history is continuously maintained           |

---

## Who This Is For

This tool is designed for:

* nonprofit organizations with 500–1500 contacts;
* professional associations;
* member communities;
* chambers of commerce;
* volunteer organizations;
* educational and networking groups running recurring events.

Particularly useful when:

* event registrations occur in tools such as DonorBox, TicketTailor, Luma, Jotform, or Eventbrite;
* budget constraints prevent purchasing enterprise AMS platforms;
* membership engagement matters more than event revenue.

This tool is **not** designed for:

* enterprise CRM replacement;
* full association management systems;
* real-time customer data platforms;
* large-scale ticketing operations.

**No spreadsheet expertise is required. Open the browser version or Excel workbook and begin tracking participation history immediately.**

---

## About

I build lightweight decision-support tools for situations where there are simply too many moving parts to hold in your head.

The question I repeatedly ask is:

> **"What information needs to exist in one place to make the next decision confidently?"**

This membership engagement analytics workbook is one example of that approach: converting fragmented operational data into a reusable decision framework rather than building another software platform.

---

## Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

---

### Workbook Architecture

| Layer         | Worksheet            | Purpose                            |
| ------------- | -------------------- | ---------------------------------- |
| Configuration | Parameters           | Engagement rules and scoring logic |
| Master Data   | Contacts             | Unified member/non-member identity |
| Master Data   | Events               | Event catalog                      |
| Transaction   | Attendance Ledger    | Person-event participation records |
| Analytics     | Participation Engine | Historical calculations            |
| Analytics     | Engagement Engine    | Scoring calculations               |
| Output        | Dashboard            | Operational reporting              |

#### Data Flow

```text
Parameters
      ↓
Contacts Master
      ↓
Events Master
      ↓
Attendance Ledger
      ↓
Participation Engine
      ↓
Engagement Scoring
      ↓
Management Dashboard
```

#### Validation Flow

```text
Attendee Identity Validation
            ↓
Duplicate Detection
            ↓
Event Mapping
            ↓
Attendance Verification
            ↓
Engagement Calculation
            ↓
Dashboard Publication
```

---

### Three Traps That Catch Even Experienced Membership Managers

#### Trap 1 — Measuring Event Attendance Instead of Member Engagement

A decision was made:

> "This member is inactive."

The decision relied on:

> Attendance count alone.

| Metric                  | Value |
| ----------------------- | ----- |
| Events Attended         | 2     |
| Volunteer Activities    | 8     |
| Committee Participation | Yes   |

The recommendation becomes:

```text
Do not renew engagement efforts.
```

This reasoning fails because participation frequency is not equivalent to organizational engagement.

Correct approach:

```text
Engagement =
40% Recency
+30% Frequency
+20% Membership Status
+10% Participation Diversity
```

Correct outcome:

```text
Member classified as highly engaged.
```

<details>
<summary>Formula Reference</summary>

```excel
=(RecencyScore*0.4)+
(FrequencyScore*0.3)+
(MemberScore*0.2)+
(DiversityScore*0.1)
```

</details>

---

#### Trap 2 — Assuming Ticket Purchasers Equal Attendees

A decision was made:

> "Tom attended five events."

The decision relied on:

```text
Purchaser record
```

Actual attendance:

| Person |
| ------ |
| Tom    |
| Jane   |
| Mike   |
| Lisa   |
| Peter  |
| David  |

Incorrect recommendation:

```text
Tom is our most engaged participant.
```

Why this fails:

Purchaser data represents payment behavior, not participation behavior.

Correct approach:

```text
One attendee
        ↓
One participation record
```

Correct outcome:

```text
Participation analytics become statistically valid.
```

<details>
<summary>Formula Reference</summary>

```excel
=XLOOKUP(
AttendeeID,
Contacts[ID],
Contacts[MemberStatus]
)
```

</details>

---

#### Trap 3 — Using Lifetime Counts Without Recency Weighting

A decision was made:

> "John remains a highly active member."

The decision relied on:

| Lifetime Attendance | Last Attendance |
| ------------------- | --------------- |
| 35                  | 3 years ago     |

Incorrect conclusion:

```text
Low churn risk.
```

Why this fails:

Historical participation decays in predictive value.

Correct approach:

| Last Attendance | Recency Score |
| --------------- | ------------- |
| <90 days        | 100           |
| 90–180 days     | 70            |
| 180–365 days    | 40            |
| >365 days       | 10            |

Correct outcome:

```text
High churn risk identified.
```

<details>
<summary>Formula Reference</summary>

```excel
=IFS(
Days<90,100,
Days<180,70,
Days<365,40,
TRUE,10
)
```

</details>

---

### Example Scenario

A nonprofit networking association maintains:

* 1,200 contacts;
* 420 active members;
* 35 annual events.

Raw participation data:

| Person | Status     | Events (12M) | Last Event | Event Types |
| ------ | ---------- | -----------: | ---------- | ----------- |
| Sarah  | Member     |            8 | 14 days    | 4           |
| James  | Member     |            2 | 420 days   | 1           |
| Alice  | Non-member |            7 | 30 days    | 3           |

Intermediate calculations:

| Person | Recency | Frequency | Diversity | Score |
| ------ | ------: | --------: | --------: | ----: |
| Sarah  |     100 |        90 |        90 |    92 |
| James  |      10 |        20 |        20 |    16 |
| Alice  |      90 |        80 |        70 |    78 |

Interpretation:

* Sarah represents a core community member.
* James shows severe disengagement risk.
* Alice demonstrates strong conversion potential.

Recommendation:

```text
Sarah:
Invite to leadership activities.

James:
Launch retention outreach campaign.

Alice:
Initiate membership conversion process.
```

Decision implication:

Instead of treating attendance as historical reporting, participation history becomes an operational asset supporting retention, conversion, and community growth.

---

### Formula Reference

<details>
<summary>Participation Metrics</summary>

```excel
=COUNTIFS()
=MAXIFS()
=SUMIFS()
=UNIQUE()
=FILTER()
```

</details>

<details>
<summary>Engagement Scoring</summary>

```excel
=IFS()
=LET()
=LAMBDA()
=SWITCH()
```

</details>

<details>
<summary>Identity Resolution</summary>

```excel
=XLOOKUP()
=XMATCH()
=TEXTJOIN()
```

</details>

<details>
<summary>Dashboard Analytics</summary>

```excel
=PIVOTTABLE()
=GETPIVOTDATA()
=SPARKLINE()
```

</details>

---

### Validation Rules

| Field                 | Rule                            | Error Behavior       |
| --------------------- | ------------------------------- | -------------------- |
| ContactID             | Must be unique                  | Duplicate warning    |
| Email                 | Valid email format              | Validation error     |
| EventID               | Must exist in event master      | Record rejection     |
| Attendance Status     | Enumerated values only          | Input blocked        |
| Membership Status     | Member/Non-member only          | Validation error     |
| Event Date            | Valid date required             | Calculation excluded |
| Engagement Score      | Range 0–100                     | Recalculated         |
| Participation History | Duplicate attendance prohibited | Duplicate flagged    |

</details>

---

## Other Tools in This Series

* **Inventory Planning & Replenishment Control Console** — optimize purchasing decisions under uncertainty.
* **VAT Compliance Analytics Dashboard** — calculate and audit multi-channel VAT obligations.
* **Project Time Allocation & Cost Analysis Workbook** — track labor utilization and project profitability.
* **Marketing ROI Audit Engine** — identify attribution distortion and campaign efficiency.

More tools available via GitHub profile and publication repository.

---

## License

This project is licensed under the **Apache License 2.0**.

See the `LICENSE` file for details.
