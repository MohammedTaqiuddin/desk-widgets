// 3D concave carousel for the landing page hero.

var CARDS = [
  { src: "calendar-dark.png", size: "medium" },
  { src: "analog-clock-light.png", size: "small" },
  { src: "weather-light.png", size: "medium" },
  { src: "focus-timer-dark.png", size: "small" },
  { src: "now-playing-dark.png", size: "medium" },
  { src: "system-dark.png", size: "small" },
  { src: "github-dark.png", size: "medium" },
  { src: "analog-clock-dark.png", size: "small" },
  { src: "reminders-light.png", size: "medium" },
  { src: "focus-timer-light.png", size: "small" },
  { src: "f1-timing-dark.png", size: "medium" },
  { src: "notes-dark.png", size: "small" },
  { src: "photo-frame.png", size: "medium" },
  { src: "analog-clock-light.png", size: "small" },
  { src: "f1-timing-dark.png", size: "medium" },
  { src: "focus-timer-dark.png", size: "small" },
  { src: "calendar-dark.png", size: "medium" },
  { src: "system-dark.png", size: "small" },
  { src: "weather-light.png", size: "medium" },
  { src: "analog-clock-dark.png", size: "small" },
  { src: "now-playing-dark.png", size: "medium" },
  { src: "focus-timer-light.png", size: "small" },
  { src: "github-dark.png", size: "medium" },
  { src: "notes-dark.png", size: "small" },
  { src: "reminders-light.png", size: "medium" },
  { src: "analog-clock-light.png", size: "small" },
];

var N = CARDS.length;
var REF_W = 1200;
var R = 629, PERSP = 600, ZOFF = 0;
var SY = 0.5, SX = 0.15, CURVE = 2;
var CH = 90, CR = 20, SPEED = 0.01, DRAG = 0.2;
var DEG = 180 / Math.PI;

function widthFor(size) {
  return size === "small" ? CH : Math.round(CH * 364 / 170);
}

var offsets = [];
(function () {
  var arcs = [];
  for (var i = 0; i < N; i++) arcs.push((widthFor(CARDS[i].size) / R) * DEG);
  var total = 0;
  for (var i = 0; i < N; i++) total += arcs[i];
  var gap = (360 - total) / N;
  offsets.push(0);
  var pos = 0;
  for (var i = 1; i < N; i++) {
    pos += arcs[i - 1] / 2 + gap + arcs[i] / 2;
    offsets.push(pos);
  }
})();

export function carousel(container, basePath) {
  var ring = document.createElement("div");
  ring.className = "carousel-ring";
  var els = [];

  for (var i = 0; i < N; i++) {
    var card = document.createElement("div");
    card.className = "carousel-card";
    var img = document.createElement("img");
    img.src = basePath + CARDS[i].src;
    img.alt = CARDS[i].src.replace(".png", "").replace(/-/g, " ");
    img.draggable = false;
    card.appendChild(img);
    ring.appendChild(card);
    els.push(card);
  }
  container.appendChild(ring);

  var angle = 0, dragging = false, dragStartX = 0, dragAngle = 0, lastTime = 0;
  var paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function render() {
    var w = container.offsetWidth;
    var ratio = w / REF_W;
    var shrink = Math.max(0, 1 - ratio);
    var sc = ratio < 1 ? 0.6 + 0.4 * ratio : ratio;
    var r = R * sc, zoff = (ZOFF + R * shrink * 1.4) * sc, cr = Math.round(CR * sc);
    ring.style.perspective = (PERSP * Math.max(sc, 0.85)) + "px";

    for (var i = 0; i < N; i++) {
      var cw = Math.round(widthFor(CARDS[i].size) * sc);
      var ch = Math.round(CH * sc);
      var theta = angle + offsets[i];
      var rad = theta * Math.PI / 180;
      var x = -r * Math.sin(rad);
      var z = -r * Math.cos(rad) + zoff;
      var wrapped = ((theta % 360) + 360) % 360;
      if (wrapped > 180) wrapped -= 360;
      var absDeg = Math.abs(wrapped);
      var opacity = Math.max(0.85, 1 - 0.15 * Math.min(absDeg / 150, 1));
      var t = Math.pow(Math.min(absDeg / 90, 1), CURVE);
      var sy = 1 + SY * t;
      var sx = 1 + SX * t;
      var el = els[i];
      el.style.width = cw + "px";
      el.style.height = ch + "px";
      el.style.borderRadius = cr + "px";
      el.style.transform =
        "translate3d(-50%,-50%,0) translateX(" + x.toFixed(1) + "px) " +
        "translateZ(" + z.toFixed(1) + "px) rotateY(" + wrapped.toFixed(2) + "deg) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = Math.round(1000 - z);
    }
  }

  function loop(time) {
    if (lastTime === 0) lastTime = time;
    var dt = time - lastTime;
    lastTime = time;
    if (!paused && !dragging) angle += SPEED * dt * 0.06;
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  container.addEventListener("mousedown", function (e) {
    dragging = true; dragStartX = e.clientX; dragAngle = angle;
    container.style.cursor = "grabbing"; e.preventDefault();
  });
  window.addEventListener("mousemove", function (e) {
    if (dragging) angle = dragAngle - (e.clientX - dragStartX) * DRAG;
  });
  window.addEventListener("mouseup", function () {
    if (dragging) { dragging = false; container.style.cursor = ""; }
  });
  container.addEventListener("touchstart", function (e) {
    dragging = true; dragStartX = e.touches[0].clientX; dragAngle = angle;
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (dragging) angle = dragAngle - (e.touches[0].clientX - dragStartX) * DRAG;
  }, { passive: true });
  window.addEventListener("touchend", function () { dragging = false; });
  window.addEventListener("resize", render);
}
