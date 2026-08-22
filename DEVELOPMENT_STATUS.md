# AuraLabs Storefront — Development Status

Last updated: 22 August 2026  
Current legal-document version: 0.9  
Repository: `gtgspot/auralabs`

## Development principle

The platform is under active development. Existing HTML design, catalogue, cart, local-storage behaviour, promotional interactions and simulated checkout are to be preserved unless a later change is expressly approved. New work should build on top of the current implementation.

An unchecked item is not represented as complete. Unknown business particulars, regulatory classifications and evidence-dependent claims must not be guessed.

## Implemented

- [x] Existing single-page storefront design retained.
- [x] Existing product catalogue, filtering, cart and local-storage behaviour retained.
- [x] Existing promotional email and simulated checkout interactions retained.
- [x] Legal & Compliance Centre added without replacing the storefront.
- [x] Draft Terms of Service added.
- [x] Draft Refund Policy addressing Australian Consumer Law rights added.
- [x] Draft Privacy Policy added.
- [x] Draft TGA and research-information notice added.
- [x] Footer legal links connected to the relevant documents.
- [x] Checkout consent connected to the Terms and Refund Policy.
- [x] Email-promotion notice connected to the Terms and Privacy Policy.
- [x] Fictitious ABN removed and replaced with an explicit verification placeholder.
- [x] Unresolved particulars visibly marked inside the legal documents.

## Required business particulars

- [ ] Confirm the legal entity name.
- [ ] Confirm and independently verify the ABN.
- [ ] Insert the business and postal addresses.
- [ ] Establish the legal contact email.
- [ ] Decide whether voluntary change-of-mind returns are offered and, if so, the period and conditions.
- [ ] Establish the returns email, returns authorisation/address process and response target.
- [ ] Nominate the privacy contact and privacy email.
- [ ] Nominate the regulatory responsible person and regulatory email.

## Privacy and service-provider configuration

- [ ] Identify every enabled cookie, analytics, advertising and personalisation tool.
- [ ] Select and identify the production payment provider.
- [ ] Create a verified production-provider register covering hosting, payments, fulfilment, communications, analytics and security services.
- [ ] Confirm overseas disclosure/storage countries or approve an accurate disclosure where countries cannot practicably be specified.
- [ ] Confirm retention, deletion, access/correction and complaint-handling procedures match actual operations.

## Product and regulatory work

- [ ] Create a product-by-product classification and regulatory-status register.
- [ ] Record supporting ARTG, AUST L or AUST R evidence where applicable; do not imply inclusion where none exists.
- [ ] Verify the lawful Australian supply pathway for every listed product.
- [ ] Review every therapeutic, clinical, efficacy, purity, laboratory-testing, Australian-ownership and TGA-related claim against retained evidence.
- [ ] Specifically verify or revise the visible claims `TGA Compliant Formulations`, `HPLC Verified`, `>99% Purity standard`, `Lab Tested`, `Clinical Grade` and `Australian Owned`.
- [ ] Record the date on which the product-status register was last verified.
- [ ] Obtain Australian legal/regulatory review before enabling public commerce for regulated or therapeutic products.

## Commerce and technical work

- [ ] Replace placeholder product imagery and confirm licences for production assets.
- [ ] Connect catalogue data to the intended production API or database.
- [ ] Implement a real server-side checkout and payment flow; the current checkout is a simulation.
- [ ] Implement server-side order validation, inventory checks, pricing validation and tax/shipping calculation.
- [ ] Define the Cloudflare Worker/API architecture and authentication controls.
- [ ] Create and migrate the D1 schema only after the production data model is approved.
- [ ] Add order, payment and fulfilment audit logging.
- [ ] Configure transactional email and customer-support workflows.
- [ ] Add automated accessibility, responsive-layout, JavaScript and checkout tests.
- [ ] Configure production security headers, monitoring, error reporting, backups and rollback procedures.
- [ ] Complete a final pre-launch legal, regulatory, privacy and security review.

## Launch rule

The repository may contain incomplete development work. Public commerce should not be enabled until all launch-critical items above are completed or formally assessed and accepted by the responsible business owner and relevant professional advisers.
