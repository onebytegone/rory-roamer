import { Color, DisplayMode, Engine, FadeInOut } from 'excalibur';
import { loader } from './resources';
import { IslandLevel } from './scenes/IslandLevel';

const MIN_TILE_COUNT = 10,
      TILE_SIZE = 16;

const game = new Engine({
   resolution: {
      height: MIN_TILE_COUNT * TILE_SIZE,
      width: MIN_TILE_COUNT * TILE_SIZE,
   },
   pixelRatio: 4,
   displayMode: DisplayMode.FitContainerAndFill,
   pixelArt: true,
   scenes: {
      island: IslandLevel
   },
   canvasElementId: 'game',
});

loader.on('beforeload', (e) => {
   // Hack: Resizing the canvas while loading breaks the scene's resolution until resized.
   // https://codepen.io/onebytegone/pen/azbJomx?editors=0011
   game.screen.popResolutionAndViewport();
});

game.start('island', {
   loader,
   inTransition: new FadeInOut({
      duration: 1000,
      direction: 'in',
      color: Color.ExcaliburBlue
   }),
});
