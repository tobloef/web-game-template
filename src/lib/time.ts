import { MILLISECONDS_PER_SECOND, type Seconds } from "./units/time";

export type TimeOptions = {
  real?: RealTimeOptions;
  simulation?: SimulationTimeOptions;
};

export class Time {
  readonly real: RealTime;
  readonly simulation: SimulationTime;

  /** How fast to run the simulation compared to real-time. */
  scale = 1;

  /** How much real time has passed since the last simulation update. */
  #unsimulatedRealTime: Seconds = 0 as Seconds;

  constructor(options?: TimeOptions) {
    this.real = new RealTime(options?.real);
    this.simulation = new SimulationTime(options?.simulation);
  }

  /**
   * How much simulation time remains before the next simulation update,
   * represented by a fraction of the simulation time step.
   *
   * This is useful for interpolating between two simulation states when
   * displaying them in real time.
   */
  get interpolationFactor(): Seconds {
    return (this.#unsimulatedRealTime / this.simulation.timestep) as Seconds;
  }

  getTicksToSimulate(): number {
    if (this.simulation.isPaused) {
      return 0;
    }

    return Math.floor(this.#unsimulatedRealTime / this.simulation.timestep);
  }

  updateRealTime() {
    const delta = this.real.update();
    const newUnsimulatedTime = this.#unsimulatedRealTime + delta;
    this.#unsimulatedRealTime = newUnsimulatedTime as Seconds;
  }

  updateSimulationTime() {
    const delta = this.simulation.update();
    const newUnsimulatedTime = this.#unsimulatedRealTime - delta * this.scale;
    this.#unsimulatedRealTime = newUnsimulatedTime as Seconds;
  }

  pause() {
    this.real.pause();
    this.simulation.pause();
  }

  resume() {
    this.real.resume();
    this.simulation.resume();
  }
}

export type RealTimeOptions = {
  maxDeltaTime?: Seconds;
};

class RealTime {
  static DEFAULT_MAX_DELTA_TIME = (1 / 4) as Seconds;

  #isPaused: boolean = false;
  #maxDelta: Seconds;
  #last?: Seconds;
  #current = 0 as Seconds;
  #elapsed = 0 as Seconds;
  #delta = 0 as Seconds;
  #leftOverFromPause = 0 as Seconds;

  constructor(options?: RealTimeOptions) {
    this.#maxDelta = options?.maxDeltaTime ?? RealTime.DEFAULT_MAX_DELTA_TIME;
  }

  get elapsed() {
    return this.#elapsed;
  }

  get delta() {
    return this.#delta;
  }

  get current() {
    return this.#current;
  }

  get isPaused() {
    return this.#isPaused;
  }

  getSystemTime(): Seconds {
    return (performance.now() / MILLISECONDS_PER_SECOND) as Seconds;
  }

  /**
   * @returns {Seconds} The delta time.
   */
  update(): Seconds {
    if (this.#isPaused) {
      return 0 as Seconds;
    }

    this.#current = this.getSystemTime();

    if (this.#last === undefined) {
      this.#last = this.#current;
    }

    this.#delta = (this.#current - this.#last) as Seconds;

    if (this.#delta < 0) {
      this.#delta = 0 as Seconds;
    }

    this.#elapsed = (this.#elapsed + this.#delta) as Seconds;

    if (this.#delta > this.#maxDelta) {
      this.#delta = this.#maxDelta;
    }

    this.#last = this.#current;

    return this.#delta;
  }

  pause() {
    if (this.#isPaused) {
      return;
    }

    this.#isPaused = true;

    if (this.#last !== undefined) {
      const current = this.getSystemTime();
      const delta = current - this.#last;
      this.#leftOverFromPause = delta as Seconds;
    } else {
      this.#leftOverFromPause = 0 as Seconds;
    }
  }

  resume() {
    if (!this.#isPaused) {
      return;
    }

    this.#isPaused = false;
    this.#last = (this.getSystemTime() - this.#leftOverFromPause) as Seconds;
  }
}

export type SimulationTimeOptions = {
  timestep?: Seconds;
};

class SimulationTime {
  static DEFAULT_TIMESTEP = (1 / 60) as Seconds;

  timestep: Seconds;

  #isPaused: boolean = false;
  #elapsed = 0 as Seconds;
  #delta = 0 as Seconds;

  constructor(options?: SimulationTimeOptions) {
    this.timestep = options?.timestep ?? SimulationTime.DEFAULT_TIMESTEP;

    if (this.timestep <= 0) {
      throw new Error("Simulation time step must be greater than 0.");
    }
  }

  get elapsed() {
    return this.#elapsed;
  }

  get delta() {
    return this.#delta;
  }

  get isPaused() {
    return this.#isPaused;
  }

  /**
   * @returns {Seconds} The delta time.
   */
  update(): Seconds {
    if (this.#isPaused) {
      return 0 as Seconds;
    }

    this.#elapsed = (this.#elapsed + this.#delta) as Seconds;
    this.#delta = this.timestep;

    return this.#delta;
  }

  pause() {
    this.#isPaused = true;
  }

  resume() {
    this.#isPaused = false;
  }
}
