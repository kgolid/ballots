import Apparatus from 'apparatus-generator';
import * as tome from 'chromotome';
import toposort from 'toposort';
import perspective from 'change-perspective';

import ui from './ui';
import display from './display';

/*
// Options suitable for print.
let opts = {
  cubedimX: 15,
  cubedimY: 50,
  cubedimZ: 15,
  depthDim: 2,
  mag: 10,
  tx: 0,
  ty: -600,
  shadeOpacity: 30,
  outerStrokeWeight: 2,
  innerStrokeWeight: 2,
  outerSize: 0.99,
  minGridSize: 4,
  innerSize: 0.78,
  perspective: 0.95,
  colorMode: 'group',
  palette: 'tsu_arcade',
  paletteShift: 0
};
*/

let opts = {
  cubedimX: 18,
  cubedimY: 18,
  cubedimZ: 18,
  depthDim: 2,
  mag: 5,
  tx: 0,
  ty: 0,
  shadeOpacity: 25,
  outerStrokeWeight: 2,
  innerStrokeWeight: 1,
  outerSize: 0.97,
  minGridSize: 4,
  innerSize: 0.78,
  perspective: 0.85,
  colorMode: 'group',
  palette: 'tsu_arcade',
  paletteShift: 0,
};

let sketch = function (p) {
  let THE_SEED;

  let cubedimX;
  let cubedimY;
  let cubedimZ;
  let tx, ty;

  const xr = (-1 * Math.PI) / 6;
  const yr = (3 * Math.PI) / 6;
  const zr = (1 * Math.PI) / 6;

  let xu, yu, zu;
  let nxu, nyu, nzu;

  let maxDepth;
  const depthSteps = 8;

  let paletteShift;
  let palette;
  let strokeCol;
  let shadeOpacity;
  let outerStrokeWeight, innerStrokeWeight;

  let sectionAppOpts, atomAppOpts;
  let minGridSize;

  let persp;

  let frontLayout, leftLayout, topLayout;

  p.setup = function () {
    p.createCanvas(1000, 1000);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.pixelDensity(2);
    p.noFill();
    p.smooth();
    p.frameRate(1);
    p.strokeJoin(p.ROUND);
    p.noLoop();

    ui(opts, generateAndDraw, updateAndDraw, print);

    generateAndDraw();
  };

  function generateAndDraw() {
    updateGlobals(opts);
    reset();
    displayLayout();
  }

  function updateAndDraw() {
    updateGlobals(opts);
    displayLayout();
  }

  function updateGlobals(opts) {
    cubedimX = opts.cubedimX;
    cubedimY = opts.cubedimY;
    cubedimZ = opts.cubedimZ;

    tx = opts.tx;
    ty = opts.ty;

    xu = [Math.cos(xr) * opts.mag, Math.sin(xr) * opts.mag];
    yu = [Math.cos(yr) * opts.mag, Math.sin(yr) * opts.mag];
    zu = [Math.cos(zr) * opts.mag, Math.sin(zr) * opts.mag];

    nxu = xu.map((v) => -v);
    nyu = yu.map((v) => -v);
    nzu = zu.map((v) => -v);

    shadeOpacity = opts.shadeOpacity;
    outerStrokeWeight = opts.outerStrokeWeight;
    innerStrokeWeight = opts.innerStrokeWeight;

    maxDepth = opts.depthDim;
    persp = opts.perspective;

    palette = tome.get(opts.palette);
    paletteShift = opts.paletteShift;
    strokeCol = palette.stroke ? palette.stroke : '#000';

    minGridSize = opts.minGridSize;

    sectionAppOpts = {
      simple: true,
      extension_chance: opts.outerSize,
      horizontal_symmetry: false,
      vertical_chance: 0.5,
    };

    atomAppOpts = {
      simple: true,
      extension_chance: opts.innerSize,
      horizontal_symmetry: false,
      vertical_chance: 0.5,
      color_mode: opts.colorMode,
      group_size: 0.4,
      colors: [...Array(1000).keys()],
    };
  }

  function reset() {
    const generatorFront = new Apparatus(cubedimX, cubedimY, sectionAppOpts);
    const generatorLeft = new Apparatus(cubedimY, cubedimZ, sectionAppOpts);
    const generatorTop = new Apparatus(cubedimZ, cubedimX, sectionAppOpts);
    const frontApp = generatorFront.generate(null, null, true);
    const leftApp = generatorLeft.generate(
      frontApp[1].map((i) => ({ ...i[1], v: i[1].h })),
      null,
      true
    );
    const topApp = generatorTop.generate(
      leftApp[1].map((i) => ({ ...i[1], v: i[1].h })),
      frontApp[1][1].map((i) => ({ ...i, h: i.v })),
      true
    );

    const frontGrids = frontApp[0].map((a) => createGrid(a, null, null));
    const leftGrids = leftApp[0].map((a) => createGrid(a, frontGrids, null));
    const topGrids = topApp[0].map((a) => createGrid(a, leftGrids, frontGrids));

    frontLayout = get_overlap_graph(frontGrids.flatMap((g) => g.content));
    leftLayout = get_overlap_graph(leftGrids.flatMap((g) => g.content));
    topLayout = get_overlap_graph(topGrids.flatMap((g) => g.content));
  }

  function displayLayout() {
    p.push();
    p.translate(tx + p.width / 2, ty + p.height / 2);
    p.background(palette.background ? palette.background : '#eee');

    const ft = perspective(...getSrcDst(xu, yu, persp, cubedimX));
    const lt = perspective(...getSrcDst(yu, nzu, persp, cubedimX));
    const tt = perspective(...getSrcDst(nzu, xu, persp, cubedimX));

    frontLayout.forEach((i) =>
      displayBox(i, xu, yu, zu, [0.5, 1, 0], true, true, ft, tt, lt)
    );
    leftLayout.forEach((i) =>
      displayBox(i, yu, nzu, nxu, [1, 0, 0.5], false, true, lt, ft, tt)
    );
    topLayout.forEach((i) =>
      displayBox(i, nzu, xu, nyu, [0, 0.5, 1], false, false, tt, lt, ft)
    );
    p.pop();
  }

  function displayBox(box, xu, yu, zu, shades, hiddenTop, hiddenLeft, t1, t2, t3) {
    display(
      p,
      box,
      xu,
      yu,
      zu,
      maxDepth,
      shades,
      shadeOpacity,
      palette.colors,
      paletteShift,
      strokeCol,
      innerStrokeWeight,
      outerStrokeWeight,
      hiddenTop,
      hiddenLeft,
      t1,
      t2,
      t3
    );
  }

  function createGrid(box, topside, leftside) {
    const { x1, y1, w, h } = box;

    const topsideGrid =
      topside && y1 == 1 ? topside.filter((c) => c.x1 == 1 && c.y1 == x1)[0] : null;

    const leftsideGrid =
      leftside && x1 == 1 ? leftside.filter((c) => c.y1 == 1 && c.x1 == y1)[0] : null;

    const cols = topsideGrid
      ? topsideGrid.rows
      : Math.ceil((Math.random() * w) / minGridSize);
    const rows = leftsideGrid
      ? leftsideGrid.cols
      : Math.ceil((Math.random() * h) / minGridSize);

    const cell_w = w / cols;
    const cell_h = h / rows;

    const init_top = topsideGrid
      ? topsideGrid.apparatus.map((i) => ({ ...i[1], v: i[1].h }))
      : null;

    const init_left = leftsideGrid
      ? leftsideGrid.apparatus[1].map((i) => ({ ...i, h: i.v }))
      : null;

    const apparatus = createApparatus(cell_w, cell_h, init_top, init_left);
    let grid = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const content = apparatus[0].map((app) => {
          const xpos = x1 + app.x1 + j * cell_w - 1;
          const ypos = y1 + app.y1 + i * cell_h - 1;
          let y_offset =
            topsideGrid && i == 0 && ypos <= 0
              ? topsideGrid.content.filter(
                  (c) => c.x1 <= 0 && Math.max(c.y1, 0) == xpos
                )[0].z1
              : 0;
          let x_offset =
            leftsideGrid && j == 0 && xpos <= 0
              ? leftsideGrid.content.filter(
                  (c) => c.y1 <= 0 && Math.max(c.x1, 0) == ypos
                )[0].z1
              : 0;
          return {
            ...app,
            x1: xpos,
            y1: ypos,
            w: app.w,
            h: app.h,
            x_off: x_offset,
            y_off: y_offset,
            level: 2,
            filled: true,
          };
        });

        grid = grid.concat(content);
      }
    }
    return {
      x1: x1,
      y1: y1,
      cols: cols,
      rows: rows,
      apparatus: apparatus[1],
      content: grid,
    };
  }

  function createApparatus(w, h, top, left) {
    const cols = Math.round(w, 0);
    const rows = Math.round(h, 0);

    const w_unit = w / cols;
    const h_unit = h / rows;

    const generator = new Apparatus((cols - 11) / 2, (rows - 11) / 2, atomAppOpts);

    const apparatus = generator.generate(top, left, true);
    apparatus[0] = apparatus[0].map((a) => ({
      x1: (a.x1 - 1) * w_unit,
      y1: (a.y1 - 1) * h_unit,
      z1: Math.floor(Math.random() * depthSteps) / depthSteps,
      w: a.w * w_unit,
      h: a.h * h_unit,
      col: a.col,
    }));

    return apparatus;
  }

  function overlaps(a, b) {
    const lca = [a.x1 + a.w, a.y1];
    const rca = [a.x1, a.y1 + a.h];
    const ba = [a.x1, a.y1];

    const lcb = [b.x1 + b.w, b.y1];
    const rcb = [b.x1, b.y1 + b.h];
    const bb = [b.x1, b.y1];

    if (a.y1 + 0.005 >= b.y1 + b.h || a.x1 + 0.005 >= b.x1 + b.w) return false;

    if (ba[1] - ba[0] < bb[1] - bb[0]) {
      // A is left of B
      if (rca[1] - rca[0] <= lcb[1] - lcb[0]) return false;
      return rca[1] + rca[0] < lcb[1] + lcb[0]; // positive if A is in front of B
    }

    if (ba[1] - ba[0] > bb[1] - bb[0]) {
      // A is right of B
      if (lca[1] - lca[0] >= rcb[1] - rcb[0]) return false;
      return lca[1] + lca[0] < rcb[1] + rcb[0]; // positive if A is in front of B
    }
    return ba[1] + ba[0] < bb[1] + bb[0];
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
    return overlapping.reverse().map((i) => boxes[i]);
  }

  function print() {
    p.saveCanvas('sketch_' + THE_SEED, 'png');
  }

  p.keyPressed = function () {
    if (p.keyCode === 80) print();
    if (p.keyCode === 82) generateAndDraw();
  };
};
new p5(sketch);

function getSrcDst(xu, yu, persp, dim) {
  const m = dim * 2 + 11;

  const src = [
    0,
    0,
    m * xu[0],
    m * xu[1],
    m * (xu[0] + yu[0]),
    m * (xu[1] + yu[1]),
    m * yu[0],
    m * yu[1],
  ];
  const dst = [
    0,
    0,
    m * xu[0],
    m * xu[1],
    m * (xu[0] + yu[0]) * persp,
    m * (xu[1] + yu[1]) * persp,
    m * yu[0],
    m * yu[1],
  ];

  return [src, dst];
}
