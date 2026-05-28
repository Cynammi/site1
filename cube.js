(function () {
  var canvas = document.getElementById("wire-cube");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var drawScale = 20;
  var rotX = -0.35;
  var rotY = 0.45;
  var drag = false;
  var lastX = 0;
  var lastY = 0;
  var idleSpin = true;
  var resumeIdleTimer = null;

  // Physics drag momentum coordinates
  var velX = 0;
  var velY = 0;
  var friction = 0.93; // organic momentum deceleration rate

  var vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];

  var edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(x, y, z, scaleOverride) {
    var cosX = Math.cos(rotX);
    var sinX = Math.sin(rotX);
    var cosY = Math.cos(rotY);
    var sinY = Math.sin(rotY);

    var x1 = x * cosY - z * sinY;
    var z1 = x * sinY + z * cosY;
    var y1 = y * cosX - z1 * sinX;
    var z2 = y * sinX + z1 * cosX;

    var f = 2.8 / (2.8 + z2);
    var s = typeof scaleOverride === "number" ? scaleOverride : drawScale;
    return {
      x: canvas.clientWidth / 2 + x1 * s * f,
      y: canvas.clientHeight / 2 + y1 * s * f,
    };
  }

  function draw() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Dynamic, theme-aware visual properties
    var bodyStyles = getComputedStyle(document.body);
    var primaryColor = bodyStyles.getPropertyValue("--heading").trim() || "#082952";
    var glowColor = bodyStyles.getPropertyValue("--accent").trim() || "#0ea5e9";
    var isDark = document.body.classList.contains("dark");

    ctx.lineWidth = 11;
    ctx.strokeStyle = primaryColor;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isDark ? 24 : 12;

    // Compute exact projected bounds at unit scale, then fit to canvas.
    var unitPoints = vertices.map(function (v) {
      return project(v[0], v[1], v[2], 1);
    });
    var cx = w / 2;
    var cy = h / 2;
    var unitRadius = 0;
    unitPoints.forEach(function (p) {
      var dx = p.x - cx;
      var dy = p.y - cy;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > unitRadius) unitRadius = d;
    });

    var visualPad = ctx.lineWidth / 2 + ctx.shadowBlur + 20;
    var maxRadius = Math.max(8, Math.min(w, h) / 2 - visualPad);
    drawScale = Math.max(10, maxRadius / Math.max(unitRadius, 0.001));

    var points = unitPoints.map(function (p) {
      return {
        x: cx + (p.x - cx) * drawScale,
        y: cy + (p.y - cy) * drawScale,
      };
    });

    edges.forEach(function (edge) {
      var a = points[edge[0]];
      var b = points[edge[1]];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // Vertex joints matching theme primary
    ctx.fillStyle = primaryColor;
    points.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2.3, 0, Math.PI * 2);
      ctx.fill();
    });

    if (drag) {
      // Apply instantaneous velocities while dragging
    } else {
      // Decelerate momentum coordinates
      rotY += velY;
      rotX += velX;
      velY *= friction;
      velX *= friction;

      // When momentum dies down, idle spin resumes/blends
      if (idleSpin) {
        rotY += 0.0045;
        rotX += 0.0015;
      }
    }

    requestAnimationFrame(draw);
  }

  function shouldIgnoreTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      "a, button, input, textarea, select, video, [contenteditable='true']"
    );
  }

  function onPointerDown(e) {
    if (shouldIgnoreTarget(e.target)) return;
    drag = true;
    idleSpin = false;
    velX = 0;
    velY = 0;
    if (resumeIdleTimer) {
      window.clearTimeout(resumeIdleTimer);
      resumeIdleTimer = null;
    }
    lastX = e.clientX;
    lastY = e.clientY;
    document.body.classList.add("is-cube-dragging");
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dy = (e.clientX - lastX) * 0.008;
    var dx = (e.clientY - lastY) * 0.008;
    rotY += dy;
    rotX += dx;

    // Set instantaneous velocity for momentum decay
    velY = dy;
    velX = dx;

    lastX = e.clientX;
    lastY = e.clientY;
  }

  function onPointerUp() {
    if (!drag) return;
    drag = false;
    document.body.classList.remove("is-cube-dragging");
    
    // Smooth delay before resuming slow idle rotation
    resumeIdleTimer = window.setTimeout(function () {
      idleSpin = true;
    }, 2200);
  }

  canvas.addEventListener("mousedown", onPointerDown);
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("mouseup", onPointerUp);

  canvas.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length !== 1 || shouldIgnoreTarget(e.target)) return;
      drag = true;
      idleSpin = false;
      velX = 0;
      velY = 0;
      if (resumeIdleTimer) {
        window.clearTimeout(resumeIdleTimer);
        resumeIdleTimer = null;
      }
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      document.body.classList.add("is-cube-dragging");
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      if (!drag || e.touches.length !== 1) return;
      onPointerMove({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
      if (e.cancelable) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener("touchend", onPointerUp);
  document.addEventListener("touchcancel", onPointerUp);

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();
