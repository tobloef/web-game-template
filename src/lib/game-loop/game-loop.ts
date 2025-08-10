import { TimeManager } from "./time-manager";

export type GameLoopOptions = {
  onSimulate?: OnSimulateCallback;
  onRender?: OnRenderCallback;
  time?: TimeManager;
};

export type OnSimulateCallback = (deltaTime: number) => void | Promise<void>;
export type OnRenderCallback = (deltaTime: number) => void | Promise<void>;

export class GameLoop {
  shouldQuit: boolean = false;

  onSimulate?: OnSimulateCallback;
  onRender?: OnRenderCallback;
  time: TimeManager;

  private runningPromise?: Promise<void>;

  constructor(options?: GameLoopOptions) {
    this.onSimulate = options?.onSimulate;
    this.onRender = options?.onRender;
    this.time = options?.time ?? new TimeManager();
  }

  /**
   * Returns a promise that resolves when the game loop stops or rejects if an
   * error is thrown from the `onSimulate` or `onRender` callbacks.
   */
  async run() {
    this.shouldQuit = false;

    this.runningPromise = new Promise((resolve, reject) => {
      const update = async () => {
        try {
          if (this.shouldQuit) {
            resolve(undefined);
            return;
          }

          this.time.updateRealTime();

          const ticks = this.time.getTicksToSimulate();
          for (let t = 0; t < ticks; t++) {
            this.time.updateSimulationTime();
            await this.onSimulate?.(this.time.simulation.delta);
          }

          await this.onRender?.(this.time.real.delta);

          requestAnimationFrame(update);
        } catch (error) {
          reject(error);
        }
      };

      requestAnimationFrame(update);
    });

    return this.runningPromise;
  }

  async quit() {
    this.shouldQuit = true;

    if (this.runningPromise) {
      await this.runningPromise;
      this.runningPromise = undefined;
    }
  }
}
