'use strict';

// All values in meters (drawn in field-coordinate space)
const LINE_COLORS = [
  { id: 'white',  hex: '#ffffff' },
  { id: 'yellow', hex: '#ffeb3b' },
  { id: 'red',    hex: '#f44336' },
  { id: 'cyan',   hex: '#00bcd4' },
  { id: 'lime',   hex: '#76ff03' },
  { id: 'orange', hex: '#ff9800' },
];

// lineDash arrays in meters (scaled automatically with ctx transform)
const LINE_STYLES = {
  solid:  [],
  dotted: [0.25, 0.45],
  dashed: [1.1, 0.45, 0.25, 0.45],
};

const LINE_WIDTHS = {
  thin:   0.14,
  medium: 0.24,
  thick:  0.40,
};

// ── Render ────────────────────────────────────────────────────────────────────

function drawDrawings(ctx, drawings) {
  drawings.forEach(d => _drawPath(ctx, d));
}

function _drawPath(ctx, d) {
  if (!d || d.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = d.color;
  ctx.lineWidth   = d.lineWidth;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash(d.lineDash || []);
  ctx.beginPath();
  ctx.moveTo(d.points[0].x, d.points[0].y);
  for (let i = 1; i < d.points.length; i++) {
    ctx.lineTo(d.points[i].x, d.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

// ── Erase ─────────────────────────────────────────────────────────────────────

function eraseNear(drawings, mx, my, radiusM) {
  for (let i = drawings.length - 1; i >= 0; i--) {
    if (_pathHit(drawings[i].points, mx, my, radiusM)) {
      drawings.splice(i, 1);
    }
  }
}

function _pathHit(points, mx, my, r) {
  if (points.length === 1) {
    return Math.hypot(points[0].x - mx, points[0].y - my) < r;
  }
  for (let i = 0; i < points.length - 1; i++) {
    if (_segDist(points[i], points[i + 1], mx, my) < r) return true;
  }
  return false;
}

function _segDist(a, b, px, py) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - a.x, py - a.y);
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / lenSq));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}
