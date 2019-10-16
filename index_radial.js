import Apparatus from 'apparatus-generator';
import * as tome from 'chromotome';

let sketch = function(p) {
  let THE_SEED;

  const mag = 10;
  const xu = [mag, 0]; //[1 * mag, -0.2 * mag]; // X Unit
  const yu = [0, mag]; //[0.3 * mag, 0.8 * mag]; // Y Unit

  const palette = get_palette();
  const generator = new Apparatus(15, 30, {
    simple: true,
    extension_chance: 0.95,
    horizontal_symmetry: false,
    vertical_chance: 0.5
  });

  const innerApparatusOptions = {
    simple: true,
    extension_chance: 0.68,
    horizontal_symmetry: false,
    vertical_chance: 0.5,
    color_mode: 'random',
    colors: palette.colors
  };

  let layout;
  let tick;

  p.setup = function() {
    p.createCanvas(950, 950);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.noFill();
    p.smooth();
    //p.frameRate(3);
    p.stroke(palette.stroke ? palette.stroke : '#111');
    p.background(palette.background ? palette.background : '#eee');
    p.noLoop();

    tick = 0;
  };

  p.draw = function() {
    reset();
    displayLayout(4, true);
    /*
    if (tick % 9 == 0) reset();
    displayLayout(tick % 9, tick % 9 > 2);
    tick++;
    */
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
  };

  function reset() {
    p.background(palette.background ? palette.background : '#eee');
    p.stroke(palette.background);
    layout = generator
      .generate()
      .map(b => ({ ...b, level: 0, filled: false, content: createGrid(b) }));
  }

  function displayLayout(depth, colorize) {
    p.translate(p.width / 2, p.height / 2);
    layout.forEach(box => {
      displayBox(box, depth, colorize);
    });
  }

  function displayBox(box, maxLevel, colorize) {
    if (box.content != null && box.content.length > 0 && maxLevel > box.level) {
      box.content.forEach(c => displayBox(c, maxLevel, colorize));
    }

    if (box.filled && colorize) p.fill(box.col);
    else p.noFill();
    var cir1 = (box.y1 / 71) * Math.PI * 2;
    var cir2 = ((box.y1 + box.h) / 71) * Math.PI * 2;
    var rad1 = box.x1;
    var rad2 = box.x1 + box.w;

    var p1 = [Math.cos(cir1) * rad1, Math.sin(cir1) * rad1];
    var p2 = [Math.cos(cir1) * rad2, Math.sin(cir1) * rad2];
    var p3 = [Math.cos(cir2) * rad2, Math.sin(cir2) * rad2];
    var p4 = [Math.cos(cir2) * rad1, Math.sin(cir2) * rad1];

    p.strokeWeight(5 / (box.level + 1));
    //p.noFill();

    p.beginShape();
    p.vertex(p1[0] * xu[0] + p1[1] * yu[0], p1[0] * xu[1] + p1[1] * yu[1]);
    p.vertex(p2[0] * xu[0] + p2[1] * yu[0], p2[0] * xu[1] + p2[1] * yu[1]);
    arc(p, rad2 * mag, cir1, cir2);
    p.vertex(p3[0] * xu[0] + p3[1] * yu[0], p3[0] * xu[1] + p3[1] * yu[1]);
    p.vertex(p4[0] * xu[0] + p4[1] * yu[0], p4[0] * xu[1] + p4[1] * yu[1]);
    arc(p, rad1 * mag, cir2, cir1);
    p.endShape(p.CLOSE);

    /*
    p.line(
      p1[0] * xu[0] + p1[1] * yu[0],
      p1[0] * xu[1] + p1[1] * yu[1],
      p2[0] * xu[0] + p2[1] * yu[0],
      p2[0] * xu[1] + p2[1] * yu[1]
    );
    p.arc(0, 0, rad2 * mag * 2, rad2 * mag * 2, cir1, cir2);
    p.line(
      p3[0] * xu[0] + p3[1] * yu[0],
      p3[0] * xu[1] + p3[1] * yu[1],
      p4[0] * xu[0] + p4[1] * yu[0],
      p4[0] * xu[1] + p4[1] * yu[1]
    );

    p.arc(0, 0, rad1 * mag * 2, rad1 * mag * 2, cir1, cir2);
*/
    if (colorize && box.filled && box.h > 1.5 && box.w > 3) {
      //displayLegend(box);
    }

    if (colorize && box.filled && box.crossed) {
      //displayCross(box);
    }
  }

  function displayLegend(box) {
    p.line(
      (box.x1 + 0.5) * xu[0] + (box.y1 + 0.5) * yu[0],
      (box.x1 + 0.5) * xu[1] + (box.y1 + 0.5) * yu[1],
      (box.x1 + box.legend_width) * xu[0] + (box.y1 + 0.5) * yu[0],
      (box.x1 + box.legend_width) * xu[1] + (box.y1 + 0.5) * yu[1]
    );
  }

  function displayCross(box) {
    p.line(
      box.x1 * xu[0] + box.y1 * yu[0],
      box.x1 * xu[1] + box.y1 * yu[1],
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1]
    );
    p.line(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1],
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
    );
  }

  function createGrid(box) {
    const { x1, y1, w, h } = box;
    const cols = Math.ceil((Math.random() * w) / 2);
    const rows = Math.ceil((Math.random() * h) / 2);
    const cell_w = w / cols;
    const cell_h = h / rows;

    const apparatus = createApparatus(cell_w, cell_h);

    const grid = [];
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

        grid.push({ ...cell, content: content });
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
};

new p5(sketch);

function get_palette() {
  const url = window.location.href.split('#');
  if (url.length === 1) return tome.get('spatial01');
  return tome.get(url[1]);
}

function arc(p, rad, c1, c2) {
  let c = c1;

  let pos = c1 < c2;

  if (pos) {
    while (c < c2) {
      p.vertex(Math.cos(c) * rad, Math.sin(c) * rad);
      c += 0.02;
    }
  } else {
    while (c > c2) {
      p.vertex(Math.cos(c) * rad, Math.sin(c) * rad);
      c -= 0.02;
    }
  }
}
