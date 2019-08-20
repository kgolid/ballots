export default function(
  p,
  box,
  xu,
  yu,
  zu,
  depth,
  shades,
  shadeOpacity,
  strokeOpacity,
  strokeWeight,
  hiddenTop,
  hiddenLeft,
  t1,
  t2,
  t3
) {
  const bx = box.x1 - box.x_off * depth; // X Position
  const by = box.y1 - box.y_off * depth; // Y Position
  const bw = box.w + box.x_off * depth; // Width
  const bh = box.h + box.y_off * depth; // Height
  const bd = box.z1 * depth; // Depth
  p.fill(box.col);
  p.noStroke();

  displayFront();
  displayLeft();
  displayTop();

  if (shadeOpacity !== 0) {
    p.fill(0, shades[0] * shadeOpacity);
    displayFront();

    p.fill(0, shades[1] * shadeOpacity);
    displayLeft();

    p.fill(0, shades[2] * shadeOpacity);
    displayTop();
  }

  p.noFill();
  p.stroke(0, strokeOpacity);
  p.strokeWeight(Math.ceil(strokeWeight / 2));
  if (!(box.x1 === 0 && hiddenLeft) && !(box.y1 === 0 && hiddenTop))
    displayInteriorFrontLine();

  if (!(box.x1 === 0 && hiddenLeft)) displayInteriorTopLine();

  if (!(box.y1 === 0 && hiddenTop)) displayInteriorLeftLine();

  p.strokeWeight(strokeWeight);
  displayShape();

  function displayFront() {
    p.beginShape();
    p.vertex(...getPos(bx, by, bd, t1, t2, t3));
    p.vertex(...getPos(bx + bw, by, bd, t1, t2, t3));
    p.vertex(...getPos(bx + bw, by + bh, bd, t1, t2, t3));
    p.vertex(...getPos(bx, by + bh, bd, t1, t2, t3));
    p.endShape();
  }

  function displayLeft() {
    p.beginShape();
    p.vertex(...getPos(bx, by, bd, t1, t2, t3));
    p.vertex(...getPos(bx, by + bh, bd, t1, t2, t3));
    p.vertex(...getPos(bx, by + bh, 0, t1, t2, t3));
    p.vertex(...getPos(bx, by, 0, t1, t2, t3));
    p.endShape();
  }

  function displayTop() {
    p.beginShape();
    p.vertex(...getPos(bx + bw, by, bd, t1, t2, t3));
    p.vertex(...getPos(bx + bw, by, 0, t1, t2, t3));
    p.vertex(...getPos(bx, by, 0, t1, t2, t3));
    p.vertex(...getPos(bx, by, bd, t1, t2, t3));
    p.endShape();
  }

  function displayInteriorFrontLine() {
    p.line(...getPos(bx, by, bd, t1, t2, t3), ...getPos(bx, by, 0, t1, t2, t3));
  }

  function displayInteriorLeftLine() {
    p.line(
      ...getPos(bx, by, bd, t1, t2, t3),
      ...getPos(bx + bw, by, bd, t1, t2, t3)
    );
  }

  function displayInteriorTopLine() {
    p.line(
      ...getPos(bx, by, bd, t1, t2, t3),
      ...getPos(bx, by + bh, bd, t1, t2, t3)
    );
  }

  function displayShape() {
    p.beginShape();
    p.vertex(...getPos(bx + bw, by, 0, t1, t2, t3));
    p.vertex(...getPos(bx + bw, by, bd, t1, t2, t3));
    p.vertex(...getPos(bx + bw, by + bh, bd, t1, t2, t3));
    p.vertex(...getPos(bx, by + bh, bd, t1, t2, t3));
    p.vertex(...getPos(bx, by + bh, 0, t1, t2, t3));
    p.endShape();
  }

  function getPos(x, y, z, tz, ty, tx) {
    const zc = tz(x * xu[0] + y * yu[0], x * xu[1] + y * yu[1]);
    const yc = ty(x * xu[0] + z * zu[0], x * xu[1] + z * zu[1]);
    const xc = tx(y * yu[0] + z * zu[0], y * yu[1] + z * zu[1]);

    return [zc[0] + yc[0] + xc[0], zc[1] + yc[1] + xc[1]];
  }

  function getPos2(x, y, z, t = (x, y) => [x, y]) {
    return t(
      x * xu[0] + y * yu[0] + z * zu[0],
      x * xu[1] + y * yu[1] + z * zu[1]
    );
  }
}
