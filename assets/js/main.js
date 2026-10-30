/* YongMaiHeng landing page behaviour */
(function () {
  "use strict";

  /* -------- Settings you may need to change --------
     FORM_ENDPOINT: where inquiries are POSTed as JSON.
     Leave empty to open the visitor's email app with the inquiry prefilled.
     Examples: "https://formspree.io/f/xxxxabcd" or "/api/inquiry" on your own server. */
  var FORM_ENDPOINT = "";
  var INQUIRY_EMAIL = "kevin@ywstarframe.com";

  document.documentElement.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile menu */
  var body = document.body;
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    var links = menu.querySelectorAll("a");
    var setOpen = function (open) {
      body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      links.forEach(function (a, i) {
        a.tabIndex = open ? 0 : -1;
        var step = Math.min(i * 60, 400);
        a.style.transitionDelay = open && !reduceMotion ? step + "ms" : "0ms";
      });
      body.style.overflow = open ? "hidden" : "";
    };
    setOpen(false);
    toggle.addEventListener("click", function () { setOpen(!body.classList.contains("menu-open")); });
    links.forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) { setOpen(false); toggle.focus(); }
    });
  }

  /* Current section in nav */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) navObs.observe(s); });
  }

  /* Scroll reveals, once per section */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Tagline: each word lights up as it crosses a trigger line */
  var tagline = document.querySelector("[data-word-reveal]");
  if (tagline) {
    var text = tagline.textContent.trim().split(/\s+/);
    tagline.textContent = "";
    var words = text.map(function (w, i) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w;
      tagline.appendChild(span);
      if (i < text.length - 1) tagline.appendChild(document.createTextNode(" "));
      return span;
    });
    if (reduceMotion) {
      words.forEach(function (w) { w.classList.add("on"); });
    } else {
      var ticking = false;
      var maxLit = 0;
      var update = function () {
        ticking = false;
        var line = window.innerHeight * 0.7;
        var rect = tagline.getBoundingClientRect();
        var progress = (line - rect.top) / (rect.height + window.innerHeight * 0.15);
        var lit = Math.round(Math.max(0, Math.min(1, progress)) * words.length);
        for (var i = maxLit; i < lit; i++) words[i].classList.add("on");
        if (lit > maxLit) maxLit = lit;
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
  }

  /* "Ask about this" buttons preselect a product in the form */
  document.querySelectorAll("[data-ask]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = document.querySelector('input[name="products"][value="' + btn.getAttribute("data-ask") + '"]');
      if (box) box.checked = true;
      document.getElementById("quote").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      window.setTimeout(function () { document.getElementById("f-name").focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    });
  });

  /* Inquiry form */
  var form = document.getElementById("quote-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var submit = form.querySelector('button[type="submit"]');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Enter your name."; },
    email: function (v) {
      if (!v.trim()) return "Enter your email so we can send the quote.";
      return emailRe.test(v.trim()) ? "" : "This email looks incomplete. Check for a missing @ or domain.";
    },
    country: function (v) { return v.trim() ? "" : "Enter the country you import to."; },
    message: function (v) {
      return v.trim().length >= 20 ? "" : "Add a few details, such as size, finish or quantity (20 characters minimum).";
    },
    consent: function (_v, el) { return el.checked ? "" : "Please agree so we can use your details to reply."; }
  };

  var showError = function (el, msg) {
    var err = document.getElementById(el.id + "-error");
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
  };

  var validateField = function (el) {
    var rule = rules[el.name];
    if (!rule) return "";
    var msg = rule(el.value, el);
    showError(el, msg);
    return msg;
  };

  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    el.addEventListener("blur", function () { if (el.value || el.type === "checkbox") validateField(el); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") validateField(el); });
    el.addEventListener("change", function () { if (el.type === "checkbox") validateField(el); });
  });

  var setStatus = function (type, html) {
    status.className = "form-status show " + type;
    status.innerHTML = html;
    status.focus();
  };

  var collect = function () {
    var products = Array.prototype.map.call(form.querySelectorAll('input[name="products"]:checked'), function (c) { return c.value; });
    return {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      company: form.elements.company.value.trim(),
      country: form.elements.country.value.trim(),
      products: products,
      quantity: form.elements.quantity.value,
      message: form.elements.message.value.trim(),
      page: window.location.href
    };
  };

  var mailtoFallback = function (d) {
    var subject = "Inquiry from " + d.name + (d.company ? " (" + d.company + ")" : "");
    var lines = [
      "Name: " + d.name,
      "Email: " + d.email,
      "Company: " + (d.company || "n/a"),
      "Country: " + d.country,
      "Products: " + (d.products.join(", ") || "not specified"),
      "Estimated quantity: " + (d.quantity || "not specified"),
      "",
      d.message
    ];
    window.location.href = "mailto:" + INQUIRY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  };

  var escapeHtml = function (s) {
    return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.website.value) return; /* honeypot */

    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (el && validateField(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      setStatus("err", '<i class="ph ph-warning-circle" aria-hidden="true"></i><span>Some fields need attention. Fix the highlighted fields and send again.</span>');
      firstBad.focus();
      return;
    }

    var data = collect();

    if (!FORM_ENDPOINT) {
      mailtoFallback(data);
      setStatus("ok", '<i class="ph ph-envelope-simple" aria-hidden="true"></i><span>Your email app should open with the inquiry filled in. If nothing opened, write to <a href="mailto:' + INQUIRY_EMAIL + '">' + INQUIRY_EMAIL + "</a>.</span>");
      return;
    }

    submit.classList.add("is-loading");
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      setStatus("ok", '<i class="ph ph-check-circle" aria-hidden="true"></i><span>Inquiry sent. Kevin will reply to ' + escapeHtml(data.email) + " within 24 hours.</span>");
    }).catch(function () {
      setStatus("err", '<i class="ph ph-warning-circle" aria-hidden="true"></i><span>The inquiry did not send. Check your connection and try again, or email <a href="mailto:' + INQUIRY_EMAIL + '">' + INQUIRY_EMAIL + "</a> directly.</span>");
    }).finally(function () {
      submit.classList.remove("is-loading");
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    });
  });
})();
