/* ============================================================
   compliance-layer.js
   Drop-in components that satisfy specific audit items without
   touching existing markup. Each mounts into a placeholder div
   or auto-injects. Nothing here overwrites your templates.

   Mount points (add any you want, omit the rest):
     <div data-compliance="guarantees"></div>   -> B.2
     <div data-compliance="warranty"></div>     -> B.4  (prescribed wording)
     <div data-compliance="reviews-policy"></div> -> B.9
     <div data-compliance="mandatory-statement"></div> -> A.3  (therapeutic only)

   Auto-mounted:
     consent banner  -> C.8
     price audit     -> B.5 / B.6 (console only, non-visual)
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.COMPLIANCE_CONFIG || {};
  var C = {
    entity:        CONFIG.entity        || "{{ENTITY_NAME}}",
    abn:           CONFIG.abn           || "{{ABN}}",
    email:         CONFIG.email         || "{{CONTACT_EMAIL}}",
    legalBase:     CONFIG.legalBase     || "/legal/",
    therapeutic:   CONFIG.therapeutic   === true,   // set true ONLY for ARTG-listed goods
    warrantyOffered: CONFIG.warrantyOffered === true,
    warrantyTerms: CONFIG.warrantyTerms || "{{WARRANTY_DURATION_AND_SCOPE}}",
    consent:       CONFIG.consent !== false
  };

  /* ---------- B.2 consumer guarantees ---------- */
  function guarantees() {
    return '<section class="cmp-block cmp-guarantees">' +
      '<h3 class="cmp-h">Your rights under the Australian Consumer Law</h3>' +
      '<p>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. ' +
      'You are entitled to a replacement or refund for a major failure and compensation for any other ' +
      'reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced ' +
      'if the goods fail to be of acceptable quality and the failure does not amount to a major failure.</p>' +
      '<p class="cmp-sm">These rights apply to discounted and sale items, and they are not limited by any ' +
      'time period we set for change-of-mind returns. ' +
      '<a href="' + C.legalBase + 'returns-and-refunds.html">Returns and refunds</a></p></section>';
  }

  /* ---------- B.4 warranty against defects: prescribed wording ---------- */
  function warranty() {
    if (!C.warrantyOffered) return "";
    return '<section class="cmp-block cmp-warranty">' +
      '<h3 class="cmp-h">Warranty against defects</h3>' +
      '<p>' + C.entity + ' (ABN ' + C.abn + ') warrants ' + C.warrantyTerms + '. ' +
      'To claim under this warranty, contact us at ' + C.email + '. You bear any expense of claiming ' +
      'this warranty. This warranty is given by ' + C.entity + ', ' + C.email + '.</p>' +
      '<p><strong>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. ' +
      'You are entitled to a replacement or refund for a major failure and compensation for any other ' +
      'reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced ' +
      'if the goods fail to be of acceptable quality and the failure does not amount to a major failure.' +
      '</strong></p>' +
      '<p class="cmp-sm">This warranty is in addition to, and does not limit, those rights.</p></section>';
  }

  /* ---------- B.9 reviews policy ---------- */
  function reviewsPolicy() {
    return '<section class="cmp-block cmp-reviews">' +
      '<h3 class="cmp-h">How we handle reviews</h3>' +
      '<ul class="cmp-list">' +
      '<li>Reviews are published from verified purchasers only.</li>' +
      '<li>We do not offer products, discounts or any other incentive in exchange for a review.</li>' +
      '<li>We publish positive and negative reviews. We do not filter by rating.</li>' +
      '<li>We remove a review only where it is abusive, discloses personal information, is unrelated ' +
      'to the product, or we hold an adequate basis to conclude it is not genuine. We keep a record of ' +
      'every removal and the reason for it.</li>' +
      '<li>Reviews are not edited for content.</li></ul></section>';
  }

  /* ---------- A.3 mandatory statement (therapeutic goods only) ---------- */
  function mandatoryStatement() {
    if (!C.therapeutic) {
      console.warn("compliance-layer: mandatory-statement mount present but COMPLIANCE_CONFIG.therapeutic is false. " +
        "Do not display this on a cosmetic product — it asserts a therapeutic characterisation.");
      return "";
    }
    return '<aside class="cmp-mandatory" role="note">' +
      '<strong>ALWAYS READ THE LABEL AND FOLLOW THE DIRECTIONS FOR USE.</strong>' +
      '<span class="cmp-sm">This medicine may not be right for you. Read the warnings before purchase.</span>' +
      '</aside>';
  }

  /* ---------- C.8 consent ---------- */
  function consentBanner() {
    if (!C.consent) return;
    if (document.cookie.indexOf("cmp_consent=") > -1) { apply(); return; }
    var b = document.createElement("div");
    b.className = "cmp-consent"; b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Cookie choices");
    b.innerHTML =
      '<div class="cmp-consent-body"><p>We use cookies that are necessary for the site to work. ' +
      'We would also like to set analytics cookies to understand how the site is used. ' +
      'Analytics are off unless you turn them on. ' +
      '<a href="' + C.legalBase + 'privacy-policy.html">Privacy policy</a></p>' +
      '<div class="cmp-consent-actions">' +
      '<button data-c="none" class="cmp-btn cmp-btn-ghost">Necessary only</button>' +
      '<button data-c="all" class="cmp-btn">Allow analytics</button></div></div>';
    b.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      document.cookie = "cmp_consent=" + t.dataset.c + ";path=/;max-age=" + 60 * 60 * 24 * 180 + ";SameSite=Lax";
      b.remove(); apply();
    });
    document.body.appendChild(b);

    function apply() {
      var v = (document.cookie.match(/cmp_consent=(\w+)/) || [])[1];
      window.dispatchEvent(new CustomEvent("compliance:consent", { detail: { analytics: v === "all" } }));
    }
    apply();
  }

  /* ---------- B.5 / B.6 price audit (console only) ---------- */
  function priceAudit() {
    var bad = [];
    document.querySelectorAll("[data-price],[class*='price'],[class*='Price']").forEach(function (el) {
      var t = (el.textContent || "").trim();
      if (!t) return;
      if (/\+\s*GST|ex(cl)?\.?\s*GST/i.test(t)) bad.push({ el: el, why: "Price shown exclusive of GST", auth: "ACL s 48" });
      if (/from\s*\$/i.test(t) && !el.closest("[data-compliance-from-ok]")) bad.push({ el: el, why: "'From' pricing — confirm the lowest advertised price is actually obtainable", auth: "ACL ss 18, 48" });
    });
    if (bad.length) {
      console.groupCollapsed("%ccompliance-layer: " + bad.length + " pricing item(s) flagged", "color:#93281D;font-weight:700");
      bad.forEach(function (b) { console.log(b.why + " — " + b.auth, b.el); });
      console.groupEnd();
    }
  }

  /* ---------- mount ---------- */
  var BUILDERS = {
    "guarantees": guarantees,
    "warranty": warranty,
    "reviews-policy": reviewsPolicy,
    "mandatory-statement": mandatoryStatement
  };

  function mount() {
    document.querySelectorAll("[data-compliance]").forEach(function (el) {
      var k = el.getAttribute("data-compliance"), fn = BUILDERS[k];
      if (!fn) { console.warn("compliance-layer: unknown mount \u201c" + k + "\u201d"); return; }
      el.innerHTML = fn();
    });
    consentBanner();
    priceAudit();

    var unresolved = document.body.innerHTML.match(/\{\{[A-Z_]+\}\}/g);
    if (unresolved) {
      console.error("%ccompliance-layer: unresolved placeholders on this page \u2014 " +
        Array.from(new Set(unresolved)).join(", ") +
        "\nA legal page with an unfilled placeholder is worse than no page: it evidences an unfinished process.",
        "color:#93281D;font-weight:700");
    }
  }

  window.ComplianceLayer = { mount: mount, config: C, build: BUILDERS };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
