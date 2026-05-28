(function () {
  var sections = document.querySelectorAll(".reveal-section");
  if (!sections.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach(function (section) {
    observer.observe(section);
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
