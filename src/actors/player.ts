import { Actor, Animation, CollisionType, Engine, Keys, range, SpriteSheet, vec, Vector } from 'excalibur';
import { Resources } from '../resources';
import nipplejs from 'nipplejs';

const RUN_SPEED = 64,
      TOUCH_JOYSTICK_DEADZONE = 0.35;

export class Player extends Actor {

   private _facingRight = true;
   private _touchJoystickVector: Vector | undefined;

   constructor() {
      super({
         name: 'Player',
         pos: vec(100, 100),
         width: 48,
         height: 48,
         collisionType: CollisionType.Active,
      });
   }

   override onInitialize(engine: Engine): void {
      const joystickManager = nipplejs.create({
         zone: document.querySelector<HTMLElement>('.game-container')!,
      });

      joystickManager.on('move', (event, data) => {
         this._touchJoystickVector = vec(data.vector.x, data.vector.y);
      });

      joystickManager.on('end', (event, data) => {
         this._touchJoystickVector = undefined;
      });

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
      const { x, y } = this._getInput(engine);

      if (x === -1) {
         this._facingRight = false;
      } else if (x === 1) {
         this._facingRight = true;
      }

      this.vel.x = RUN_SPEED * x;
      this.vel.y = RUN_SPEED * y;

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

   private _getInput(engine: Engine): { x: number, y: number } {
      if (this._touchJoystickVector) {
         return {
            x: this._touchJoystickVector.x > TOUCH_JOYSTICK_DEADZONE ? 1
               : this._touchJoystickVector.x < -TOUCH_JOYSTICK_DEADZONE ? -1 : 0,
            y: this._touchJoystickVector.y > TOUCH_JOYSTICK_DEADZONE ? -1
               : this._touchJoystickVector.y < -TOUCH_JOYSTICK_DEADZONE ? 1 : 0,
         };
      }

      let x = 0,
          y = 0;

      if (engine.input.keyboard.isHeld(Keys.Left)) {
         x = -1;
      } else if (engine.input.keyboard.isHeld(Keys.Right)) {
         x = 1;
      }

      if (engine.input.keyboard.isHeld(Keys.Up)) {
         y = -1;
      } else if (engine.input.keyboard.isHeld(Keys.Down)) {
         y = 1;
      }

      return { x, y };
   }

}
