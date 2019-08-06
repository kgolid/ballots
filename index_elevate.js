import Apparatus from 'apparatus-generator';
import * as tome from 'chromotome';
import toposort from 'toposort';

let sketch = function(p) {
  let THE_SEED;

  const mag = 18;
  const xu = [1 * mag, -0.2 * mag]; // X Unit
  const yu = [0.3 * mag, 0.8 * mag]; // Y Unit
  const zu = [0.02 * mag, -0.1 * mag]; // Y Unit

  const decorEnabled = false;
  const shadingEnabled = true;
  const strokeEnabled = true;

  const palette = get_palette();
  const generator = new Apparatus(10, 18, {
    simple: true,
    extension_chance: 0.97,
    horizontal_symmetry: false,
    vertical_chance: 0.3
  });

  const innerApparatusOptions = {
    simple: true,
    extension_chance: 0.8,
    horizontal_symmetry: false,
    vertical_chance: 0.3,
    color_mode: 'random',
    colors: palette.colors
  };

  let layout;

  p.setup = function() {
    p.createCanvas(950, 950);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.noFill();
    p.smooth();
    p.frameRate(1);
    p.background(palette.background ? palette.background : '#eee');
    p.strokeJoin(p.ROUND);

    if (strokeEnabled) p.stroke(palette.stroke ? palette.stroke : '#111');
    else p.noStroke();
  };

  p.draw = function() {
    reset();
    displayLayout(4, true);
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
  };

  function reset() {
    p.background(palette.background ? palette.background : '#eee');
    layout = get_overlap_graph(generator.generate().flatMap(createGrid));
  }

  function displayLayout(depth, colorize) {
    p.translate(45, 205);
    layout.forEach(i => {
      displayBox(i, depth, colorize);
    });
  }

  function displayBox(box, maxLevel, colorize) {
    if (box.content != null && box.content.length > 0 && maxLevel > box.level) {
      box.content.forEach(c => displayBox(c, maxLevel, colorize));
    }

    if (box.filled && colorize) p.fill(box.col);
    else p.noFill();

    p.beginShape();
    p.vertex(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
    );
    p.vertex(box.x1 * xu[0] + box.y1 * yu[0], box.x1 * xu[1] + box.y1 * yu[1]);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
    );
    p.vertex(
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1]
    );
    p.endShape(p.CLOSE);

    if (shadingEnabled) {
      p.fill(0, 80);
      p.beginShape();
      p.vertex(
        box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      );
      p.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      );
      p.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
      );
      p.vertex(
        box.x1 * xu[0] + box.y1 * yu[0],
        box.x1 * xu[1] + box.y1 * yu[1]
      );
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(
        (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      );
      p.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      );
      p.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
      );
      p.vertex(
        (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0],
        (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1]
      );
      p.endShape(p.CLOSE);
    }

    if (decorEnabled && colorize && box.filled && box.h > 1.5 && box.w > 3) {
      displayLegend(box);
    }

    if (decorEnabled && colorize && box.filled && box.crossed) {
      displayCross(box);
    }
  }

  function displayLegend(box) {
    p.line(
      (box.x1 + 0.5) * xu[0] + (box.y1 + 0.5) * yu[0] + box.z1 * zu[0],
      (box.x1 + 0.5) * xu[1] + (box.y1 + 0.5) * yu[1] + box.z1 * zu[1],
      (box.x1 + box.legend_width) * xu[0] +
        (box.y1 + 0.5) * yu[0] +
        box.z1 * zu[0],
      (box.x1 + box.legend_width) * xu[1] +
        (box.y1 + 0.5) * yu[1] +
        box.z1 * zu[1]
    );
  }

  function displayCross(box) {
    p.line(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1],
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
    p.line(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1],
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    );
  }

  function createGrid(box) {
    const { x1, y1, w, h } = box;
    const cols = Math.ceil((Math.random() * w) / 3);
    const rows = Math.ceil((Math.random() * h) / 2);
    const cell_w = w / cols;
    const cell_h = h / rows;

    const apparatus = createApparatus(cell_w, cell_h).map(app => ({
      ...app,
      z1: 25 + Math.floor(Math.random() * 10)
    }));

    let grid = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = {
          x1: x1 + j * cell_w,
          y1: y1 + i * cell_h,
          w: cell_w,
          h: cell_h,
          level: 1,
          filled: false
        };
        const content = apparatus.map(app => ({
          ...app,
          x1: app.x1 + cell.x1,
          y1: app.y1 + cell.y1,
          level: 2,
          filled: true,
          crossed: app.w < 1.5 && app.h < 1.5 && Math.random() < 0.3,
          legend_width: 2 + Math.random() * (app.w - 3)
        }));

        grid = grid.concat(content);
      }
    }
    return grid;
  }

  function createApparatus(w, h) {
    const cols = Math.round(w, 0);
    const rows = Math.round(h, 0);

    const w_unit = w / cols;
    const h_unit = h / rows;

    const generator = new Apparatus(
      (cols - 11) / 2,
      (rows - 11) / 2,
      innerApparatusOptions
    );

    return generator.generate().map(a => ({
      x1: (a.x1 - 1) * w_unit,
      y1: (a.y1 - 1) * h_unit,
      w: a.w * w_unit,
      h: a.h * h_unit,
      col: a.col
    }));
  }

  function overlaps(a, b) {
    const lca = [a.x1, a.y1];
    const rca = [a.x1 + a.w, a.y1 + a.h];
    const ba = [a.x1, a.y1 + a.h];

    const lcb = [b.x1, b.y1];
    const rcb = [b.x1 + b.w, b.y1 + b.h];
    const bb = [b.x1, b.y1 + b.h];

    if (a.y1 + a.h <= b.y1 + 0.001 || a.x1 + 0.001 >= b.x1 + b.w) return false;

    if (ba[1] + ba[0] < bb[1] + bb[0]) {
      // A is left of B
      if (rca[1] + rca[0] <= lcb[1] + lcb[0]) return false;
      return rca[1] - rca[0] > lcb[1] - lcb[0]; // positive if A is in front of B
    }

    if (ba[1] + ba[0] > bb[1] + bb[0]) {
      // A is right of B
      if (lca[1] + lca[0] >= rcb[1] + rcb[0]) return false;
      return lca[1] - lca[0] > rcb[1] - rcb[0]; // positive if A is in front of B
    }
    return ba[1] - ba[0] > bb[1] - bb[0];
  }

  function get_overlap_graph(boxes) {
    const nodes = [];
    boxes.forEach((box, i) => nodes.push(i));

    const edges = [];
    boxes.forEach((b1, i) => {
      boxes.forEach((b2, j) => {
        if (overlaps(b1, b2)) edges.push([i, j, b1, b2]);
      });
    });

    const overlapping = toposort(edges);
    return overlapping.reverse().map(i => boxes[i]);
  }
};

new p5(sketch);

function get_palette() {
  const url = window.location.href.split('#');
  if (url.length === 1) return tome.get();
  return tome.get(url[1]);
}
