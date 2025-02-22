import { Animation, BoundingBox, Engine, LimitCameraBoundsStrategy, Random, range, Scene, SpriteSheet, TileMap } from 'excalibur';
import { Player } from '../actors/player';
import { Resources } from '../resources';

const MAP_WIDTH = 32,
      MAP_HEIGHT = 32;

/**
 * 8 -- 1
 * |    |
 * 4 -- 2
 *
 * ## Island 9-Up:
 *
 * (8; NW; 0,0) - (9; N; 1,0) - (1; NE; 2,0)
 *       |                            |
 * (12; W; 0,1)   (15; C; 1,1)   (3; E; 2,1)
 *       |                            |
 * (4; SW; 0,2) - (6; S; 1,2) - (2; SE; 2,2)
 *
 * ## Hole 9-Up:
 *
 * (13; NW; 0,0) -         - (11; NE; 2,0)
 *       |                            |
 *               (0; C; 1,1)
 *       |                            |
 * (14; SW; 0,2) -         - (7; SE; 2,2)
 */
const WANG_TILE_SPRITE_SHEET = [
   { offset: { x: 3, y: 2 }, frames: 1 }, // 0; None
   { offset: { x: 2, y: 0 }, frames: 4 }, // 1; NE, more water
   { offset: { x: 2, y: 2 }, frames: 4 }, // 2; SE, more water
   { offset: { x: 2, y: 1 }, frames: 4 }, // 3; E
   { offset: { x: 0, y: 2 }, frames: 4 }, // 4; SW, more water
   { offset: { x: 2, y: 3 }, frames: 1 }, // 5;
   { offset: { x: 1, y: 2 }, frames: 4 }, // 6; S
   { offset: { x: 4, y: 1 }, frames: 4 }, // 7; SE, more land
   { offset: { x: 0, y: 0 }, frames: 4 }, // 8; NW, more water
   { offset: { x: 1, y: 0 }, frames: 4 }, // 9; N
   { offset: { x: 3, y: 2 }, frames: 1 }, // 10;
   { offset: { x: 4, y: 0 }, frames: 4 }, // 11; NE, more land
   { offset: { x: 0, y: 1 }, frames: 4 }, // 12; W
   { offset: { x: 3, y: 0 }, frames: 4 }, // 13; NW, more land
   { offset: { x: 3, y: 1 }, frames: 4 }, // 14; SW, more land
   { offset: { x: 1, y: 1 }, frames: 1 }, // 15; All
];

enum WangTileEdge {
   None = 0,
   WaterNE = 1,
   WaterSE = 2,
   E = 3,
   WaterSW = 4,
   S = 6,
   LandSE = 7,
   WaterNW = 8,
   N = 9,
   LandNE = 11,
   W = 12,
   LandNW = 13,
   LandSW = 14,
   All = 15,
};

export class IslandLevel extends Scene {

   override onInitialize(engine: Engine): void {
      const spriteSheet = SpriteSheet.fromImageSource({
         image: Resources.Forest,
         grid: {
            rows: 9,
            columns: 22,
            spriteHeight: 16,
            spriteWidth: 16
         },
      });

      const tileMap = new TileMap({
         rows: MAP_WIDTH,
         columns: MAP_HEIGHT,
         tileWidth: 16,
         tileHeight: 16,
      });

      const grassSprites = [
         spriteSheet.getSprite(10, 1),
         spriteSheet.getSprite(10, 2),
         spriteSheet.getSprite(10, 3),
         spriteSheet.getSprite(10, 4),
         spriteSheet.getSprite(11, 1),
         spriteSheet.getSprite(11, 2),
         spriteSheet.getSprite(11, 3),
         spriteSheet.getSprite(11, 4),
      ];

      const mossSprites = [
         spriteSheet.getSprite(8, 1),
         spriteSheet.getSprite(8, 2),
         spriteSheet.getSprite(9, 1),
         spriteSheet.getSprite(9, 2),
      ];

      const walkableSprites = [
         spriteSheet.getSprite(2, 2),
         ...grassSprites,
         ...mossSprites,
      ];

      const edgeSprites = WANG_TILE_SPRITE_SHEET.map(({ offset, frames }) => {
         const spriteSheetX = offset.x + 1,
               spriteSheetY = offset.y + 5;

         if (frames > 1) {
            return Animation.fromSpriteSheet(spriteSheet, range(0, frames - 1).map((i) => {
               return spriteSheetY * spriteSheet.columns + spriteSheetX + (i * 5);
            }), 500);
         }

         return spriteSheet.getSprite(spriteSheetX, spriteSheetY);
      });

      const rng = new Random();

      Array.from({ length: tileMap.rows }).forEach((_, i) => {
         Array.from({ length: tileMap.columns }).forEach((_, j) => {
            const tile = tileMap.getTile(i, j);

            if (!tile) {
               return;
            }

            tile.solid = true;

            if (i === 0 && j === 0) {
               tile.addGraphic(edgeSprites[WangTileEdge.WaterNW]);
            } else if (i === tileMap.rows - 1 && j === 0) {
               tile.addGraphic(edgeSprites[WangTileEdge.WaterNE]);
            } else if (i === 0 && j === tileMap.columns - 1) {
               tile.addGraphic(edgeSprites[WangTileEdge.WaterSW]);
            } else if (i === tileMap.rows - 1 && j === tileMap.columns - 1) {
               tile.addGraphic(edgeSprites[WangTileEdge.WaterSE]);
            } else if (i === 0) {
               tile.addGraphic(edgeSprites[WangTileEdge.W]);
            } else if (i === tileMap.rows - 1) {
               tile.addGraphic(edgeSprites[WangTileEdge.E]);
            } else if (j === 0) {
               tile.addGraphic(edgeSprites[WangTileEdge.N]);
            } else if (j === tileMap.columns - 1) {
               tile.addGraphic(edgeSprites[WangTileEdge.S]);
            } else {
               tile.solid = false;
               tile.addGraphic(rng.pickOne(walkableSprites));
            }
         });
      });

      this.add(tileMap);

      const player = new Player();

      this.add(player);

      this.camera.strategy.lockToActor(player);
      this.camera.addStrategy(
         new LimitCameraBoundsStrategy(
            new BoundingBox(0, 0, tileMap.columns * tileMap.tileWidth, tileMap.rows * tileMap.tileHeight)
         )
      );
   }

}
