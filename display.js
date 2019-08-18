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
  hiddenLeft
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
    p.vertex(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.vertex(
      (bx + bw) * xu[0] + by * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.vertex(
      (bx + bw) * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
    p.vertex(
      bx * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      bx * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
    p.endShape();
  }

  function displayLeft() {
    p.beginShape();
    p.vertex(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.vertex(
      bx * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      bx * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
    p.vertex(bx * xu[0] + (by + bh) * yu[0], bx * xu[1] + (by + bh) * yu[1]);
    p.vertex(bx * xu[0] + by * yu[0], bx * xu[1] + by * yu[1]);
    p.endShape();
  }

  function displayTop() {
    p.beginShape();
    p.vertex(
      (bx + bw) * xu[0] + by * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.vertex((bx + bw) * xu[0] + by * yu[0], (bx + bw) * xu[1] + by * yu[1]);
    p.vertex(bx * xu[0] + by * yu[0], bx * xu[1] + by * yu[1]);
    p.vertex(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.endShape();
  }

  function displayInteriorFrontLine() {
    p.line(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1],
      bx * xu[0] + by * yu[0],
      bx * xu[1] + by * yu[1]
    );
  }
  function displayInteriorLeftLine() {
    p.line(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1],
      (bx + bw) * xu[0] + by * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + by * yu[1] + bd * zu[1]
    );
  }

  function displayInteriorTopLine() {
    p.line(
      bx * xu[0] + by * yu[0] + bd * zu[0],
      bx * xu[1] + by * yu[1] + bd * zu[1],
      bx * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      bx * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
  }

  function displayShape() {
    p.beginShape();
    p.vertex((bx + bw) * xu[0] + by * yu[0], (bx + bw) * xu[1] + by * yu[1]);
    p.vertex(
      (bx + bw) * xu[0] + by * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + by * yu[1] + bd * zu[1]
    );
    p.vertex(
      (bx + bw) * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      (bx + bw) * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
    p.vertex(
      bx * xu[0] + (by + bh) * yu[0] + bd * zu[0],
      bx * xu[1] + (by + bh) * yu[1] + bd * zu[1]
    );
    p.vertex(bx * xu[0] + (by + bh) * yu[0], bx * xu[1] + (by + bh) * yu[1]);
    p.endShape();
  }
}
