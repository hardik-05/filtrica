(function () {
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var STORAGE_KEY = "filtrica-theme";

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentEffectiveTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* localStorage unavailable — fall back to system preference */
    }
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(
    (function () {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return null;
      }
    })()
  );

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentEffectiveTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* ignore — theme just won't persist across reloads */
      }
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll-spy active nav link ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navAnchors.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Scroll-triggered entrance ----------
     Every .reveal element is fully visible by default (see styles.css). Only
     elements starting below the fold get a starting "pre-reveal" (hidden)
     class, and a safety timeout always clears it — so nothing can end up
     permanently invisible if the observer never fires (JS-less rendering,
     a crawler, a full-page capture, etc). */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var viewportH = window.innerHeight || document.documentElement.clientHeight;

  if (revealEls.length && "IntersectionObserver" in window) {
    var toObserve = [];
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top > viewportH) {
        el.classList.add("pre-reveal");
        toObserve.push(el);
      }
    });

    if (toObserve.length) {
      var reveal = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.remove("pre-reveal");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
      );
      toObserve.forEach(function (el) {
        reveal.observe(el);
      });

      // Safety net: guarantee visibility even if something never intersects.
      window.setTimeout(function () {
        toObserve.forEach(function (el) {
          el.classList.remove("pre-reveal");
        });
        reveal.disconnect();
      }, 1200);
    }
  }

  /* ---------- Contact form submission (Web3Forms, no backend) ---------- */
  var form = document.getElementById("quoteForm");
  var submitBtn = document.getElementById("submitBtn");
  var statusEl = document.getElementById("formStatus");

  function setStatus(kind, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status visible " + kind;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Honeypot: bots fill every field, real users never see or fill this one.
      if (form.elements["company_website"] && form.elements["company_website"].value) {
        return;
      }

      var accessKey =
        window.FILTRICA_CONFIG && window.FILTRICA_CONFIG.WEB3FORMS_ACCESS_KEY;

      if (!accessKey || accessKey.indexOf("YOUR-WEB3FORMS-ACCESS-KEY") !== -1) {
        setStatus(
          "error",
          "Form delivery isn't configured yet — add a Web3Forms access key in config.js (see README)."
        );
        return;
      }

      var MAX_FILE_BYTES = 5 * 1024 * 1024;
      var fileInput = form.elements["attachment"];
      var attachedFile = fileInput && fileInput.files && fileInput.files[0];
      if (attachedFile && attachedFile.size > MAX_FILE_BYTES) {
        setStatus(
          "error",
          "That file is over 5MB — please attach a smaller file, or remove it and send the details in the message instead."
        );
        return;
      }

      var formData = new FormData(form);
      formData.append("access_key", accessKey);

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("", "");
      statusEl.className = "form-status";

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            setStatus(
              "success",
              "Thanks — we've received your request and will be in touch soon with your quotation."
            );
          } else {
            setStatus(
              "error",
              "Something went wrong sending your request. Please try again or email us directly."
            );
          }
        })
        .catch(function () {
          setStatus(
            "error",
            "Something went wrong sending your request. Please try again or email us directly."
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Request";
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
