(function () {
  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var overlay = lightbox.querySelector(".lightbox-overlay");
  var content = lightbox.querySelector(".lightbox-content");
  var closeBtn = lightbox.querySelector(".lightbox-close");
  var mediaWrapper = lightbox.querySelector(".lightbox-media-wrapper");
  var tagsContainer = lightbox.querySelector(".lightbox-tags-container");
  var titleElement = lightbox.querySelector(".lightbox-title");
  var descElement = lightbox.querySelector(".lightbox-desc");
  
  var activeSlotIndex = -1;
  var slots = document.querySelectorAll(".media-slot");

  // Load and restore titles from localStorage on startup using Cwerty keys
  slots.forEach(function (slot, idx) {
    var savedTitle = localStorage.getItem("cwerty-title-" + idx);
    if (savedTitle) {
      var figcaption = slot.querySelector("figcaption");
      if (figcaption) {
        figcaption.textContent = savedTitle;
      }
    }
  });

  function openLightbox(slot, index) {
    activeSlotIndex = index;
    var type = slot.getAttribute("data-media-type") || "image";
    var tags = slot.getAttribute("data-media-tags") || "";
    var desc = slot.getAttribute("data-media-desc") || "No description provided.";
    
    var figcaption = slot.querySelector("figcaption");
    var title = figcaption ? figcaption.textContent : "Untitled Piece";

    // Populate media wrapper with glassmorphic pending dashboard console
    mediaWrapper.innerHTML = "";
    
    var consoleDiv = document.createElement("div");
    consoleDiv.className = "lightbox-pending-view";
    
    var gridDiv = document.createElement("div");
    gridDiv.className = "lightbox-console-grid";
    consoleDiv.appendChild(gridDiv);
    
    // Clone the exact vector SVG inside the slot to keep high-fidelity animations
    var slotSvg = slot.querySelector("svg");
    if (slotSvg) {
      var clonedSvg = slotSvg.cloneNode(true);
      consoleDiv.appendChild(clonedSvg);
    }
    
    var header = document.createElement("h4");
    header.textContent = type === "video" ? "Diagnostic Render Active" : "Creative Interface Active";
    consoleDiv.appendChild(header);
    
    if (type === "video") {
      // Append bouncing audio wave visualizer
      var canvas = document.createElement("canvas");
      canvas.className = "video-visualizer";
      canvas.style.position = "absolute";
      canvas.style.bottom = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "75px";
      canvas.style.pointerEvents = "none";
      consoleDiv.appendChild(canvas);
      
      mediaWrapper.appendChild(consoleDiv);
      setupVisualizer(canvas);
    } else {
      mediaWrapper.appendChild(consoleDiv);
    }

    // Populate tags
    tagsContainer.innerHTML = "";
    if (tags) {
      tags.split(",").forEach(function (tag) {
        var span = document.createElement("span");
        span.className = "lightbox-tag";
        span.textContent = tag.trim();
        tagsContainer.appendChild(span);
      });
    }

    // Populate titles and descriptions
    titleElement.textContent = title;
    descElement.textContent = desc;

    // Show Lightbox modal
    lightbox.classList.add("is-active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent background body scroll
  }

  function closeLightbox() {
    lightbox.classList.remove("is-active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore background body scroll
    
    // Clear heavy elements
    setTimeout(function() {
      mediaWrapper.innerHTML = "";
    }, 400);
  }

  // Handle title edits inside the lightbox and sync to grid + localStorage
  titleElement.addEventListener("input", function () {
    if (activeSlotIndex === -1) return;
    
    var updatedText = titleElement.textContent;
    
    // Update main page card figcaption
    var activeSlot = slots[activeSlotIndex];
    if (activeSlot) {
      var figcaption = activeSlot.querySelector("figcaption");
      if (figcaption) {
        figcaption.textContent = updatedText;
      }
    }

    // Persist edited title to localStorage with Cwerty key
    localStorage.setItem("cwerty-title-" + activeSlotIndex, updatedText);
  });

  // Sync edits done directly on the page grid captions to localStorage
  slots.forEach(function (slot, idx) {
    var figcaption = slot.querySelector("figcaption");
    if (figcaption) {
      figcaption.addEventListener("input", function() {
        localStorage.setItem("cwerty-title-" + idx, figcaption.textContent);
      });
      // Prevent clicking the slot while typing inside editable caption
      figcaption.addEventListener("click", function(e) {
        e.stopPropagation();
      });
    }
  });

  // Setup click triggers on artwork and animation grid slots
  slots.forEach(function (slot, index) {
    slot.addEventListener("click", function () {
      openLightbox(slot, index);
    });
  });

  // Close triggers
  closeBtn.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", closeLightbox);
  
  // Close on Escape key press
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-active")) {
      closeLightbox();
    }
  });

  // Kinetic Audio Visualizer Canvas Loop Logic
  function setupVisualizer(canvas) {
    var ctx = canvas.getContext("2d");
    var animationId;
    
    function resizeCanvas() {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    // Initial resize
    resizeCanvas();

    var numBars = 45;
    var barHeights = [];
    for (var i = 0; i < numBars; i++) {
      barHeights.push(Math.random() * 20 + 2);
    }

    var time = 0;
    function renderWave() {
      if (!canvas.isConnected) {
        cancelAnimationFrame(animationId);
        return;
      }

      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      
      var isDark = document.body.classList.contains("dark");
      var waveColor = isDark ? "rgba(34, 211, 238, 0.7)" : "rgba(14, 165, 233, 0.7)";
      
      time += 0.05;
      
      var barWidth = w / numBars;
      ctx.fillStyle = waveColor;
      
      for (var i = 0; i < numBars; i++) {
        // Animate bar height based on sine waves + noise
        var targetHeight = Math.sin(i * 0.15 + time) * Math.cos(i * 0.08 + time * 0.5) * 28 + 32;
        targetHeight = Math.max(3, targetHeight + Math.sin(time * 3 + i) * 3);
        
        // Smooth interpolation
        barHeights[i] += (targetHeight - barHeights[i]) * 0.18;
        
        var x = i * barWidth;
        var barH = barHeights[i];
        var y = h - barH;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + 2, y, barWidth - 4, barH, [4, 4, 0, 0]) : ctx.rect(x + 2, y, barWidth - 4, barH);
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(renderWave);
    }
    
    renderWave();
    
    // Auto-clean visualizer loop on modal close
    var observer = new MutationObserver(function() {
      if (!lightbox.classList.contains("is-active")) {
        cancelAnimationFrame(animationId);
        observer.disconnect();
      }
    });
    observer.observe(lightbox, { attributes: true, attributeFilter: ["class"] });
  }
})();
