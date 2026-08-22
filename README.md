[README.md](https://github.com/user-attachments/files/31328176/README.md)
# Compliance layer — integration guide

An additive package. Nothing here modifies existing markup. Add the pieces you need,
ignore the rest.

Built for the **cosmetic lane** by default (Gate 0 → cosmetic). The therapeutic
components are present but off, and stay off unless the goods are ARTG-listed.

```
compliance-layer/
├─ compliance/
│  ├─ compliance-layer.css     styling, scoped to .cmp-* and .lgl-*
│  ├─ compliance-layer.js      drop-in components + consent + price audit
│  └─ claim-guard.js           runtime scan for boundary-crossing language
└─ legal/
   ├─ terms-of-sale.html
   ├─ privacy-policy.html
   ├─ returns-and-refunds.html
   └─ shipping-and-delivery.html
```

---

## 1. Wire it up

Copy `compliance/` and `legal/` into your publish directory, then add two lines to
your base template:

```html
<link rel="stylesheet" href="/compliance/compliance-layer.css">
<script src="/compliance/compliance-layer.js" defer></script>
```

Configure before the script loads:

```html
<script>
window.COMPLIANCE_CONFIG = {
  entity: "Your Pty Ltd",
  abn: "12 345 678 901",
  email: "hello@example.com.au",
  legalBase: "/legal/",
  therapeutic: false,        // true ONLY for ARTG-listed goods
  warrantyOffered: false,    // true only if you offer a voluntary warranty
  consent: true
};
</script>
```

`therapeutic: false` is the safe default and should stay false unless you hold an
ARTG number. Setting it true renders a mandatory statement that itself asserts the
product is a therapeutic good.

---

## 2. Mount components

Drop an empty div wherever you want a block. It fills itself.

| Mount | Renders | Audit item |
|---|---|---|
| `<div data-compliance="guarantees"></div>` | Consumer guarantees notice | B.2 |
| `<div data-compliance="warranty"></div>` | Prescribed warranty wording | B.4 |
| `<div data-compliance="reviews-policy"></div>` | Review handling policy | B.9 |
| `<div data-compliance="mandatory-statement"></div>` | TGA mandatory statement | A.3 |

Recommended placement:

- **Guarantees** — product page below the buy control, and in the footer of terms.
- **Reviews policy** — top of the reviews section on each product page.
- **Mandatory statement** — *immediately above* the buy control. Code s 20 requires
  prominence, and TGA guidance treats footer or accordion placement as non-compliant.
  Never in a collapsed element.

The consent banner and price audit mount automatically.

---

## 3. Claim guard

Add to product and content pages:

```html
<script src="/compliance/claim-guard.js" defer></script>
```

It scans rendered text on load, logs findings to the console, and mounts a visible
panel when you append `?claimguard=1` to the URL.

Three severities:

- **FATAL** — moves the product across the classification line. `heals`, `repairs`,
  `regenerates`, `anti-inflammatory`, named conditions, dosing content, and reliance
  on "research use only".
- **HIGH** — penalty exposure as drafted. `no refunds`, `+ GST`, `guaranteed results`,
  incentivised reviews.
- **REVIEW** — lawful in some framings, needs a human decision. `anti-ageing`,
  `clinically proven`, scarcity devices.

Extend it:

```js
ClaimGuard.add({
  re: /\bplumps?\b/i,
  sev: "REVIEW",
  why: "Fine for appearance. Defect if paired with a mechanism claim.",
  auth: "TG Act s 3(1)(b)"
});
ClaimGuard.check();   // rescan after dynamic content loads
```

Exclude a region — a legislative quote, for instance:

```html
<blockquote data-claimguard-ignore>…</blockquote>
```

**A clean scan is not a clearance.** The register catches what it has a term for.
It cannot read a claim it has never seen.

---

## 4. Placeholders

Every legal page carries `{{PLACEHOLDERS}}`. The console logs an error naming any
that survive to production — a legal page with an unfilled placeholder is worse than
no page, because it evidences an unfinished process.

Find and replace across `legal/`:

**Entity** — `ENTITY_NAME` `ABN` `REGISTERED_ADDRESS` `CONTACT_EMAIL` `CONTACT_PHONE` `SITE_DOMAIN` `LAST_UPDATED`

**Returns** — `RESPONSE_DAYS` `REFUND_DAYS` `COOLING_OFF_DAYS` `TRANSIT_DAYS` `HYGIENE_EXCLUDED_CATEGORIES` `WARRANTY_DURATION_AND_SCOPE`

**Privacy** — `PAYMENT_PROCESSOR` `PAYMENT_COUNTRY` `HOSTING_PROVIDER` `HOSTING_COUNTRY` `FULFILMENT_PROVIDER` `EMAIL_PROVIDER` `EMAIL_COUNTRY` `ANALYTICS_PROVIDER` `ANALYTICS_COUNTRY` `RETENTION_ORDERS` `RETENTION_ENQUIRIES` `UNLESS_ADVERTISING`

**Shipping** — `SHIPPING_DESTINATIONS` `CUTOFF_TIME` `DISPATCH_WINDOW` `TRANSIT_MELB` `TRANSIT_VIC` `TRANSIT_INTERSTATE` `TRANSIT_REMOTE` `COST_MELB` `COST_VIC` `COST_INTERSTATE` `COST_REMOTE` `FREE_SHIPPING_THRESHOLD` `TRACKING_GRACE`

**Terms** — `PRODUCT_DESCRIPTION_STATEMENT`

Two `.lgl-key` drafting notes are marked delete-before-publishing. The one in
`privacy-policy.html` requires a decision on Privacy Act coverage — resolve it, don't
delete it unread.

---

## 5. What this package does not do

- **It does not decide Gate 0.** Classification is a product question. If the goods
  are unapproved therapeutic goods, none of this reaches the problem.
- **It is not a substitute for the audit.** Run `compliance-instrument.html` against
  the live site and record the determination.
- **It is not legal advice**, and the drafting has not been settled by a lawyer.
  Have the four legal pages reviewed before they go live — they are the documents a
  regulator reads first.

---

## 6. Verify after deploying

```
/legal/terms-of-sale.html?claimguard=1
/legal/privacy-policy.html?claimguard=1
/legal/returns-and-refunds.html?claimguard=1
/legal/shipping-and-delivery.html?claimguard=1
```

Then every product page. Console should show no unresolved placeholders and no FATAL
findings. Save a dated export from the audit instrument once it's clean.
