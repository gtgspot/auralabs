/* ============================================================
   claim-guard.js
   Runtime enforcement of the classification boundary.

   Scans rendered page copy for language that moves a cosmetic
   product across the line into a therapeutic good, and for
   consumer-law claim defects. Reports to console in any mode;
   renders a visible overlay when ?claimguard=1 is present.

   This is a drafting aid. It catches known phrasings. It does
   not certify compliance and it cannot see what it has no term
   for — a clean scan means "nothing on the list was found",
   not "this page is compliant".
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     TERM REGISTER
     severity: FATAL  — moves the product across the classification line
               HIGH   — attracts penalty exposure as drafted
               REVIEW — lawful in some framings, needs a human decision
     ---------------------------------------------------------- */
  var REGISTER = [

    /* --- physiological process / therapeutic effect: TG Act s 3(1) --- */
    { re: /\bheals?\b|\bhealing\b/i,            sev: "FATAL",  why: "Asserts a therapeutic effect on the body.", auth: "TG Act s 3(1)(a)" },
    { re: /\btreats?\b|\btreatment of\b/i,      sev: "FATAL",  why: "Treatment of a disease, ailment or defect.", auth: "TG Act s 3(1)(a)" },
    { re: /\bcures?\b|\bcuring\b/i,             sev: "FATAL",  why: "Cure claim.", auth: "TG Act s 3(1)(a)" },
    { re: /\bregenerat(e|es|ing|ion)\b/i,       sev: "FATAL",  why: "Modifies a physiological process.", auth: "TG Act s 3(1)(b)" },
    { re: /\brepairs?\b|\brepairing\b/i,        sev: "FATAL",  why: "Tissue repair is a physiological process claim.", auth: "TG Act s 3(1)(b)" },
    { re: /\banti[- ]?inflammator(y|ies)\b/i,   sev: "FATAL",  why: "Pharmacological action claim.", auth: "TG Act s 3(1)(b)" },
    { re: /\bstimulates? (collagen|elastin|cell|tissue|growth)/i, sev: "FATAL", why: "Influences a physiological process.", auth: "TG Act s 3(1)(b)" },
    { re: /\b(boosts?|increases?|promotes?) (collagen|elastin|cell turnover|healing)\b/i, sev: "FATAL", why: "Physiological process claim.", auth: "TG Act s 3(1)(b)" },
    { re: /\bpenetrat(e|es|ing) (the )?(dermis|deeper layers|bloodstream)\b/i, sev: "FATAL", why: "Beyond surface effect — defeats the cosmetic characterisation.", auth: "Excluded Goods Determination 2018" },
    { re: /\bantibacterial\b|\bantimicrobial\b|\bantiseptic\b/i, sev: "FATAL", why: "Therapeutic claim unless within a specific cosmetic exemption.", auth: "TG Act s 3(1)(a)" },
    { re: /\bantiageing\b|\banti[- ]ageing\b|\banti[- ]aging\b/i, sev: "REVIEW", why: "Acceptable for appearance only. Defect if paired with a mechanism or process claim.", auth: "TG Act s 3(1)(b)" },

    /* --- named conditions --- */
    { re: /\b(eczema|psoriasis|dermatitis|rosacea|acne vulgaris|melasma|wound|scar tissue|ulcer)\b/i,
      sev: "FATAL", why: "Named condition — therapeutic by definition.", auth: "TG Act s 3(1)(a)" },

    /* --- prohibited representations: Advertising Code Pt 2 --- */
    { re: /\b(is|are|completely|totally|100%) safe\b/i, sev: "HIGH", why: "Safety claim is a prohibited representation.", auth: "TGAC 2021 Pt 2" },
    { re: /\bno side[- ]effects?\b|\bfree from side[- ]effects?\b/i, sev: "HIGH", why: "Prohibited representation.", auth: "TGAC 2021 Pt 2" },
    { re: /\b(guaranteed|guarantees) (results?|to work)\b/i, sev: "HIGH", why: "Prohibited representation and an ACL s 29 risk.", auth: "TGAC 2021 Pt 2; ACL s 29(1)(g)" },
    { re: /\bmiracle\b|\bmiraculous\b/i, sev: "HIGH", why: "Unsubstantiable performance claim.", auth: "ACL ss 18, 29(1)(g)" },

    /* --- research-use framing --- */
    { re: /\bresearch (use )?only\b|\bnot for human (consumption|use)\b|\blaboratory use only\b/i,
      sev: "FATAL", why: "Reliance on a research disclaimer on a consumer-facing storefront. Classification attaches to the product and its total presentation, not the label.",
      auth: "TG Act s 3(1); TGA safety advisory 13 Apr 2026" },

    /* --- dosing / administration content --- */
    { re: /\b(reconstitut(e|ion)|bacteriostatic water|mcg per|mg per (day|dose)|injection site|subcutaneous|intramuscular|dosing protocol|cycle length)\b/i,
      sev: "FATAL", why: "Administration content is a therapeutic-presentation indicium.", auth: "TG Act s 3(1)" },

    /* --- ACL: exclusion of consumer guarantees --- */
    { re: /\bno refunds?\b|\ball sales (are )?final\b|\bnon[- ]refundable\b/i,
      sev: "HIGH", why: "Purports to exclude non-excludable guarantees.", auth: "ACL ss 64, 29(1)(m)" },
    { re: /\bsale items? (are )?(excluded|not eligible|cannot be returned)\b/i,
      sev: "HIGH", why: "Guarantees apply to discounted goods.", auth: "ACL s 64" },
    { re: /\b(within|only) \d+ days?\b[^.]{0,60}\b(faulty|defect|damaged)\b/i,
      sev: "HIGH", why: "Time limit purported over faulty-goods rights.", auth: "ACL s 64" },
    { re: /\bmanufacturer'?s? warranty is your only\b|\bcontact the manufacturer\b[^.]{0,40}\bonly\b/i,
      sev: "HIGH", why: "Misrepresents the supplier's own liability.", auth: "ACL ss 64, 29(1)(m)" },
    { re: /\bwe (are )?not liable\b|\bto the (maximum|fullest) extent permitted\b[^.]{0,50}\bexclude\b/i,
      sev: "REVIEW", why: "Check the ACL carve-out survives — a bare exclusion is void and misleading.", auth: "ACL ss 64, 64A" },

    /* --- pricing --- */
    { re: /\b(\+|plus) GST\b|\bex(cl(uding)?)?\.? ?GST\b/i,
      sev: "HIGH", why: "Consumer-facing prices must be GST-inclusive single prices.", auth: "ACL s 48" },
    { re: /\b(fees?|surcharges?|charges?) (apply|added) at checkout\b/i,
      sev: "HIGH", why: "Drip pricing — mandatory fees must be in the displayed price.", auth: "ACL s 48" },

    /* --- reviews and testimonials --- */
    { re: /\b(verified|clinically proven|dermatologist (approved|recommended)|doctor recommended)\b/i,
      sev: "REVIEW", why: "Substantiation required, and health-professional endorsement is restricted for therapeutic goods.", auth: "ACL s 29(1)(g); TGAC 2021 s 24" },
    { re: /\b(free product|discount|gift card) (for|in exchange for) (a )?review\b/i,
      sev: "HIGH", why: "Incentivised testimonial.", auth: "ACL s 29(1)(e)–(f); TGAC 2021 s 24" },

    /* --- dark patterns --- */
    { re: /\bonly \d+ left\b|\bselling fast\b|\bhurry\b|\bends in\b/i,
      sev: "REVIEW", why: "Scarcity and urgency devices must be true. Becomes higher risk under the unfair trading prohibition from 1 Jul 2027.",
      auth: "ACL s 18; s 28B from 1 Jul 2027" }
  ];

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };

  function collect(root) {
    var out = [], w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== document.body) {
          if (SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if (p.hasAttribute && p.hasAttribute("data-claimguard-ignore")) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) out.push(n);
    return out;
  }

  function context(text, match) {
    var i = text.toLowerCase().indexOf(match.toLowerCase());
    return text.slice(Math.max(0, i - 45), Math.min(text.length, i + match.length + 45)).trim();
  }

  function locate(node) {
    var el = node.parentElement, path = [];
    while (el && el !== document.body && path.length < 4) {
      var s = el.nodeName.toLowerCase();
      if (el.id) { path.unshift("#" + el.id); break; }
      if (el.className && typeof el.className === "string") s += "." + el.className.trim().split(/\s+/)[0];
      path.unshift(s); el = el.parentElement;
    }
    return path.join(" > ");
  }

  function scan(root) {
    var findings = [];
    collect(root).forEach(function (node) {
      var t = node.nodeValue;
      REGISTER.forEach(function (rule) {
        var m = t.match(rule.re);
        if (m) findings.push({
          term: m[0], sev: rule.sev, why: rule.why, auth: rule.auth,
          context: context(t, m[0]), where: locate(node), node: node
        });
      });
    });
    var rank = { FATAL: 0, HIGH: 1, REVIEW: 2 };
    return findings.sort(function (a, b) { return rank[a.sev] - rank[b.sev]; });
  }

  function report(f) {
    if (!f.length) { console.info("%cclaim-guard: no registered terms found on this page.", "color:#3B6647"); return; }
    console.groupCollapsed("%cclaim-guard: " + f.length + " item(s) flagged", "color:#93281D;font-weight:700");
    f.forEach(function (x) {
      console.log("%c" + x.sev + "%c  \u201c" + x.term + "\u201d  \u2014 " + x.why + "\n   " + x.auth + "\n   " + x.where + "\n   \u2026" + x.context + "\u2026",
        "background:" + (x.sev === "FATAL" ? "#93281D" : x.sev === "HIGH" ? "#A2700F" : "#54547A") + ";color:#fff;padding:1px 6px;border-radius:2px", "color:inherit");
    });
    console.groupEnd();
  }

  function overlay(f) {
    var el = document.createElement("div");
    el.setAttribute("data-claimguard-ignore", "");
    el.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:2147483647;width:min(430px,calc(100vw - 28px));max-height:64vh;overflow:auto;background:#141F1A;color:#E3E7E3;font:12px/1.45 ui-monospace,monospace;border-radius:4px;box-shadow:0 12px 40px rgba(0,0,0,.45)";
    var head = '<div style="padding:11px 14px;border-bottom:1px solid #34433B;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#141F1A">' +
      '<b style="letter-spacing:.14em;text-transform:uppercase;font-size:10px">claim-guard \u00b7 ' + f.length + ' flagged</b>' +
      '<button style="background:none;border:1px solid #34433B;color:#93A69B;cursor:pointer;padding:3px 9px;border-radius:2px">close</button></div>';
    var body = f.length ? f.map(function (x) {
      var c = x.sev === "FATAL" ? "#C4483B" : x.sev === "HIGH" ? "#C99A2A" : "#8A8AB8";
      return '<div style="padding:11px 14px;border-bottom:1px solid #22312A">' +
        '<span style="color:' + c + ';font-weight:600">' + x.sev + '</span> \u2014 <b>\u201c' + x.term + '\u201d</b>' +
        '<div style="color:#9FBCAB;margin-top:4px">' + x.why + '</div>' +
        '<div style="color:#7C8F85;margin-top:4px">' + x.auth + '</div>' +
        '<div style="color:#6C7C73;margin-top:4px">' + x.where + '</div></div>';
    }).join("") : '<div style="padding:14px;color:#9FBCAB">No registered terms found. That is not a clearance \u2014 the register only catches what it has a term for.</div>';
    el.innerHTML = head + body;
    el.querySelector("button").onclick = function () { el.remove(); };
    document.body.appendChild(el);
  }

  var API = {
    scan: scan,
    check: function (root) { var f = scan(root); report(f); return f; },
    register: REGISTER,
    add: function (rule) { REGISTER.push(rule); }
  };
  window.ClaimGuard = API;

  function run() {
    var f = scan(document.body);
    report(f);
    if (/[?&]claimguard=1/.test(location.search)) overlay(f);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
