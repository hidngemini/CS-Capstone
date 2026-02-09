function cubicBezier(p0, p1, p2, p3) {
  return function (t) {
    const u = 1 - t;
    const t2 = t * t;
    const u2 = u * u;
    const u3 = u2 * u;
    const t3 = t2 * t;

    return {
      x: u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
      y: u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y
    };
  };
}