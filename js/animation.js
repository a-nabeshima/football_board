'use strict';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateFrames(fA, fB, t) {
  const players = fA.players.map((p, i) => {
    const q = fB.players[i] || p;
    return { ...p, x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) };
  });
  const ball = {
    x: lerp(fA.ball.x, fB.ball.x, t),
    y: lerp(fA.ball.y, fB.ball.y, t),
  };
  // Blend drawings: crossfade at midpoint
  const drawings = t < 0.5 ? fA.drawings : fB.drawings;
  return { players, ball, drawings };
}

// ── Animation controller ──────────────────────────────────────────────────────

const anim = {
  _raf:      null,
  _ts:       null,
  isPlaying: false,
  frameIdx:  0,
  t:         0,
  duration:  1.5,   // seconds per transition

  start(frames, onFrame, onEnd) {
    if (frames.length < 2) return;
    this.isPlaying = true;
    this.frameIdx  = 0;
    this.t         = 0;
    this._ts       = null;
    this._tick(frames, onFrame, onEnd);
  },

  _tick(frames, onFrame, onEnd) {
    this._raf = requestAnimationFrame(ts => {
      if (!this.isPlaying) return;
      if (this._ts === null) this._ts = ts;
      const dt = (ts - this._ts) / 1000;
      this._ts = ts;
      this.t  += dt / this.duration;

      if (this.t >= 1) {
        this.t = 0;
        this.frameIdx++;
        if (this.frameIdx >= frames.length - 1) {
          onFrame(frames[frames.length - 1]);
          this.stop();
          onEnd && onEnd();
          return;
        }
      }

      onFrame(interpolateFrames(frames[this.frameIdx], frames[this.frameIdx + 1], this.t));
      this._tick(frames, onFrame, onEnd);
    });
  },

  stop() {
    this.isPlaying = false;
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  },
};
