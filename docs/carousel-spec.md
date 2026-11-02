# 3D Concave Carousel — Implementation Spec

## Geometry

The carousel is a **concave cylinder** — the viewer looks at the **inside** of a circular ring.
Cards at the center are pushed far back (appear small via CSS perspective); cards at
the edges come forward (appear larger). `backface-visibility: hidden` hides the back
half of the ring automatically.

### Coordinate system

- **X** — horizontal, positive = right.
- **Z** — depth, negative = away from the viewer. CSS `perspective` sits at Z = 0;
  the viewer's eye is at Z = +perspective.
- Cards are placed with `position: absolute; left: 50%; top: 50%` inside a
  `transform-style: preserve-3d` container.

### Circle parameters (at 1200 px reference width)

| Parameter | Value | Role |
|-----------|-------|------|
| **Rx** | 850 px | Horizontal spread radius (ellipse semi-axis) |
| **Rz** | 629 px | Depth radius (controls how far center is pushed back) |
| **Zoff** | 0 px | Z-offset added after the cos term — keep at 0 for maximum depth |
| **perspective** | 600 px | CSS perspective on the carousel container |
| **N** | 26 | Total cards around the full ring |
| **STEP** | 360 / N ≈ 13.846° | Angular spacing between adjacent cards |

> **Depth note**: the Framer reference uses Zoff ≈ 39, giving a center depth of
> Z = −590 (≈ 50 % apparent size). Setting Zoff to **0** pushes the center to
> Z = −629 (≈ 49 % apparent size) for an even deeper bowl.

### Per-card transform

For card *i* at animation time, let `θ = baseAngle + i × STEP` (degrees).

```
rad   = θ × π / 180
X     = −Rx × sin(rad)
Z     = −Rz × cos(rad) + Zoff
```

The CSS transform string:

```
translate3d(-50%, -50%, 0)
translateX(<X>px)
translateZ(<Z>px)
rotateY(<wrapped θ>deg)
```

where `wrapped θ` is θ normalised to [−180, 180]:

```
wrapped = ((θ % 360) + 360) % 360
if (wrapped > 180) wrapped -= 360
```

### Perspective scale (what the viewer sees)

A card at depth Z appears scaled by `perspective / (perspective − Z)`:

| Position | Z (Zoff = 0) | Apparent scale |
|----------|-------------|---------------|
| Center (θ = 0°) | −629 | 600 / 1229 ≈ **0.49×** |
| 45° from center | −445 | 600 / 1045 ≈ **0.57×** |
| 70° from center | −215 | 600 / 815 ≈ **0.74×** |
| 85° (near edge) | −55 | 600 / 655 ≈ **0.92×** |
| 90° (exact side) | 0 | 600 / 600 = **1.00×** |

Cards past ±90° have positive Z (closer than the perspective plane) and are
hidden by `backface-visibility: hidden`.

## Opacity

Linear fade based on angular distance from front:

```
absDeg  = |wrapped θ|
opacity = max(0.85, 1 − 0.15 × min(absDeg / 150, 1))
```

- Front (θ = 0°): **1.0**
- 75° from front: **0.925**
- 150° from front: **0.85** (minimum)

## Z-index (stacking order)

Center card must stack on top (it's the focal point even though it's furthest back).

```
zIndex = round(1000 − Z)
```

More negative Z → higher z-index → center card on top.

## Viewport scaling

All dimensions scale proportionally to viewport width so the carousel always
fills edge to edge, matching the Framer `<meta name="viewport" content="width=1200">`
behaviour.

```
scale       = innerWidth / 1200
Rx_actual   = Rx × scale
Rz_actual   = Rz × scale
Zoff_actual = Zoff × scale
perspective = 600 × scale
cardWidth   = baseCardWidth × scale
cardHeight  = baseCardHeight × scale
borderRadius = baseBorderRadius × scale
```

## Card sizes (mixed variant)

Two sizes reflecting actual widget proportions:

| Type | Width | Height | Border-radius | Examples |
|------|-------|--------|---------------|----------|
| Square | 124 px | 124 px | 20 px | Analog clock, Focus timer, System |
| Wide | 200 px | 93 px | 16 px | Calendar, Weather, Now Playing, GitHub, Reminders |

All values are at the 1200 px reference width and scale with the viewport.

## Animation

Driven by `requestAnimationFrame`. Each frame:

```
baseAngle += speed × deltaTime × 0.06
```

where `speed = 0.008`. This gives a slow, continuous rotation.

### Drag interaction

Mouse/touch drag rotates the carousel. Dragging **left** moves cards **left**
(natural direction):

```
baseAngle = dragStartAngle − (currentX − dragStartX) × 0.2
```

The negative sign ensures natural drag direction with the `X = −Rx × sin(θ)`
formula.

### Reduced motion

If `prefers-reduced-motion: reduce` matches, auto-rotation pauses. Drag still
works.

## CSS structure

```
.scene      — 100vw × 100vh, overflow hidden, background #0b0b0c
  .carousel — position absolute, inset 0, perspective + preserve-3d, overflow hidden
    .card   — position absolute, left 50%, top 50%, backface-visibility hidden
      img   — 100% × 100%, object-fit cover, pointer-events none
```

## Tuning guide

| Want | Change |
|------|--------|
| **Deeper center** | Decrease Zoff (0 = maximum depth) or increase Rz |
| **Wider horizontal spread** | Increase Rx |
| **More cards visible** | Increase N (keeps same ring, tighter angular spacing) |
| **Faster rotation** | Increase speed |
| **More dramatic size difference** | Decrease perspective (e.g. 400) |
| **Subtler size difference** | Increase perspective (e.g. 900) |
| **Sharper opacity fade** | Decrease the /150 divisor |
