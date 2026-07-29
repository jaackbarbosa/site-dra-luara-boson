(function () {
  "use strict";

  function initializeMenu() {
    const menuButton = document.querySelector("[data-menu-button]");
    const navigation = document.querySelector("[data-navigation]");

    if (!menuButton || !navigation) {
      return;
    }

    function closeMenu() {
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
    }

    menuButton.addEventListener("click", function () {
      const isOpen = navigation.classList.toggle("is-open");

      document.body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
      );
    });

    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  function initializeSmoothScroll() {
    const header = document.querySelector(".site-header");

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target =
          targetId === "#topo"
            ? document.body
            : document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        const headerHeight = header ? header.offsetHeight : 0;
        const extraOffset =
          targetId === "#formacoes" ||
          targetId === "#sobre" ||
          targetId === "#contato"
            ? 0
            : 8;

        const targetTop =
          targetId === "#topo"
            ? 0
            : target.getBoundingClientRect().top +
              window.pageYOffset -
              headerHeight -
              extraOffset;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth"
        });
      });
    });
  }

  function initializeScrollReveal() {
    const sections = Array.from(
      document.querySelectorAll("[data-section-reveal]")
    );
    const blocks = Array.from(
      document.querySelectorAll("[data-reveal]")
    );

    if (!sections.length && !blocks.length) {
      return;
    }

    document.documentElement.classList.add("scroll-reveal-ready");

    blocks.forEach(function (element) {
      const delay = Number(element.getAttribute("data-reveal-delay") || 0);
      element.style.setProperty("--reveal-delay", delay + "ms");
    });

    function reveal(element) {
      element.classList.add("is-visible");
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      sections.forEach(reveal);
      blocks.forEach(reveal);
      return;
    }

    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          reveal(entry.target);
          sectionObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    const blockObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          reveal(entry.target);
          blockObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    sections.forEach(function (section) {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        reveal(section);
      } else {
        sectionObserver.observe(section);
      }
    });

    blocks.forEach(function (block) {
      const rect = block.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        reveal(block);
      } else {
        blockObserver.observe(block);
      }
    });

    window.setTimeout(function () {
      sections.forEach(reveal);
      blocks.forEach(reveal);
    }, 3500);
  }


  function initializeClickableCourseCards() {
    const cards = document.querySelectorAll(".course-card-clickable");

    cards.forEach(function (card) {
      const link = card.querySelector(".course-card-action a");

      if (!link) {
        return;
      }

      function openCardLink() {
        if (link.target === "_blank") {
          window.open(link.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = link.href;
        }
      }

      card.addEventListener("click", function (event) {
        if (event.target.closest("a, button, input, select, textarea")) {
          return;
        }

        openCardLink();
      });

      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCardLink();
        }
      });
    });
  }


  function initializeActiveNavigation() {
    const navLinks = Array.from(
      document.querySelectorAll('.site-navigation a[href^="#"]')
    );

    if (!navLinks.length) {
      return;
    }

    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 0;

    const sections = navLinks
      .map(function (link) {
        const selector = link.getAttribute("href");
        const element =
          selector === "#topo"
            ? document.querySelector("#topo") || document.querySelector(".hero-section")
            : document.querySelector(selector);

        return {
          link: link,
          selector: selector,
          element: element
        };
      })
      .filter(function (item) {
        return item.element;
      });

    function setActive(activeLink) {
      navLinks.forEach(function (link) {
        const isActive = link === activeLink;

        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function updateActiveNavigation() {
      const scrollPosition = window.scrollY + headerHeight + 120;

      let current = sections[0];

      sections.forEach(function (item) {
        const sectionTop =
          item.element.getBoundingClientRect().top + window.scrollY;

        if (scrollPosition >= sectionTop) {
          current = item;
        }
      });

      const nearPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20;

      if (nearPageBottom) {
        current = sections[sections.length - 1];
      }

      if (current) {
        setActive(current.link);
      }
    }

    updateActiveNavigation();

    window.addEventListener("scroll", updateActiveNavigation, {
      passive: true
    });

    window.addEventListener("resize", updateActiveNavigation);

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setActive(link);
      });
    });
  }

  function initializeAnalyticsTracking() {
    window.dataLayer = window.dataLayer || [];

    document.addEventListener("click", function (event) {
      const target = event.target.closest(
        "[data-track], .course-card-clickable, .whatsapp-contact, .whatsapp-primary-card"
      );

      if (!target) {
        return;
      }

      const label =
        target.getAttribute("data-track") ||
        target.getAttribute("aria-label") ||
        target.textContent.trim().replace(/\s+/g, " ").slice(0, 100);

      window.dataLayer.push({
        event: "site_interaction",
        interaction_label: label,
        interaction_href: target.href || target.querySelector("a")?.href || ""
      });
    });
  }


  function initializeFloatingMobileMenuState() {
    const toggle = document.querySelector(
      ".menu-toggle, .mobile-menu-toggle, .navigation-toggle"
    );

    if (!toggle) {
      return;
    }

    const nav = document.querySelector(".site-navigation");

    function syncState() {
      const expanded =
        toggle.getAttribute("aria-expanded") === "true" ||
        (nav && nav.classList.contains("is-open"));

      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      window.requestAnimationFrame(syncState);
    });

    if (nav && "MutationObserver" in window) {
      const observer = new MutationObserver(syncState);
      observer.observe(nav, {
        attributes: true,
        attributeFilter: ["class", "aria-hidden"]
      });
    }

    syncState();
  }


  function initializeMobileSideMenu() {
    const toggle = document.querySelector(
      ".menu-toggle, .mobile-menu-toggle, .navigation-toggle"
    );
    const nav = document.querySelector(".site-navigation");

    if (!toggle || !nav) {
      return;
    }

    let backdrop = document.querySelector(".mobile-menu-backdrop");

    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.className = "mobile-menu-backdrop";
      backdrop.setAttribute("aria-label", "Fechar menu");
      document.body.appendChild(backdrop);
    }

    function isOpen() {
      return (
        toggle.getAttribute("aria-expanded") === "true" ||
        nav.classList.contains("is-open") ||
        nav.getAttribute("aria-hidden") === "false"
      );
    }

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      nav.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    backdrop.addEventListener("click", function () {
      setOpen(false);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) {
        setOpen(false);
      }
    });

    setOpen(false);
  }

  function initializeSite() {
    initializeMenu();
    initializeSmoothScroll();
    initializeClickableCourseCards();
    initializeActiveNavigation();
    initializeAnalyticsTracking();
    initializeFloatingMobileMenuState();
    initializeMobileSideMenu();
    initializeScrollReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSite);
  } else {
    initializeSite();
  }
})();
