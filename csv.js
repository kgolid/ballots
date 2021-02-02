export function generateCSV(front, left, top, scale, pal_size) {
  const c_front = front.map(convert);
  const c_left = left.map(convert).map(rot);
  const c_top = top.map(convert).map(rot).map(rot);
  const array = [...c_front, ...c_left, ...c_top];

  const merged = mergeEdges(array);
  return merged.map((a) => [
    a.x1 * scale,
    a.y1 * scale,
    a.z1 * scale,
    a.w * scale,
    a.h * scale,
    a.d * scale,
    a.col % pal_size,
  ]);
}

function convert(box) {
  let nbox = { ...box, d: box.z1 * 4 };
  nbox.z1 = 0;
  return nbox;
}

function rot(box) {
  return {
    x1: -box.z1,
    y1: box.x1,
    z1: -box.y1,
    w: -box.d,
    h: box.w,
    d: -box.h,
    col: box.col,
  };
}

function mergeEdges(boxes) {
  const edge_boxes = boxes.filter(is_edge);
  console.log('edges', edge_boxes);

  const grouped = group_neighbors(edge_boxes);
  console.log('grouped', grouped);

  const merged = grouped.map(mergeArr);
  console.log('merged', merged);

  const non_edge_boxes = boxes.filter((b) => !is_edge(b));
  return non_edge_boxes.concat(merged);
}

function is_edge(box) {
  return (box.x1 === 0) + (box.y1 === 0) + (box.z1 === 0) > 1; // At least to indices are 0.
}

function group_neighbors(boxes) {
  return boxes.reduce((acc, cur) => {
    var i = acc.findIndex((a) => neighbors(a[0], cur));
    if (i > -1) acc[i].push(cur);
    else acc.push([cur]);
    return acc;
  }, []);
}

function neighbors(b1, b2) {
  return b1.x1 === b2.x1 && b1.y1 === b2.y1 && b1.z1 === b2.z1;
}

function mergeArr(arr) {
  if (arr.length === 3) return mergeOrigo(...arr);
  return merge(...arr);
}

function merge(b1, b2) {
  var x1 = b1.w === b2.w ? b1.x1 : b1.x1 + Math.min(b1.w, b2.w);
  var y1 = b1.h === b2.h ? b1.y1 : b1.y1 + Math.min(b1.h, b2.h);
  var z1 = b1.d === b2.d ? b1.z1 : b1.z1 + Math.min(b1.d, b2.d);

  var w = b1.w === b2.w ? b1.w : Math.abs(b1.w) + Math.abs(b2.w);
  var h = b1.h === b2.h ? b1.h : Math.abs(b1.h) + Math.abs(b2.h);
  var d = b1.d === b2.d ? b1.d : Math.abs(b1.d) + Math.abs(b2.d);

  return { x1, y1, z1, w, h, d, col: b1.col };
}

function mergeOrigo(b1, b2, b3) {
  var xmin = Math.min(b1.w, b2.w, b3.w);
  var ymin = Math.min(b1.h, b2.h, b3.h);
  var zmin = Math.min(b1.d, b2.d, b3.d);

  var xmax = Math.max(b1.w, b2.w, b3.w);
  var ymax = Math.max(b1.h, b2.h, b3.h);
  var zmax = Math.max(b1.d, b2.d, b3.d);

  var w = -xmin + xmax;
  var h = -ymin + ymax;
  var d = -zmin + zmax;

  return { x1: xmin, y1: ymin, z1: zmin, w, d, h, col: b1.col };
}
