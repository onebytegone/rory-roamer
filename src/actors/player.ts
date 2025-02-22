import { Actor, Animation, CollisionType, Engine, Keys, range, SpriteSheet, vec } from 'excalibur';
import { Resources } from '../resources';

const RUN_SPEED = 64;

export class Player extends Actor {

   private _facingRight = true;

   constructor() {
      super({
         name: 'Player',
         pos: vec(100, 100),
         width: 48,
         height: 48,
         collisionType: CollisionType.Active,
      });
   }

   override onInitialize() {
      this.collider.useCircleCollider(8, vec(0, 4));

      const spriteSheet = SpriteSheet.fromImageSource({
         image: Resources.Player,
         grid: {
            rows: 10,
            columns: 8,
            spriteHeight: 32,
            spriteWidth: 32,
         },
      });

      const idleRight = Animation.fromSpriteSheet(spriteSheet, range(8, 11), 180),
            idleLeft = idleRight.clone(),
            runRight = Animation.fromSpriteSheet(spriteSheet, range(16, 24), 125),
            runLeft = runRight.clone();

      idleLeft.flipHorizontal = true;
      runLeft.flipHorizontal = true;

      this.graphics.add('idle-right', idleRight);
      this.graphics.add('idle-left', idleLeft);
      this.graphics.add('run-right', runRight);
      this.graphics.add('run-left', runLeft);
   }

   override onPreUpdate(engine: Engine, elapsedMs: number): void {
      if (engine.input.keyboard.isHeld(Keys.Left)) {
         this.vel.x = -RUN_SPEED;
         this._facingRight = false;
      } else if (engine.input.keyboard.isHeld(Keys.Right)) {
         this.vel.x = RUN_SPEED;
         this._facingRight = true;
      } else {
         this.vel.x = 0;
      }

      if (engine.input.keyboard.isHeld(Keys.Up)) {
         this.vel.y = -RUN_SPEED;
      } else if (engine.input.keyboard.isHeld(Keys.Down)) {
         this.vel.y = RUN_SPEED;
      } else {
         this.vel.y = 0;
      }

      if (this.vel.y !== 0 && this.vel.x !== 0) {
         this.vel.y /= Math.sqrt(2);
         this.vel.x /= Math.sqrt(2);
      }

      if (this.vel.x === 0 && this.vel.y === 0) {
         this.graphics.use(this._facingRight ? 'idle-right' : 'idle-left');
      } else {
         this.graphics.use(this._facingRight ? 'run-right' : 'run-left');
      }
   }

}
