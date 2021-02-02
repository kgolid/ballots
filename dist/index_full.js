(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var seedRandom = createCommonjsModule(function (module) {

  var width = 256;// each RC4 output is 0 <= x < 256
  var chunks = 6;// at least six RC4 outputs for each double
  var digits = 52;// there are 52 significant digits in a double
  var pool = [];// pool: entropy pool starts empty
  var GLOBAL = typeof commonjsGlobal === 'undefined' ? window : commonjsGlobal;

  //
  // The following constants are related to IEEE 754 limits.
  //
  var startdenom = Math.pow(width, chunks),
      significance = Math.pow(2, digits),
      overflow = significance * 2,
      mask = width - 1;


  var oldRandom = Math.random;

  //
  // seedrandom()
  // This is the seedrandom function described above.
  //
  module.exports = function(seed, options) {
    if (options && options.global === true) {
      options.global = false;
      Math.random = module.exports(seed, options);
      options.global = true;
      return Math.random;
    }
    var use_entropy = (options && options.entropy) || false;
    var key = [];

    // Flatten the seed string or build one from local entropy if needed.
    var shortseed = mixkey(flatten(
      use_entropy ? [seed, tostring(pool)] :
      0 in arguments ? seed : autoseed(), 3), key);

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Override Math.random

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.

    return function() {         // Closure to return a random double:
      var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
          d = startdenom,                 //   and denominator d = 2 ^ 48.
          x = 0;                          //   and no 'extra last byte'.
      while (n < significance) {          // Fill up all significant digits by
        n = (n + x) * width;              //   shifting numerator and
        d *= width;                       //   denominator and generating a
        x = arc4.g(1);                    //   new least-significant-byte.
      }
      while (n >= overflow) {             // To avoid rounding up, before adding
        n /= 2;                           //   last byte, shift everything
        d /= 2;                           //   right using integer Math until
        x >>>= 1;                         //   we have exactly the desired bits.
      }
      return (n + x) / d;                 // Form the number within [0, 1).
    };
  };

  module.exports.resetGlobal = function () {
    Math.random = oldRandom;
  };

  //
  // ARC4
  //
  // An ARC4 implementation.  The constructor takes a key in the form of
  // an array of at most (width) integers that should be 0 <= x < (width).
  //
  // The g(count) method returns a pseudorandom integer that concatenates
  // the next (count) outputs from ARC4.  Its return value is a number x
  // that is in the range 0 <= x < (width ^ count).
  //
  /** @constructor */
  function ARC4(key) {
    var t, keylen = key.length,
        me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

    // The empty key [] is treated as [0].
    if (!keylen) { key = [keylen++]; }

    // Set up S using the standard key scheduling algorithm.
    while (i < width) {
      s[i] = i++;
    }
    for (i = 0; i < width; i++) {
      s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
      s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function(count) {
      // Using instance members instead of closure state nearly doubles speed.
      var t, r = 0,
          i = me.i, j = me.j, s = me.S;
      while (count--) {
        t = s[i = mask & (i + 1)];
        r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
      }
      me.i = i; me.j = j;
      return r;
      // For robust unpredictability discard an initial batch of values.
      // See http://www.rsa.com/rsalabs/node.asp?id=2009
    })(width);
  }

  //
  // flatten()
  // Converts an object tree to nested arrays of strings.
  //
  function flatten(obj, depth) {
    var result = [], typ = (typeof obj)[0], prop;
    if (depth && typ == 'o') {
      for (prop in obj) {
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
    return (result.length ? result : typ == 's' ? obj : obj + '\0');
  }

  //
  // mixkey()
  // Mixes a string seed into a key that is an array of integers, and
  // returns a shortened string seed that is equivalent to the result key.
  //
  function mixkey(seed, key) {
    var stringseed = seed + '', smear, j = 0;
    while (j < stringseed.length) {
      key[mask & j] =
        mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
  }

  //
  // autoseed()
  // Returns an object for autoseeding, using window.crypto if available.
  //
  /** @param {Uint8Array=} seed */
  function autoseed(seed) {
    try {
      GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
      return tostring(seed);
    } catch (e) {
      return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
              GLOBAL.screen, tostring(pool)];
    }
  }

  //
  // tostring()
  // Converts an array of charcodes to a string
  //
  function tostring(a) {
    return String.fromCharCode.apply(0, a);
  }

  //
  // When seedrandom.js is loaded, we immediately mix a few bits
  // from the built-in RNG into the entropy pool.  Because we do
  // not want to intefere with determinstic PRNG state later,
  // seedrandom will not call Math.random on its own again after
  // initialization.
  //
  mixkey(Math.random(), pool);
  });
  var seedRandom_1 = seedRandom.resetGlobal;

  class index {
    constructor(
      width,
      height,
      {
        initiate_chance = 0.8,
        extension_chance = 0.8,
        vertical_chance = 0.8,
        horizontal_symmetry = true,
        vertical_symmetry = false,
        roundness = 0.1,
        solidness = 0.5,
        colors = [],
        color_mode = 'group',
        group_size = 0.8,
        simple = false,
        simplex = null,
        rate_of_change = 0.01,
      } = {}
    ) {
      this.xdim = Math.round(width * 2 + 11, 0);
      this.ydim = Math.round(height * 2 + 11, 0);
      this.radius_x = width;
      this.radius_y = height;
      this.chance_new = initiate_chance;
      this.chance_extend = extension_chance;
      this.chance_vertical = vertical_chance;
      this.colors = colors;
      this.color_mode = color_mode;
      this.group_size = group_size;
      this.h_symmetric = horizontal_symmetry;
      this.v_symmetric = vertical_symmetry;
      this.roundness = roundness;
      this.solidness = solidness;
      this.simple = simple;
      this.simplex = simplex;
      this.rate_of_change = rate_of_change;
      this.global_seed = Math.random();
    }

    generate(initial_top = null, initial_left = null, verbose = false, idx = 0, idy = 0) {
      this.idx = idx;
      this.idy = idy;

      this.main_color = this.get_random(this.colors, 1, 1);
      this.id_counter = 0;

      let grid = new Array(this.ydim + 1);
      for (var i = 0; i < grid.length; i++) {
        grid[i] = new Array(this.xdim + 1);
        for (var j = 0; j < grid[i].length; j++) {
          if (i == 0 || j == 0) grid[i][j] = { h: false, v: false, in: false, col: null };
          else if (i == 1 && initial_top != null) grid[i][j] = { ...initial_top[j], h: true };
          else if (j == 1 && initial_left != null) grid[i][j] = { ...initial_left[i], v: true };
          else if (this.h_symmetric && j > grid[i].length / 2) {
            grid[i][j] = deep_copy(grid[i][grid[i].length - j]);
            grid[i][j].v = grid[i][grid[i].length - j + 1].v;
          } else if (this.v_symmetric && i > grid.length / 2) {
            grid[i][j] = deep_copy(grid[grid.length - i][j]);
            grid[i][j].h = grid[grid.length - i + 1][j].h;
          } else {
            grid[i][j] = this.next_block(j, i, grid[i][j - 1], grid[i - 1][j]);
          }
        }
      }
      let rects = convert_linegrid_to_rectangles(grid);
      return verbose ? [rects, grid] : rects;
    }

    next_block(x, y, left, top) {
      const context = this;

      if (!left.in && !top.in) {
        return block_set_1(x, y);
      }

      if (left.in && !top.in) {
        if (left.h) return block_set_3(x, y);
        return block_set_2(x, y);
      }

      if (!left.in && top.in) {
        if (top.v) return block_set_5(x, y);
        return block_set_4(x, y);
      }

      if (left.in && top.in) {
        if (!left.h && !top.v) return block_set_6();
        if (left.h && !top.v) return block_set_7(x, y);
        if (!left.h && top.v) return block_set_8(x, y);
        return block_set_9(x, y);
      }

      // --- Block sets ----

      function block_set_1(x, y) {
        if (start_new_from_blank(x, y)) return new_block(x, y);
        return { v: false, h: false, in: false, col: null, id: null };
      }

      function block_set_2(x, y) {
        if (start_new_from_blank(x, y)) return new_block(x, y);
        return { v: true, h: false, in: false, col: null, id: null };
      }

      function block_set_3(x, y) {
        if (extend(x, y)) return { v: false, h: true, in: true, col: left.col, id: left.id };
        return block_set_2(x, y);
      }

      function block_set_4(x, y) {
        if (start_new_from_blank(x, y)) return new_block(x, y);
        return { v: false, h: true, in: false, col: null, id: null };
      }

      function block_set_5(x, y) {
        if (extend(x, y)) return { v: true, h: false, in: true, col: top.col, id: top.id };
        return block_set_4(x, y);
      }

      function block_set_6() {
        return { v: false, h: false, in: true, col: left.col, id: left.id };
      }

      function block_set_7(x, y) {
        if (extend(x, y)) return { v: false, h: true, in: true, col: left.col, id: left.id };
        if (start_new(x, y)) return new_block(x, y);
        return { v: true, h: true, in: false, col: null, id: null };
      }

      function block_set_8(x, y) {
        if (extend(x, y)) return { v: true, h: false, in: true, col: top.col, id: top.id };
        if (start_new(x, y)) return new_block(x, y);
        return { v: true, h: true, in: false, col: null, id: null };
      }

      function block_set_9(x, y) {
        if (vertical_dir(x, y)) return { v: true, h: false, in: true, col: top.col, id: top.id };
        return { v: false, h: true, in: true, col: left.col, id: left.id };
      }

      // ---- Blocks ----

      function new_block(nx, ny) {
        let col;
        if (context.color_mode === 'random') {
          col = context.get_random(context.colors, nx, ny);
        } else if (context.color_mode === 'main') {
          col = context.noise(x, y, '_main') > 0.75 ? context.get_random(context.colors, x, y) : context.main_color;
        } else if (context.color_mode === 'group') {
          let keep = context.noise(x, y, '_keep') > 0.5 ? left.col : top.col;
          context.main_color =
            context.noise(x, y, '_group') > context.group_size
              ? context.get_random(context.colors, x, y)
              : keep || context.main_color;
          col = context.main_color;
        } else {
          col = context.main_color;
        }

        return { v: true, h: true, in: true, col: col, id: context.id_counter++ };
      }

      // ---- Decisions ----

      function start_new_from_blank(x, y) {
        if (context.simple) return true;
        if (!active_position(x, y, -1 * (1 - context.roundness))) return false;
        return context.noise(x, y, '_blank') <= context.solidness;
      }

      function start_new(x, y) {
        if (context.simple) return true;
        if (!active_position(x, y, 0)) return false;
        return context.noise(x, y, '_new') <= context.chance_new;
      }

      function extend(x, y) {
        if (!active_position(x, y, 1 - context.roundness) && !context.simple) return false;
        return context.noise(x, y, '_extend') <= context.chance_extend;
      }

      function vertical_dir(x, y) {
        return context.noise(x, y, '_vert') <= context.chance_vertical;
      }

      function active_position(x, y, fuzzy) {
        let fuzziness = 1 + context.noise(x, y, '_active') * fuzzy;
        let xa = Math.pow(x - context.xdim / 2, 2) / Math.pow(context.radius_x * fuzziness, 2);
        let ya = Math.pow(y - context.ydim / 2, 2) / Math.pow(context.radius_y * fuzziness, 2);
        return xa + ya < 1;
      }
    }

    noise(nx, ny, nz = '') {
      if (!this.simplex) return Math.random();
      const rng = seedRandom('' + this.global_seed + nx + ny + nz);
      const n = this.simplex.noise3D(this.idx * this.rate_of_change, this.idy * this.rate_of_change, rng() * 23.4567);
      return (n + 1) / 2;
    }

    get_random(array, nx, ny) {
      return array[Math.floor(this.noise(nx, ny, '_array') * array.length)];
    }
  }

  function deep_copy(obj) {
    let nobj = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        nobj[key] = obj[key];
      }
    }
    return nobj;
  }

  // --- Conversion ---
  function convert_linegrid_to_rectangles(grid) {
    let nw_corners = get_nw_corners(grid);
    extend_corners_to_rectangles(nw_corners, grid);
    return nw_corners;
  }

  function get_nw_corners(grid) {
    let nw_corners = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let cell = grid[i][j];
        if (cell.h && cell.v && cell.in) nw_corners.push({ x1: j, y1: i, col: cell.col, id: cell.id });
      }
    }
    return nw_corners;
  }

  function extend_corners_to_rectangles(corners, grid) {
    corners.map(c => {
      let accx = 1;
      while (c.x1 + accx < grid[c.y1].length && !grid[c.y1][c.x1 + accx].v) {
        accx++;
      }
      let accy = 1;
      while (c.y1 + accy < grid.length && !grid[c.y1 + accy][c.x1].h) {
        accy++;
      }
      c.w = accx;
      c.h = accy;
      return c;
    });
  }

  var misc = [
    {
      name: 'frozen-rose',
      colors: ['#29368f', '#e9697b', '#1b164d', '#f7d996'],
      background: '#f2e8e4',
    },
    {
      name: 'winter-night',
      colors: ['#122438', '#dd672e', '#87c7ca', '#ebebeb'],
      background: '#ebebeb',
    },
    {
      name: 'saami',
      colors: ['#eab700', '#e64818', '#2c6393', '#eecfca'],
      background: '#e7e6e4',
    },
    {
      name: 'knotberry1',
      colors: ['#20342a', '#f74713', '#686d2c', '#e9b4a6'],
      background: '#e5ded8',
    },
    {
      name: 'knotberry2',
      colors: ['#1d3b1a', '#eb4b11', '#e5bc00', '#f29881'],
      background: '#eae2d0',
    },
    {
      name: 'tricolor',
      colors: ['#ec643b', '#56b7ab', '#f8cb57', '#1f1e43'],
      background: '#f7f2df',
    },
    {
      name: 'foxshelter',
      colors: ['#ff3931', '#007861', '#311f27', '#bab9a4'],
      background: '#dddddd',
    },
    {
      name: 'hermes',
      colors: ['#253852', '#51222f', '#b53435', '#ecbb51'],
      background: '#eeccc2',
    },
    {
      name: 'olympia',
      colors: ['#ff3250', '#ffb33a', '#008c36', '#0085c6', '#4c4c4c'],
      stroke: '#0b0b0b',
      background: '#faf2e5',
    },
    {
      name: 'byrnes',
      colors: ['#c54514', '#dca215', '#23507f'],
      stroke: '#0b0b0b',
      background: '#e8e7d4',
    },
    {
      name: 'butterfly',
      colors: ['#f40104', '#f6c0b3', '#99673a', '#f0f1f4'],
      stroke: '#191e36',
      background: '#191e36',
    },
    {
      name: 'floratopia',
      colors: ['#bf4a2b', '#cd902a', '#4e4973', '#f5d4bc'],
      stroke: '#1e1a43',
      background: '#1e1a43',
    },
    {
      name: 'verena',
      colors: ['#f1594a', '#f5b50e', '#14a160', '#2969de', '#885fa4'],
      stroke: '#1a1a1a',
      background: '#e2e6e8',
    },
    {
      name: 'florida_citrus',
      colors: ['#ea7251', '#ebf7f0', '#02aca5'],
      stroke: '#050100',
      background: '#9ae2d3',
    },
    {
      name: 'lemon_citrus',
      colors: ['#e2d574', '#f1f4f7', '#69c5ab'],
      stroke: '#463231',
      background: '#f79eac',
    },
    {
      name: 'yuma_punk',
      colors: ['#f05e3b', '#ebdec4', '#ffdb00'],
      stroke: '#ebdec4',
      background: '#161616',
    },
    {
      name: 'yuma_punk2',
      colors: ['#f2d002', '#f7f5e1', '#ec643b'],
      stroke: '#19080e',
      background: '#f7f5e1',
    },
    {
      name: 'moir',
      colors: ['#a49f4f', '#d4501e', '#f7c558', '#ebbaa6'],
      stroke: '#161716',
      background: '#f7f4ef',
    },
    {
      name: 'sprague',
      colors: ['#ec2f28', '#f8cd28', '#1e95bb', '#fbaab3', '#fcefdf'],
      stroke: '#221e1f',
      background: '#fcefdf',
    },
    {
      name: 'bloomberg',
      colors: ['#ff5500', '#f4c145', '#144714', '#2f04fc', '#e276af'],
      stroke: '#000',
      background: '#fff3dd',
    },
    {
      name: 'revolucion',
      colors: ['#ed555d', '#fffcc9', '#41b797', '#eda126', '#7b5770'],
      stroke: '#fffcc9',
      background: '#2d1922',
    },
    {
      name: 'sneaker',
      colors: ['#e8165b', '#401e38', '#66c3b4', '#ee7724', '#584098'],
      stroke: '#401e38',
      background: '#ffffff',
    },
    {
      name: 'miradors',
      colors: ['#ff6936', '#fddc3f', '#0075ca', '#00bb70'],
      stroke: '#ffffff',
      background: '#020202',
    },
    {
      name: 'kaffeprat',
      colors: ['#BCAA8C', '#D8CDBE', '#484A42', '#746B58', '#9A8C73'],
      stroke: '#000',
      background: '#fff',
    },
    {
      name: 'jrmy',
      colors: ['#df456c', '#ea6a82', '#270b32', '#471e43'],
      stroke: '#270b32',
      background: '#ef9198',
    },
    {
      name: 'animo',
      colors: ['#f6c103', '#f6f6f6', '#d1cdc7', '#e7e6e5'],
      stroke: '#010001',
      background: '#f5f5f5',
    },
    {
      name: 'book',
      colors: ['#be1c24', '#d1a082', '#037b68', '#d8b1a5', '#1c2738', '#c95a3f'],
      stroke: '#0e0f27',
      background: '#f5b28a',
    },
    {
      name: 'juxtapoz',
      colors: ['#20357e', '#f44242', '#ffffff'],
      stroke: '#000000',
      background: '#cfc398',
    },
    {
      name: 'hurdles',
      colors: ['#e16503', '#dc9a0f', '#dfe2b4', '#66a7a6'],
      stroke: '#3c1c03',
      background: '#3c1c03',
    },
    {
      name: 'ludo',
      colors: ['#df302f', '#e5a320', '#0466b3', '#0f7963'],
      stroke: '#272621',
      background: '#dedccd',
    },
    {
      name: 'riff',
      colors: ['#e24724', '#c7c7c7', '#1f3e7c', '#d29294', '#010203'],
      stroke: '#010203',
      background: '#f2f2f2',
    },
    {
      name: 'san ramon',
      colors: ['#4f423a', '#f6a74b', '#589286', '#f8e9e2', '#2c2825'],
      stroke: '#2c2825',
      background: '#fff',
    },
    {
      name: 'one-dress',
      colors: ['#1767D2', '#FFFFFF', '#F9AB00', '#212121'],
      stroke: '#212121',
      background: '#fff',
    },
  ];

  var colourscafe = [
    {
      name: 'cc239',
      colors: ['#e3dd34', '#78496b', '#f0527f', '#a7e0e2'],
      background: '#e0eff0'
    },
    {
      name: 'cc234',
      colors: ['#ffce49', '#ede8dc', '#ff5736', '#ff99b4'],
      background: '#f7f4ed'
    },
    {
      name: 'cc232',
      colors: ['#5c5f46', '#ff7044', '#ffce39', '#66aeaa'],
      background: '#e9ecde'
    },
    {
      name: 'cc238',
      colors: ['#553c60', '#ffb0a0', '#ff6749', '#fbe090'],
      background: '#f5e9de'
    },
    {
      name: 'cc242',
      colors: ['#bbd444', '#fcd744', '#fa7b53', '#423c6f'],
      background: '#faf4e4'
    },
    {
      name: 'cc245',
      colors: ['#0d4a4e', '#ff947b', '#ead3a2', '#5284ab'],
      background: '#f6f4ed'
    },
    {
      name: 'cc273',
      colors: ['#363d4a', '#7b8a56', '#ff9369', '#f4c172'],
      background: '#f0efe2'
    }
  ];

  var ranganath = [
    {
      name: 'rag-mysore',
      colors: ['#ec6c26', '#613a53', '#e8ac52', '#639aa0'],
      background: '#d5cda1'
    },
    {
      name: 'rag-gol',
      colors: ['#d3693e', '#803528', '#f1b156', '#90a798'],
      background: '#f0e0a4'
    },
    {
      name: 'rag-belur',
      colors: ['#f46e26', '#68485f', '#3d273a', '#535d55'],
      background: '#dcd4a6'
    },
    {
      name: 'rag-bangalore',
      colors: ['#ea720e', '#ca5130', '#e9c25a', '#52534f'],
      background: '#f9ecd3'
    },
    {
      name: 'rag-taj',
      colors: ['#ce565e', '#8e1752', '#f8a100', '#3ac1a6'],
      background: '#efdea2'
    },
    {
      name: 'rag-virupaksha',
      colors: ['#f5736a', '#925951', '#feba4c', '#9d9b9d'],
      background: '#eedfa2'
    }
  ];

  var roygbivs = [
    {
      name: 'retro',
      colors: [
        '#69766f',
        '#9ed6cb',
        '#f7e5cc',
        '#9d8f7f',
        '#936454',
        '#bf5c32',
        '#efad57'
      ]
    },
    {
      name: 'retro-washedout',
      colors: [
        '#878a87',
        '#cbdbc8',
        '#e8e0d4',
        '#b29e91',
        '#9f736c',
        '#b76254',
        '#dfa372'
      ]
    },
    {
      name: 'roygbiv-warm',
      colors: [
        '#705f84',
        '#687d99',
        '#6c843e',
        '#fc9a1a',
        '#dc383a',
        '#aa3a33',
        '#9c4257'
      ]
    },
    {
      name: 'roygbiv-toned',
      colors: [
        '#817c77',
        '#396c68',
        '#89e3b7',
        '#f59647',
        '#d63644',
        '#893f49',
        '#4d3240'
      ]
    },
    {
      name: 'present-correct',
      colors: [
        '#fd3741',
        '#fe4f11',
        '#ff6800',
        '#ffa61a',
        '#ffc219',
        '#ffd114',
        '#fcd82e',
        '#f4d730',
        '#ced562',
        '#8ac38f',
        '#79b7a0',
        '#72b5b1',
        '#5b9bae',
        '#6ba1b7',
        '#49619d',
        '#604791',
        '#721e7f',
        '#9b2b77',
        '#ab2562',
        '#ca2847'
      ]
    }
  ];

  var tundra = [
    {
      name: 'tundra1',
      colors: ['#40708c', '#8e998c', '#5d3f37', '#ed6954', '#f2e9e2']
    },
    {
      name: 'tundra2',
      colors: ['#5f9e93', '#3d3638', '#733632', '#b66239', '#b0a1a4', '#e3dad2']
    },
    {
      name: 'tundra3',
      colors: [
        '#87c3ca',
        '#7b7377',
        '#b2475d',
        '#7d3e3e',
        '#eb7f64',
        '#d9c67a',
        '#f3f2f2'
      ]
    },
    {
      name: 'tundra4',
      colors: [
        '#d53939',
        '#b6754d',
        '#a88d5f',
        '#524643',
        '#3c5a53',
        '#7d8c7c',
        '#dad6cd'
      ]
    }
  ];

  var rohlfs = [
    {
      name: 'rohlfs_1R',
      colors: ['#004996', '#567bae', '#ff4c48', '#ffbcb3'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_1Y',
      colors: ['#004996', '#567bae', '#ffc000', '#ffdca4'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_1G',
      colors: ['#004996', '#567bae', '#60bf3c', '#d2deb1'],
      stroke: '#004996',
      background: '#fff8e7'
    },
    {
      name: 'rohlfs_2',
      colors: ['#4d3d9a', '#f76975', '#ffffff', '#eff0dd'],
      stroke: '#211029',
      background: '#58bdbc'
    },
    {
      name: 'rohlfs_3',
      colors: ['#abdfdf', '#fde500', '#58bdbc', '#eff0dd'],
      stroke: '#211029',
      background: '#f76975'
    },
    {
      name: 'rohlfs_4',
      colors: ['#fde500', '#2f2043', '#f76975', '#eff0dd'],
      stroke: '#211029',
      background: '#fbbeca'
    }
  ];

  var ducci = [
    {
      name: 'ducci_jb',
      colors: ['#395e54', '#e77b4d', '#050006', '#e55486'],
      stroke: '#050006',
      background: '#efe0bc'
    },
    {
      name: 'ducci_a',
      colors: ['#809498', '#d3990e', '#000000', '#ecddc5'],
      stroke: '#ecddc5',
      background: '#863f52'
    },
    {
      name: 'ducci_b',
      colors: ['#ecddc5', '#79b27b', '#000000', '#ac6548'],
      stroke: '#ac6548',
      background: '#d5c08e'
    },
    {
      name: 'ducci_d',
      colors: ['#f3cb4d', '#f2f5e3', '#20191b', '#67875c'],
      stroke: '#67875c',
      background: '#433d5f'
    },
    {
      name: 'ducci_e',
      colors: ['#c37c2b', '#f6ecce', '#000000', '#386a7a'],
      stroke: '#386a7a',
      background: '#e3cd98'
    },
    {
      name: 'ducci_f',
      colors: ['#596f7e', '#eae6c7', '#463c21', '#f4cb4c'],
      stroke: '#f4cb4c',
      background: '#e67300'
    },
    {
      name: 'ducci_g',
      colors: ['#c75669', '#000000', '#11706a'],
      stroke: '#11706a',
      background: '#ecddc5'
    },
    {
      name: 'ducci_h',
      colors: ['#6b5c6e', '#4a2839', '#d9574a'],
      stroke: '#d9574a',
      background: '#ffc34b'
    },
    {
      name: 'ducci_i',
      colors: ['#e9dcad', '#143331', '#ffc000'],
      stroke: '#ffc000',
      background: '#a74c02'
    },
    {
      name: 'ducci_j',
      colors: ['#c47c2b', '#5f5726', '#000000', '#7e8a84'],
      stroke: '#7e8a84',
      background: '#ecddc5'
    },
    {
      name: 'ducci_o',
      colors: ['#c15e1f', '#e4a13a', '#000000', '#4d545a'],
      stroke: '#4d545a',
      background: '#dfc79b'
    },
    {
      name: 'ducci_q',
      colors: ['#4bae8c', '#d0c1a0', '#2d3538'],
      stroke: '#2d3538',
      background: '#d06440'
    },
    {
      name: 'ducci_u',
      colors: ['#f6d700', '#f2d692', '#000000', '#5d3552'],
      stroke: '#5d3552',
      background: '#ff7426'
    },
    {
      name: 'ducci_v',
      colors: ['#c65f75', '#d3990e', '#000000', '#597e7a'],
      stroke: '#597e7a',
      background: '#f6eccb'
    },
    {
      name: 'ducci_x',
      colors: ['#dd614a', '#f5cedb', '#1a1e4f'],
      stroke: '#1a1e4f',
      background: '#fbb900'
    }
  ];

  var judson = [
    {
      name: 'jud_playground',
      colors: ['#f04924', '#fcce09', '#408ac9'],
      stroke: '#2e2925',
      background: '#ffffff'
    },
    {
      name: 'jud_horizon',
      colors: ['#f8c3df', '#f2e420', '#28b3d0', '#648731', '#ef6a7d'],
      stroke: '#030305',
      background: '#f2f0e1'
    },
    {
      name: 'jud_mural',
      colors: ['#ca3122', '#e5af16', '#4a93a2', '#0e7e39', '#e2b9bd'],
      stroke: '#1c1616',
      background: '#e3ded8'
    },
    {
      name: 'jud_cabinet',
      colors: ['#f0afb7', '#f6bc12', '#1477bb', '#41bb9b'],
      stroke: '#020508',
      background: '#e3ded8'
    }
  ];

  var iivonen = [
    {
      name: 'iiso_zeitung',
      colors: ['#ee8067', '#f3df76', '#00a9c0', '#f7ab76'],
      stroke: '#111a17',
      background: '#f5efcb'
    },
    {
      name: 'iiso_curcuit',
      colors: ['#f0865c', '#f2b07b', '#6bc4d2', '#1a3643'],
      stroke: '#0f1417',
      background: '#f0f0e8'
    },
    {
      name: 'iiso_airlines',
      colors: ['#fe765a', '#ffb468', '#4b588f', '#faf1e0'],
      stroke: '#1c1616',
      background: '#fae5c8'
    },
    {
      name: 'iiso_daily',
      colors: ['#e76c4a', '#f0d967', '#7f8cb6', '#1daeb1', '#ef9640'],
      stroke: '#000100',
      background: '#e2ded2'
    }
  ];

  var kovecses = [
    {
      name: 'kov_01',
      colors: ['#d24c23', '#7ba6bc', '#f0c667', '#ede2b3', '#672b35'],
      stroke: '#132a37',
      background: '#108266'
    },
    {
      name: 'kov_02',
      colors: ['#e94641', '#eeaeae'],
      stroke: '#e8dccc',
      background: '#6c96be'
    },
    {
      name: 'kov_03',
      colors: ['#e3937b', '#d93f1d', '#e6cca7'],
      stroke: '#090d15',
      background: '#558947'
    },
    {
      name: 'kov_04',
      colors: ['#d03718', '#33762f', '#ead7c9', '#ce7028', '#689d8d'],
      stroke: '#292b36',
      background: '#deb330'
    },
    {
      name: 'kov_05',
      colors: ['#de3f1a', '#de9232', '#007158', '#e6cdaf', '#869679'],
      stroke: '#010006',
      background: '#7aa5a6'
    },
    {
      name: 'kov_06',
      colors: [
        '#a87c2a',
        '#bdc9b1',
        '#f14616',
        '#ecbfaf',
        '#017724',
        '#0e2733',
        '#2b9ae9'
      ],
      stroke: '#292319',
      background: '#dfd4c1'
    },
    {
      name: 'kov_06b',
      colors: [
        '#d57846',
        '#dfe0cc',
        '#de442f',
        '#e7d3c5',
        '#5ec227',
        '#302f35',
        '#63bdb3'
      ],
      stroke: '#292319',
      background: '#dfd4c1'
    },
    {
      name: 'kov_07',
      colors: ['#c91619', '#fdecd2', '#f4a000', '#4c2653'],
      stroke: '#111',
      background: '#89c2cd'
    }
  ];

  var tsuchimochi = [
    {
      name: 'tsu_arcade',
      colors: ['#4aad8b', '#e15147', '#f3b551', '#cec8b8', '#d1af84', '#544e47'],
      stroke: '#251c12',
      background: '#cfc7b9'
    },
    {
      name: 'tsu_harutan',
      colors: ['#75974a', '#c83e3c', '#f39140', '#e4ded2', '#f8c5a4', '#434f55'],
      stroke: '#251c12',
      background: '#cfc7b9'
    },
    {
      name: 'tsu_akasaka',
      colors: ['#687f72', '#cc7d6c', '#dec36f', '#dec7af', '#ad8470', '#424637'],
      stroke: '#251c12',
      background: '#cfc7b9'
    }
  ];

  var duotone = [
    {
      name: 'dt01',
      colors: ['#f7f7f3'],
      stroke: '#172a89',
      background: '#f3abb0',
    },
    {
      name: 'dt02',
      colors: ['#f3c507'],
      stroke: '#302956',
      background: '#eee3d3',
    },
    {
      name: 'dt03',
      colors: ['#a7a7a7'],
      stroke: '#000000',
      background: '#0a5e78',
    },
    {
      name: 'dt04',
      colors: ['#50978e', '#f7f0df'],
      stroke: '#000000',
      background: '#f7f0df',
    },
    {
      name: 'dt05',
      colors: ['#ee5d65', '#f0e5cb'],
      stroke: '#080708',
      background: '#f0e5cb',
    },
    {
      name: 'dt06',
      colors: ['#e7ceb5'],
      stroke: '#271f47',
      background: '#cc2b1c',
    },
    {
      name: 'dt07',
      colors: ['#6a98a5', '#d24c18'],
      stroke: '#efebda',
      background: '#efebda',
    },
    {
      name: 'dt08',
      colors: ['#5d9d88', '#ebb43b'],
      stroke: '#efebda',
      background: '#efebda',
    },
    {
      name: 'dt09',
      colors: ['#052e57', '#de8d80'],
      stroke: '#efebda',
      background: '#efebda',
    },
    {
      name: 'dt10',
      colors: ['#e5dfcf', '#e9b500'],
      stroke: '#151513',
      background: '#e9b500',
    },
  ];

  var hilda = [
    {
      name: 'hilda01',
      colors: ['#ec5526', '#f4ac12', '#9ebbc1', '#f7f4e2'],
      stroke: '#1e1b1e',
      background: '#e7e8d4'
    },
    {
      name: 'hilda02',
      colors: ['#eb5627', '#eebb20', '#4e9eb8', '#f7f5d0'],
      stroke: '#201d13',
      background: '#77c1c0'
    },
    {
      name: 'hilda03',
      colors: ['#e95145', '#f8b917', '#b8bdc1', '#ffb2a2'],
      stroke: '#010101',
      background: '#6b7752'
    },
    {
      name: 'hilda04',
      colors: ['#e95145', '#f6bf7a', '#589da1', '#f5d9bc'],
      stroke: '#000001',
      background: '#f5ede1'
    },
    {
      name: 'hilda05',
      colors: ['#ff6555', '#ffb58f', '#d8eecf', '#8c4b47', '#bf7f93'],
      stroke: '#2b0404',
      background: '#ffda82'
    },
    {
      name: 'hilda06',
      colors: ['#f75952', '#ffce84', '#74b7b2', '#f6f6f6', '#b17d71'],
      stroke: '#0e0603',
      background: '#f6ecd4'
    }
  ];

  var spatial = [
    {
      name: 'spatial01',
      colors: ['#f6f6f4', '#4169ff'],
      stroke: '#ff5937',
      background: '#f6f6f4'
    },
    {
      name: 'spatial02',
      colors: ['#f6f6f4'],
      stroke: '#ff5937',
      background: '#f6f6f4'
    },
    {
      name: 'spatial02i',
      colors: ['#ff5937'],
      stroke: '#f6f6f4',
      background: '#ff5937'
    },

    {
      name: 'spatial03',
      colors: ['#f6f6f4'],
      stroke: '#4169ff',
      background: '#f6f6f4'
    },
    {
      name: 'spatial03i',
      colors: ['#4169ff'],
      stroke: '#f6f6f4',
      background: '#4169ff'
    }
  ];

  var jung = [
    {
      name: 'jung_bird',
      colors: ['#fc3032', '#fed530', '#33c3fb', '#ff7bac', '#fda929'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_horse',
      colors: ['#e72e81', '#f0bf36', '#3056a2'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_croc',
      colors: ['#f13274', '#eed03e', '#405e7f', '#19a198'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_hippo',
      colors: ['#ff7bac', '#ff921e', '#3ea8f5', '#7ac943'],
      stroke: '#000000',
      background: '#ffffff'
    },
    {
      name: 'jung_wolf',
      colors: ['#e51c39', '#f1b844', '#36c4b7', '#666666'],
      stroke: '#000000',
      background: '#ffffff'
    }
  ];

  var system = [
    {
      name: 'system.#01',
      colors: ['#ff4242', '#fec101', '#1841fe', '#fcbdcc', '#82e9b5'],
      stroke: '#000',
      background: '#fff'
    },
    {
      name: 'system.#02',
      colors: ['#ff4242', '#ffd480', '#1e365d', '#edb14c', '#418dcd'],
      stroke: '#000',
      background: '#fff'
    },
    {
      name: 'system.#03',
      colors: ['#f73f4a', '#d3e5eb', '#002c3e', '#1aa1b1', '#ec6675'],
      stroke: '#110b09',
      background: '#fff'
    },
    {
      name: 'system.#04',
      colors: ['#e31f4f', '#f0ac3f', '#18acab', '#ea7d81', '#dcd9d0'],
      stroke: '#26265a',
      backgrund: '#dcd9d0'
    },
    {
      name: 'system.#05',
      colors: ['#db4549', '#d1e1e1', '#3e6a90', '#2e3853', '#a3c9d3'],
      stroke: '#000',
      background: '#fff'
    },
    {
      name: 'system.#06',
      colors: ['#e5475c', '#95b394', '#28343b', '#f7c6a3', '#eb8078'],
      stroke: '#000',
      background: '#fff'
    },
    {
      name: 'system.#07',
      colors: ['#d75c49', '#f0efea', '#509da4'],
      stroke: '#000',
      background: '#fff'
    },
    {
      name: 'system.#08',
      colors: ['#f6625a', '#92b29f', '#272c3f'],
      stroke: '#000',
      background: '#fff'
    }
  ];

  var flourish = [
    {
      name: 'empusa',
      colors: ['#c92a28', '#e69301', '#1f8793', '#13652b', '#e7d8b0', '#48233b', '#e3b3ac'],
      stroke: '#1a1a1a',
      background: '#f0f0f2',
    },
    {
      name: 'delphi',
      colors: ['#475b62', '#7a999c', '#fbaf3c', '#df4a33', '#f0e0c6', '#af592c'],
      stroke: '#2a1f1d',
      background: '#f0e0c6',
    },
    {
      name: 'mably',
      colors: [
        '#13477b',
        '#2f1b10',
        '#d18529',
        '#d72a25',
        '#e42184',
        '#138898',
        '#9d2787',
        '#7f311b',
      ],
      stroke: '#2a1f1d',
      background: '#dfc792',
    },
    {
      name: 'nowak',
      colors: ['#e85b30', '#ef9e28', '#c6ac71', '#e0c191', '#3f6279', '#ee854e'],
      stroke: '#180305',
      background: '#ede4cb',
    },
    {
      name: 'jupiter',
      colors: ['#c03a53', '#edd09e', '#aab5af', '#023629', '#eba735', '#8e9380', '#6c4127'],
      stroke: '#12110f',
      background: '#e6e2d6',
    },
    {
      name: 'hersche',
      colors: [
        '#df9f00',
        '#1f6f50',
        '#8e6d7f',
        '#da0607',
        '#a4a5a7',
        '#d3d1c3',
        '#42064f',
        '#25393a',
      ],
      stroke: '#0a0a0a',
      background: '#f0f5f6',
    },
    {
      name: 'cherfi',
      colors: ['#99cb9f', '#cfb610', '#d00701', '#dba78d', '#2e2c1d', '#bfbea2', '#d2cfaf'],
      stroke: '#332e22',
      background: '#e3e2c5',
    },
    {
      name: 'harvest',
      colors: [
        '#313a42',
        '#9aad2e',
        '#f0ae3c',
        '#df4822',
        '#8eac9b',
        '#cc3d3f',
        '#ec8b1c',
        '#1b9268',
      ],
      stroke: '#463930',
      background: '#e5e2cf',
    },
    {
      name: 'honey',
      colors: ['#f14d42', '#f4fdec', '#4fbe5d', '#265487', '#f6e916', '#f9a087', '#2e99d6'],
      stroke: '#141414',
      background: '#f4fdec',
    },
    {
      name: 'jungle',
      colors: [
        '#adb100',
        '#e5f4e9',
        '#f4650f',
        '#4d6838',
        '#cb9e00',
        '#689c7d',
        '#e2a1a8',
        '#151c2e',
      ],
      stroke: '#0e0f27',
      background: '#cecaa9',
    },
    {
      name: 'skyspider',
      colors: ['#f4b232', '#f2dbbd', '#01799c', '#e93e48', '#0b1952', '#006748', '#ed817d'],
      stroke: '#050505',
      background: '#f0dbbc',
    },
    {
      name: 'atlas',
      colors: ['#5399b1', '#f4e9d5', '#de4037', '#ed942f', '#4e9e48', '#7a6e62'],
      stroke: '#2d251e',
      background: '#f0c328',
    },
    {
      name: 'giftcard',
      colors: [
        '#FBF5E9',
        '#FF514E',
        '#FDBC2E',
        '#4561CC',
        '#2A303E',
        '#6CC283',
        '#A71172',
        '#238DA5',
        '#9BD7CB',
        '#231E58',
        '#4E0942',
      ],
      stroke: '#000',
      background: '#FBF5E9',
    },
    {
      name: 'giftcard_sub',
      colors: [
        '#FBF5E9',
        '#FF514E',
        '#FDBC2E',
        '#4561CC',
        '#6CC283',
        '#238DA5',
        '#9BD7CB',
      ],
      stroke: '#2A303E',
      background: '#FBF5E9',
    },
  ];

  var dale = [
    {
      name: 'dale_paddle',
      colors: [
        '#ff7a5a',
        '#765aa6',
        '#fee7bc',
        '#515e8c',
        '#ffc64a',
        '#b460a6',
        '#ffffff',
        '#4781c1',
      ],
      stroke: '#000000',
      background: '#abe9e8',
    },
    {
      name: 'dale_night',
      colors: ['#ae5d9d', '#f1e8bc', '#ef8fa3', '#f7c047', '#58c9ed', '#f77150'],
      stroke: '#000000',
      background: '#00ae83',
    },
    {
      name: 'dale_cat',
      colors: ['#f77656', '#f7f7f7', '#efc545', '#dfe0e2', '#3c70bd', '#66bee4'],
      stroke: '#000000',
      background: '#f6e0b8',
    },
  ];

  var cako = [
    {
      name: 'cako1',
      colors: ['#d55a3a', '#2a5c8a', '#7e7d14', '#dbdac9'],
      stroke: '#000000',
      background: '#f4e9d5',
    },
    {
      name: 'cako2',
      colors: ['#dbdac9', '#d55a3a', '#2a5c8a', '#b47b8c', '#7e7d14'],
      stroke: '#000000',
      background: '#000000',
    },
    {
      name: 'cako2_sub1',
      colors: ['#dbdac9', '#d55a3a', '#2a5c8a'],
      stroke: '#000000',
      background: '#000000',
    },
    {
      name: 'cako2_sub2',
      colors: ['#dbdac9', '#d55a3a', '#7e7d14'],
      stroke: '#000000',
      background: '#000000',
    },
    {
      name: 'latino',
      colors: ['#E75843','#ECEAEA'],
      stroke: '#33181D',
      background: '#ECEAEA'
    }
  ];

  var mayo = [
    {
      name: 'mayo1',
      colors: ['#ea510e', '#ffd203', '#0255a3', '#039177'],
      stroke: '#111111',
      background: '#fff',
    },
    {
      name: 'mayo2',
      colors: ['#ea663f', '#f9cc27', '#84afd7', '#7ca994', '#f1bbc9'],
      stroke: '#2a2a2a',
      background: '#f5f6f1',
    },
    {
      name: 'mayo3',
      colors: ['#ea5b19', '#f8c9b9', '#137661'],
      stroke: '#2a2a2a',
      background: '#f5f4f0',
    },
  ];

  var exposito = [
    {
      name: 'exposito',
      colors: [
        '#8bc9c3',
        '#ffae43',
        '#ea432c',
        '#228345',
        '#d1d7d3',
        '#524e9c',
        '#9dc35e',
        '#f0a1a1',
      ],
      stroke: '#fff',
      background: '#000000',
    },
    {
      name: 'exposito_sub1',
      colors: ['#8bc9c3', '#ffae43', '#ea432c', '#524e9c'],
      stroke: '#fff',
      background: '#000000',
    },
    {
      name: 'exposito_sub2',
      colors: ['#8bc9c3', '#ffae43', '#ea432c', '#524e9c', '#f0a1a1', '#228345'],
      stroke: '#fff',
      background: '#000000',
    },
    {
      name: 'exposito_sub3',
      colors: ['#ffae43', '#ea432c', '#524e9c', '#f0a1a1'],
      stroke: '#fff',
      background: '#000000',
    },
    {
      name: 'herge',
      colors: ['#305B49', '#F3811F', '#FFFCD8', '#DDCE86', '#038DD5'], 
    }
  ];

  const pals = misc.concat(
    ranganath,
    roygbivs,
    tundra,
    colourscafe,
    rohlfs,
    ducci,
    judson,
    iivonen,
    kovecses,
    tsuchimochi,
    duotone,
    hilda,
    spatial,
    jung,
    system,
    flourish,
    dale,
    cako,
    mayo,
    exposito
  );

  var palettes = pals.map((p) => {
    p.size = p.colors.length;
    return p;
  });

  function getRandom() {
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  function get(name) {
    if (name === undefined) return getRandom();
    return palettes.find(pal => pal.name == name);
  }

  let sketch = function (p) {
    let THE_SEED;

    const mag = 22;
    const xu = [1 * mag, -0.2 * mag]; // X Unit
    const yu = [0.3 * mag, 0.8 * mag]; // Y Unit

    const palette = get_palette();
    const generator = new index(40, 36, {
      simple: true,
      extension_chance: 0.97,
      horizontal_symmetry: false,
      vertical_chance: 0.3,
    });

    const innerApparatusOptions = {
      simple: true,
      extension_chance: 0.8,
      horizontal_symmetry: false,
      vertical_chance: 0.3,
      color_mode: 'main',
      colors: palette.colors,
    };

    let layout;
    let tick;

    p.setup = function () {
      p.createCanvas(950, 950);
      THE_SEED = p.floor(p.random(9999999));
      p.randomSeed(THE_SEED);
      p.noFill();
      p.smooth();
      p.frameRate(3);
      p.stroke(palette.stroke ? palette.stroke : '#111');
      p.background(palette.background ? palette.background : '#eee');

      tick = 0;
    };

    p.draw = function () {
      if (tick % 9 == 0) reset();
      displayLayout(tick % 9, tick % 9 > 2);
      tick++;
    };

    p.keyPressed = function () {
      if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
    };

    function reset() {
      p.background(palette.background ? palette.background : '#eee');
      layout = generator
        .generate()
        .map((b) => ({ ...b, level: 0, filled: false, content: createGrid(b) }));
    }

    function displayLayout(depth, colorize) {
      p.translate(-500, -80);
      layout.forEach((box) => {
        displayBox(box, depth, colorize);
      });
    }

    function displayBox(box, maxLevel, colorize) {
      if (box.content != null && box.content.length > 0 && maxLevel > box.level) {
        box.content.forEach((c) => displayBox(c, maxLevel, colorize));
      }

      if (box.filled && colorize) p.fill(box.col);
      else p.noFill();

      p.strokeWeight(3 / (box.level + 1));
      p.beginShape();
      p.vertex(box.x1 * xu[0] + box.y1 * yu[0], box.x1 * xu[1] + box.y1 * yu[1]);
      p.vertex(
        (box.x1 + box.w) * xu[0] + box.y1 * yu[0],
        (box.x1 + box.w) * xu[1] + box.y1 * yu[1]
      );
      p.vertex(
        (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0],
        (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1]
      );
      p.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
      );
      p.endShape(p.CLOSE);

      if (colorize && box.filled && box.h > 1.5 && box.w > 3) {
        displayLegend(box);
      }

      if (colorize && box.filled && box.crossed) {
        displayCross(box);
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
      const cols = Math.ceil((Math.random() * w) / 3);
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
            filled: false,
          };
          const content = apparatus.map((app) => ({
            ...app,
            x1: app.x1 + cell.x1,
            y1: app.y1 + cell.y1,
            level: 2,
            filled: true,
            crossed: app.w < 1.5 && app.h < 1.5 && Math.random() < 0.3,
            legend_width: 2 + Math.random() * (app.w - 3),
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

      const generator = new index(
        (cols - 11) / 2,
        (rows - 11) / 2,
        innerApparatusOptions
      );

      return generator.generate().map((a) => ({
        x1: (a.x1 - 1) * w_unit,
        y1: (a.y1 - 1) * h_unit,
        w: a.w * w_unit,
        h: a.h * h_unit,
        col: a.col,
      }));
    }
  };

  new p5(sketch);

  function get_palette() {
    const url = window.location.href.split('#');
    if (url.length === 1) return get('dt04');
    return get(url[1]);
  }

})));
