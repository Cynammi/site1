(function () {
  var sections = document.querySelectorAll(".reveal-section, .hero");
  var navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length) return;

  // Staggered reveal entry for sections on scroll
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
  );

  sections.forEach(function (section) {
    if (section.classList.contains("reveal-section")) {
      revealObserver.observe(section);
    }
  });

  // Track scroll positions to update floating active links in nav-bar
  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            if (link.getAttribute("data-sec") === id) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: "-80px 0px -40% 0px" }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // Smooth scroll links execution with header offset support
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetId = link.getAttribute("href");
      
      if (targetId === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        var targetSection = document.querySelector(targetId);
        if (targetSection) {
          var navHeight = document.getElementById("site-nav").offsetHeight || 70;
          var elementTop = targetSection.getBoundingClientRect().top;
          var offsetPosition = elementTop + window.scrollY - navHeight - 12;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    });
  });

  // Back to Top and Radial Scroll Progress logic
  var btnBackToTop = document.getElementById("back-to-top");
  var progressCircle = document.querySelector(".progress-ring-circle");

  if (btnBackToTop && progressCircle) {
    var radius = progressCircle.r.baseVal.value || 21;
    var circumference = 2 * Math.PI * radius; // ~131.9
    
    // Set circle offset defaults
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0) {
        var scrollPct = scrollTop / docHeight;
        var offset = circumference - scrollPct * circumference;
        progressCircle.style.strokeDashoffset = offset;
      }
      
      // Make Back-To-Top button visible after 350px scroll
      if (scrollTop > 350) {
        btnBackToTop.classList.add("is-visible");
      } else {
        btnBackToTop.classList.remove("is-visible");
      }
    });

    btnBackToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Card & Skill Spotlight Cursor Coordinate Tracker (High Interactivity)
  var spotlightCards = document.querySelectorAll(".media-frame, .skill-card");
  spotlightCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", x + "px");
      card.style.setProperty("--mouse-y", y + "px");
    });
  });

  // Smooth keyboard scrolling with arrow keys.
  function shouldIgnoreKeyTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest("input, textarea, select, [contenteditable='true']");
  }

  document.addEventListener("keydown", function (e) {
    if (shouldIgnoreKeyTarget(e.target)) return;

    var step = Math.max(120, Math.floor(window.innerHeight * 0.22));
    var top = window.scrollY;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      window.scrollTo({ top: top + step, behavior: "smooth" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      window.scrollTo({ top: top - step, behavior: "smooth" });
    }
  });
})();
