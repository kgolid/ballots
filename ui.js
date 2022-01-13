import * as dat from 'dat.gui';
import * as tome from 'chromotome';

export default function (opts, full_reset, redraw, print, presets = null) {
  const onPaletteChange = function (controller) {
    controller.setValue(0);
    controller.max(tome.get(opts.palette).size - 1);
  };

  const ctrls = {
    print: print,
    reset: full_reset,
  };

  let gui;
  if (presets !== null) {
    gui = new dat.GUI({ load: presets });
    gui.remember(opts);
  } else {
    gui = new dat.GUI();
  }
  const f0 = gui.addFolder('Structural Changes');
  f0.open();
  f0.add(opts, 'cubedimX', 0, 70, 5).name('X Dimension').onChange(full_reset);
  f0.add(opts, 'cubedimY', 0, 70, 5).name('Y Dimension').onChange(full_reset);
  f0.add(opts, 'cubedimZ', 0, 70, 5).name('Z Dimension').onChange(full_reset);
  f0.add(opts, 'outerSize', 0.9, 1, 0.01).name('Section Sizes').onChange(full_reset);
  f0.add(opts, 'minGridSize', 1, 10, 1).name('Min Grid Size').onChange(full_reset);
  f0.add(opts, 'innerSize', 0.7, 1, 0.02).name('Atom Sizes').onChange(full_reset);
  f0.add(opts, 'colorMode', ['single', 'main', 'group', 'random'])
    .name('Color Distr.')
    .onChange(full_reset);
  const f1 = gui.addFolder('Stylistic Changes');
  f1.open();
  f1.add(opts, 'tx', -2400, 2400, 200).name('Translate X').onChange(redraw);
  f1.add(opts, 'ty', -2400, 2400, 200).name('Translate Y').onChange(redraw);
  f1.add(opts, 'mag', 2, 30, 1).name('Cell Size').onChange(redraw);
  f1.add(opts, 'depthDim', 0, 10, 0.5).name('Depth').onChange(redraw);
  f1.add(opts, 'perspective', 0.65, 1, 0.05).name('Perspective').onChange(redraw);
  const shiftController = f1
    .add(opts, 'paletteShift', 0, 10, 1)
    .listen()
    .name('Palette Shift')
    .onChange(redraw);
  f1.add(opts, 'palette', tome.getNames())
    .name('Palette')
    .onChange(redraw)
    .onFinishChange(() => onPaletteChange(shiftController));
  f1.add(opts, 'shadeOpacityFront', 0, 1, 0.1).name('Shade Opacity Front').onChange(redraw);
  f1.add(opts, 'shadeOpacityLeft', 0, 1, 0.1).name('Shade Opacity Left').onChange(redraw);
  f1.add(opts, 'shadeOpacityTop', 0, 1, 0.1).name('Shade Opacity Top').onChange(redraw);
  f1.add(opts, 'outerStrokeWeight', 0, 9, 1).name('Outer Stroke Weight').onChange(redraw);
  f1.add(opts, 'innerStrokeWeight', 0, 9, 1).name('Inner Stroke Weight').onChange(redraw);
  const f2 = gui.addFolder('Control');
  f2.open();
  f2.add(ctrls, 'reset').name('Generate new');
  f2.add(ctrls, 'print').name('Download image');
}
