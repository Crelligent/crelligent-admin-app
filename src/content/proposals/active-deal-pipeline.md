# Active Deal Pipeline — Five Live Engagements

This document maps every current live deal through the Crelligent framework — the correct business unit assignment, the three-domain analysis, the ESRE engagement structure, the clarifications you must get before committing to a scope, the actions you must take next, and the full commercial proposal structure. This is your operational deal bible.

> "Every deal you walk into is a system. Map the whole system before you design any part of it."

## Pipeline Summary

| Deal | Business Unit | Est. Value | Priority | Immediate Next Action |
| :--- | :--- | :--- | :--- | :--- |
| **ESN Biometric Platform** | Enterprise | ₦55–100M | HIGH — Fast close | Propose Architecture Sprint before build |
| **ESN Fuel Card / Fleet Mgt** | Edge | ₦50–120M + SaaS | HIGHEST — Full flywheel | Conduct Edge Deployment Scoping Session |
| **Geo-Roam Tourism App** | Enterprise | ₦20–35M | MEDIUM — Validate model | Run Business Model Sprint first |
| **MyBusTicket Nigeria** | Enterprise | ₦60–120M | HIGH — Equity upside | Stakeholder mapping + operator strategy |
| **CallMed Healthcare** | Foundry | ₦18–35M + equity | HIGH — Model critical | Business model validation sprint |

---

## Deal 1 — ESN Multi-Institution Biometric Identity Management Platform

**Business Unit:** Crelligent Enterprise  |  **Domains:** All Three — Software Systems Dominant

### Deal Context

ESN operates a member-based organization that currently relies on external fingerprint launchers, manual photo editing, and manual submission of enrollment data to SecureID for card production. They have produced a 1-page PRD scoping five applications: an Android enrollment app, an admin web portal, an institution web portal, a member self-service portal, and a SecureID integration module.

The brief is technically coherent and well-scoped at the software level. However, it is entirely a Software Systems document. The Business Systems and Enterprise/IT Systems layers have not yet been designed — which means if Crelligent only builds what is in the PRD, it will build a technically functional platform sitting on top of an undesigned commercial and governance model. That is a recipe for a system that works in demo but fails in deployment.

**Crelligent's assignment:** design and build the complete three-domain system — not just the five applications.

### Three-Domain Analysis

**Business Systems — Currently Missing from the Brief**

This is the most important domain for ESN to get right — and it is completely absent from the current PRD:

- **Commercial model:** Is this platform purely internal to ESN, or is ESN intending to offer biometric identity services to other institutions commercially? If the latter, what is the pricing model — per-institution subscription, per-enrollment fee, annual license?
- **Governance and ownership:** Who legally owns the biometric data of enrolled members? What is ESN's liability if data is breached or misused? What consent architecture is required at enrollment?
- **Institutional onboarding model:** How does a new institution get access to the platform? What is the approval process, the technical onboarding sequence, and the commercial terms?
- **SecureID commercial relationship:** What is the current commercial arrangement between ESN and SecureID? Does the platform change that arrangement, and if so, how?
- **Scalability intent:** The PRD mentions "unions, associations, enterprises, and government-linked institutions" as future beneficiaries. Is this a stated expansion plan or an aspiration? The architecture decisions depend entirely on the answer.

**Enterprise/IT Systems — Partially Present**

- **Data residency:** Where does biometric data live — on-premise at ESN, in a Nigerian data centre, or in international cloud infrastructure? NDPR has specific requirements for biometric data.
- **Security architecture:** What encryption standards govern biometric data at rest and in transit? What is the access control model?
- **Audit trail:** Every access to a biometric record must be logged. What is the audit architecture?
- **Disaster recovery:** What happens to biometric enrollment operations if the central backend goes offline?
- **SecureID integration architecture:** Is the integration a file-based batch transmission, a real-time API push, or a webhook model?

**Software Systems — Well Scoped in PRD**

The five applications are clearly defined. The consent capture flow at enrollment and the data access permission model across institution tiers need designing before UI development begins.

### Clarifications Required Before Committing to Scope

1. Is this platform intended to be ESN-internal only, or is commercial licensing to other institutions part of the plan within 24 months? This single answer changes the architecture and the fee by approximately 40%.
2. What is the current data protection and privacy compliance position of ESN? Have they conducted a NDPR audit?
3. What devices are ESN currently using for fingerprint capture, and what is the budget for new enrollment tablet hardware?
4. What is the current SecureID integration format — batch file, API, or manual upload?
5. Is there an existing member database that needs to be migrated into the new platform, or is this a greenfield enrollment?
6. Who within ESN is the technical owner of this platform post-deployment?
7. What is the procurement timeline and decision-making process?

### Commercial Structure

| Engagement Phase | Timeline | Investment (₦) |
| :--- | :--- | :--- |
| **Architecture Clarification Session** | 1 week | Included in Architecture Sprint |
| **Phase A — Architecture Sprint** | 4–6 weeks | ₦10,000,000–₦18,000,000 |
| **Phase B — Platform Build (5 applications)** | 16–24 weeks | ₦40,000,000–₦75,000,000 |
| **SecureID Integration Module** | Within Phase B | Included |
| **Post-Launch Support & Maintenance** | Monthly, ongoing | ₦1,500,000–₦3,000,000/mo |
| **TOTAL (Phase A + B)** | **5–7 months** | **₦50,000,000–₦93,000,000** |

### Risks & Watch-outs
- NDPR compliance is non-negotiable for biometric data. If ESN is not currently compliant, this could delay the project.
- SecureID integration is a dependency you do not control. Include a clause protecting Crelligent's timeline against SecureID API access delays.
- Offline sync for biometric data is technically complex. Budget development time explicitly.

---

## Deal 2 — ESN Fuel Card Reporting & Fleet Management Platform

**Business Unit:** Crelligent Edge  |  **Domains:** All Three — Edge/IoT Core, Software Intelligence Layer

### Deal Context — Why This Is the Most Strategically Important Deal

This is Crelligent's first genuine Edge engagement — and it matters enormously beyond its individual fee. It is the deal that proves the Edge capability in the market, generates the first recurring SaaS revenue, and creates the hardware proof point that unlocks future Edge conversations.

The concept: IoT devices are physically installed in client vehicles. These devices transmit real-time data — location, fuel consumption, engine status, speed, and driver behaviour — from the vehicle directly to a centralized intelligence dashboard. The fuel card reporting layer adds the financial dimension: connecting what the vehicle actually consumed against what was purchased on the fuel card to identify discrepancies, fraud, and waste.

This is not a software project with some hardware attached. It is a hardware-led intelligence system with a software interface.

### Three-Domain Analysis

**Business Systems — The Operating Model Behind the Fleet**

- **Fleet governance:** Who is responsible for fuel approval and spend authorization today? What accountability exists at the driver level?
- **Fuel card commercial model:** What fuel card provider does the client use? What data does the provider capture and in what format?
- **Incident response model:** When a fuel discrepancy is detected — what is the operational response process?
- **Performance management:** How are drivers currently evaluated? The platform can generate driver scorecards but they are only useful if the HR process is designed to use them.
- **Maintenance model:** Is the client currently running reactive or preventive maintenance?

**Enterprise/IT Systems — The Data Architecture**

- **IoT device data streams:** GPS coordinates (every 30 seconds), fuel sensor readings (continuous), engine diagnostics (OBD-II), speed and acceleration data, door sensor events. All flowing via cellular (4G/LTE) or GPRS.
- **Fuel card transaction data:** Imported via API or CSV batch upload. Must be matched against IoT fuel sensor readings to identify discrepancies.
- **Data storage and retention:** Regulatory requirements, insurance terms, and internal audit requirements may all have different retention periods.
- **Dashboard architecture:** Real-time view (live map), operational view (trips, routes, stops), financial view (fuel spend vs. consumption), and historical analysis (trends, driver scoring, maintenance alerts).
- **Alert engine:** Route deviation, fuel discrepancy, engine temperature, geofence violations. Each alert has a recipient, delivery channel, and escalation path.

**Software Systems — The Intelligence Platform**

- **Live Fleet Map:** Real-time vehicle positions, colour-coded by status. Clickable vehicle cards.
- **Trip Management:** Automatic trip detection, route replay, stop analysis.
- **Fuel Intelligence Module:** Fuel purchased vs. fuel consumed per vehicle per period. Discrepancy flagging with severity rating.
- **Driver Scorecard:** Speed compliance, harsh braking, harsh acceleration, idle time, route adherence.
- **Maintenance Alerts:** Engine diagnostic codes translated into plain-language maintenance recommendations.
- **Executive Dashboard:** Total fleet utilisation %, total fuel spend, discrepancies detected, cost per kilometre.

### Clarifications Required Before Committing to Scope

1. Fleet size and vehicle types?
2. Current fuel card provider and data API availability?
3. Vehicle age and OBD-II compatibility?
4. Existing GPS or tracking systems?
5. Geographic operating area and connectivity coverage?
6. Data ownership and driver privacy considerations?
7. Fuel tank configuration (single, dual, auxiliary)?
8. Client workshop capacity for device installation?

### Commercial Structure

| Engagement Phase | Timeline | Investment (₦) |
| :--- | :--- | :--- |
| **Phase 1 — Scoping & Operating Model** | 3–4 weeks | ₦8,000,000–₦15,000,000 |
| **Phase 2 — Hardware Procurement & Install** | 4–6 weeks | ₦15,000,000–₦45,000,000 |
| **Phase 3 — Platform Build & Integration** | 8–12 weeks | ₦18,000,000–₦35,000,000 |
| **Phase 4 — Edge SaaS (per vehicle/month)** | Ongoing | ₦80,000–₦200,000/vehicle/mo |
| **Example: 50-vehicle fleet** | 5–6 months | ₦41M–₦95M upfront + ₦4M–₦10M/mo |
| **Example: 200-vehicle fleet** | 6–8 months | ₦75M–₦150M upfront + ₦16M–₦40M/mo |

### The Recurring Revenue Mathematics

A 50-vehicle fleet at ₦150,000 per vehicle per month generates **₦7.5M per month** — **₦90M per year** from a single client. A 200-vehicle fleet generates **₦30M per month** — **₦360M per year**. This single engagement, properly structured, can generate more annual recurring revenue than all of your Year 1 project fees combined. **Protect the SaaS pricing. Do not discount it.**

### Risks & Watch-outs
- Device theft and tampering. Specify tamper-evident enclosures and include a device replacement policy in the SaaS contract.
- Cellular connectivity gaps. Build offline buffering into the device firmware.
- Driver resistance. Work with the client on change management communication before installation.
- Fuel card provider API access. Confirm before signing the contract.

---

## Deal 3 — Geo-Roam: Tourism Discovery & Gamification Mobile App

**Business Unit:** Crelligent Enterprise  |  **Domains:** Business Systems (Critical) + Software Systems

### Deal Context

Geo-Roam is a proposed mobile application that gamifies tourism discovery — rewarding users for visiting landmarks, completing challenges, and exploring destinations across Nigeria and potentially broader Africa.

This is an Enterprise engagement because the client needs more than an app. They need a complete product strategy, a business model, a content partner strategy, and a go-to-market plan — before any code is written.

### Three-Domain Analysis

**Business Systems — The Most Critical Layer**

Four viable commercial models, each requiring fundamentally different architecture:

| Model | Description | Assessment |
| :--- | :--- | :--- |
| **Model A — B2C Premium** | Users pay for premium features | Challenging — low willingness to pay for apps in Nigeria |
| **Model B — B2B2C** | Tourism operators pay for listings and promotion | Most commercially robust for the Nigerian market |
| **Model C — B2G** | Government tourism boards sponsor the platform | Strong launch capital but less scalable |
| **Model D — Transaction-based** | Booking commissions | Requires deep integration; best as Year 2 addition |

**Crelligent's recommendation:** Model B as primary revenue engine, Model C as launch funding mechanism, Model D as Year 2 addition.

### Crelligent's Honest Recommendation

Do not accept a build brief for Geo-Roam without a Business Model Sprint first. A 4-week Business Model Sprint (₦3–5M) will either validate the concept or reveal that the model needs significant pivoting. Either outcome is worth more than the sprint fee.

### Commercial Structure

| Engagement Phase | Timeline | Investment (₦) |
| :--- | :--- | :--- |
| **Business Model Sprint** | 4 weeks | ₦3,000,000–₦5,000,000 |
| **Product Architecture & Design** | 3–4 weeks | ₦5,000,000–₦10,000,000 |
| **MVP Build (iOS + Android + CMS)** | 12–16 weeks | ₦15,000,000–₦28,000,000 |
| **Operator Onboarding & Launch Support** | 4 weeks | ₦3,000,000–₦5,000,000 |
| **Platform Hosting & Support (monthly)** | Ongoing | ₦800,000–₦1,500,000/mo |
| **TOTAL (sprint through launch)** | **5–6 months** | **₦26,000,000–₦48,000,000** |

---

## Deal 4 — MyBusTicket Nigeria

**Business Unit:** Crelligent Enterprise  |  **Estimated Value:** ₦60–120M  |  **Priority:** HIGH — Equity upside

*Detailed deal brief to be completed after stakeholder mapping and operator strategy session.*

---

## Deal 5 — CallMed: Digital Health & Telemedicine Platform

**Business Unit:** Crelligent Foundry  |  **Domains:** All Three — Business Systems and Compliance Critical

### Deal Context

CallMed is a digital health startup seeking to build a telemedicine and healthcare access platform for the Nigerian market. Nigeria has approximately 40,000 registered doctors for 220 million people — a doctor-to-patient ratio of approximately 1:5,500 against the WHO recommendation of 1:600.

CallMed falls under Crelligent Foundry because this is a venture creation engagement — Crelligent is not just building technology for an existing business, it is co-creating a new company.

**The most important thing to understand:** the technology is the easy part. The hard parts are the commercial model, the provider acquisition strategy, and the regulatory pathway — and all three must be resolved before architecture begins.

### Three-Domain Analysis

**Business Systems — The Most Regulated and Most Complex**

- **Commercial model — who pays:** (1) B2C — patients pay per consultation. Challenging. (2) B2B — employers pay per-employee health subscription. **Strong model.** (3) HMO partnerships — included in benefit packages. (4) B2G — government health agencies as payor. **Recommended: B2B as primary revenue, B2C as secondary.**
- **Provider acquisition and compensation:** How are doctors recruited? How are they compensated? What is the minimum viable provider network size?
- **Regulatory compliance:** MDCN (medical practice), NHIA (health insurance claims), NAFDAC (prescription/dispensing). All three must be mapped before architecture begins.
- **Liability model:** Professional indemnity insurance for telemedicine in Nigeria is nascent. Must be addressed in the legal structure.

**Enterprise/IT Systems — Compliance-Driven Architecture**

- **Patient data architecture:** EHR encrypted at rest and in transit. Granular access controls. NDPR standard, ideally ISO 27001.
- **Prescription management:** Electronic prescriptions trigger NAFDAC compliance. Doctor's MDCN registration must be verifiable.
- **Teleconsultation infrastructure:** Video, audio, and secure messaging. HIPAA-comparable security standard.
- **EHR integration:** API integration capability for corporate clients.

**Software Systems — The Patient and Provider Product**

- **Patient app:** Registration, appointment booking, teleconsultation, prescription viewing, health records, payment.
- **Provider app:** Patient queue, consultation tools, availability management, earnings dashboard.
- **Corporate admin portal:** Employee registration, usage analytics, billing.
- **Admin dashboard:** Provider credential verification, platform monitoring, dispute resolution.

### Crelligent's Recommendation

Foundry Tier 2 Engagement with a mandatory 6-week Business Model and Regulatory Sprint before any design or development. Three outputs: validated commercial model with LOIs, regulatory compliance roadmap, and regulation-compliant platform architecture brief.

### Commercial Structure

| Engagement Phase | Timeline | Investment (₦) / Terms |
| :--- | :--- | :--- |
| **Business Model & Regulatory Sprint** | 6 weeks | ₦4,000,000–₦7,000,000 |
| **Platform Architecture & UX Design** | 3–4 weeks | ₦5,000,000–₦10,000,000 |
| **MVP Build (patient app, provider app, admin)** | 14–18 weeks | ₦15,000,000–₦28,000,000 |
| **Launch Support & Compliance Monitoring** | 4 weeks | ₦3,000,000–₦5,000,000 |
| **Platform Hosting & Support (monthly)** | Ongoing | ₦1,000,000–₦2,500,000/mo |
| **Equity Stake (Crelligent Foundry)** | At contract signing | 8%–15% of equity |
| **TOTAL CASH (sprint through launch)** | **6–7 months** | **₦27,000,000–₦50,000,000** |

### Risks & Watch-outs
- Provider adoption is the hardest problem. The provider experience must be as carefully designed as the patient experience.
- Consumer trust in telemedicine is still developing. Clear escalation protocol for in-person follow-up is essential.
- Data breach exposure is existential for a health platform. Security must be designed in from day one.
- Pharmacy integration requires NAFDAC compliance. Strongly recommend excluding from MVP.

---

## Consolidated Action Summary — Next 7 Days

| Deal | Your #1 Action This Week | Deadline | Expected Output |
| :--- | :--- | :--- | :--- |
| **ESN Biometric** | Send Architecture Clarification Questions document. Request 90-min session. | 48 hours | Session booked, questions answered |
| **ESN Fuel Card / Fleet** | Contact IoT Engineer contractor. Schedule 3-hour Edge Scoping Session. | This week | Contractor briefed, session confirmed |
| **Geo-Roam** | Schedule Business Model Discovery Call. Present case for Sprint. | This week | Client decision: Sprint yes/no |
| **MyBusTicket** | Request deep-dive with founding team. Prepare operator acquisition questions. | This week | Team assessed, Phase 1 proposal drafted |
| **CallMed** | Schedule founding team meeting. Assess medical involvement and capital. | This week | Go/no-go decision on proceeding |

> "The deals in this pipeline, properly designed and delivered, represent between ₦203M and ₦403M in Year 1 cash revenue plus equity stakes in three ventures. The difference between realising that and falling short of it is the discipline of systems thinking applied before the first line of code is written."
