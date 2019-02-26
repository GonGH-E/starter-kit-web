const getRatio = () => {
  let ratio;

  ratio = (function() {
    const ctx = window.document.createElement('canvas').getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

    return dpr / bsr;
  })();

  ratio = Math.max(ratio, 2);

  return ratio;
};

export class BaseCanvas {
  ratio = 1;
  timer = 0;
  x = -1;
  y = -1;
  renderedTimer = {};

  constructor(id, options) {
    this.ratio = getRatio();
    this.running = false;
    this.options = options;
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.bindBaseMouseEvent();
  }

  adjustWidth() {
    const w = this.canvas.parentElement.clientWidth;
    this.setWidth(w * this.ratio);
  }

  adjustHeight() {
    if (this.options.height === -1) {
      this.setHeight(this.canvas.parentElement.clientHeight * this.ratio);
    } else {
      this.setHeight(this.options.height * this.ratio);
    }
  }

  onResizeWidth() {}

  setWidth(width) {
    if (this.canvas.width !== width) {
      this.canvas.width = width;
      if (this.onResizeWidth) {
        this.onResizeWidth();
      }
    }
  }

  setHeight(height) {
    if (this.canvas.height !== height) {
      this.canvas.height = height;
    }
  }

  updateOptions(options) {
    this.options = { ...this.options, ...options };
    if (this.installOptions) {
      this.installOptions();
    }
  }

  limitMaxFPS = (limit, fn) => {
    const limitRenderGap = 1000 / limit;
    const lastRenderAt = this.renderedTimer[fn];

    if (!lastRenderAt || this.timer - lastRenderAt > limitRenderGap) {
      fn.call(this);
      this.renderedTimer[fn] = this.timer;
    }
  };

  setupCanvas() {
    this.canvas.style.width = '100%';
    if (this.options.height === -1) {
      this.canvas.style.height = '100%';
    } else {
      this.canvas.style.height = `${this.options.height}px`;
    }
    this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  }

  start() {
    this.running = true;
    requestAnimationFrame(this.draw);
  }

  stop() {
    this.running = false;
  }

  installOptions() {}

  draw = timer => {
    this.timer = timer;

    if (!this.running) {
      return;
    }

    this.adjustWidth();
    this.adjustHeight();

    this.drawFrame(timer);

    const { showFPS } = this.options;

    if (showFPS) {
      if (this.timer) {
        const fps = Math.floor(1000 / (timer - this.timer));
        this.drawFPS(fps);
      }
    }

    this.timer = timer;

    if (this.options.afterDraw) {
      this.options.afterDraw();
    }

    requestAnimationFrame(this.draw);
  };

  drawFPS(fps) {
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`FPS: ${fps}`, this.canvas.width / 2, this.canvas.height / 2);
  }

  drawFrame(timer) {
    throw new Error('draw frame not implement');
  }

  bindBaseMouseEvent() {
    this.canvas.onmouseleave = e => {
      this.x = -1;
      this.y = -1;
    };

    this.canvas.onmousemove = e => {
      this.x = e.offsetX * this.ratio;
      this.y = e.offsetY * this.ratio;
    };
  }
}
