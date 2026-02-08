function isHeartShaped(points) {
  if (points.length < 10) return false;

  // -----------------------------
  // Normalize
  // -----------------------------
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // -----------------------------
  // Analyze top-half lobes
  // -----------------------------
  const topHalf = points.filter((p) => p.y < centerY);

  let leftLobe = false;
  let rightLobe = false;

  for (const p of topHalf) {
    if (p.x < centerX - width * 0.15) leftLobe = true;
    if (p.x > centerX + width * 0.15) rightLobe = true;
  }

  if (!(leftLobe && rightLobe)) {
    console.log("two lobes fail");
    return false;
  }

  // -----------------------------
  // Check centerline crossings
  // -----------------------------
  let crossings = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1].x - centerX;
    const b = points[i].x - centerX;
    if (a === 0 || b === 0) continue;
    if (a * b < 0) crossings++;
  }

  if (crossings < 2) {
    console.log("crossings fail");
    return false;
  }

  return true;
}

export { isHeartShaped };
