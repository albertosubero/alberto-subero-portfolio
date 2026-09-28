import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

interface Star {
  x: number;
  y: number;
  depth: number;
  radius: number;
  twinkle: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

@Component({
    selector: 'app-space-background',
    imports: [],
    templateUrl: './space-background.component.html',
    styleUrl: './space-background.component.scss'
})
export class SpaceBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private frameId = 0;
  private width = 0;
  private height = 0;

  // Estado del scroll: la velocidad suavizada es la que dispara el hyperspace.
  private scrollY = 0;
  private lastScrollY = 0;
  private velocity = 0;
  private warp = 0;

  private pointerX = -1;
  private pointerY = -1;
  private reducedMotion = false;

  private resizeObserver?: ResizeObserver;

  private readonly onScroll = () => { this.scrollY = window.scrollY; };
  private readonly onPointerMove = (event: PointerEvent) => {
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
  };
  private readonly onPointerLeave = () => {
    this.pointerX = -1;
    this.pointerY = -1;
  };
  private readonly onVisibility = () => {
    if (document.hidden) {
      this.stop();
    } else if (!this.reducedMotion) {
      this.lastScrollY = window.scrollY;
      this.start();
    }
  };

  constructor(private zone: NgZone, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const context = this.canvasRef.nativeElement.getContext('2d');
    if (!context) return;

    this.context = context;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scrollY = this.lastScrollY = window.scrollY;

    // El host es fixed/inset:0, asi que su caja ES el viewport. Medirlo con un
    // ResizeObserver evita depender de window.innerWidth, que puede ser 0 durante
    // el primer layout, y cubre gratis cualquier cambio de tamano.
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host.nativeElement);
    });

    this.resize();

    if (this.reducedMotion) {
      this.draw();
      return;
    }

    // Fuera de la zona de Angular: 60fps sin disparar change detection.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.start();
    });
  }

  ngOnDestroy() {
    this.stop();
    this.resizeObserver?.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private start() {
    if (!this.frameId) this.frameId = requestAnimationFrame(() => this.tick());
  }

  private stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private resize() {
    const element = this.host.nativeElement;
    const width = element.clientWidth || window.innerWidth;
    const height = element.clientHeight || window.innerHeight;

    // Sin caja util todavia: el observer volvera a llamar cuando la haya.
    if (!width || !height) return;
    if (width === this.width && height === this.height) return;

    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    this.width = width;
    this.height = height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.buildStars();
    if (this.reducedMotion) this.draw();
  }

  private buildStars() {
    const density = (this.width * this.height) / 9000;
    const total = Math.round(Math.min(Math.max(density, 90), 260));

    this.stars = Array.from({ length: total }, () => {
      const depth = 0.2 + Math.random() * 0.8;
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        depth,
        radius: 0.3 + depth * 1.4,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.006 + Math.random() * 0.02
      };
    });
  }

  private tick() {
    this.frameId = requestAnimationFrame(() => this.tick());

    // Velocidad de scroll suavizada, convertida en un factor warp de 0 a 1.
    const delta = this.scrollY - this.lastScrollY;
    this.lastScrollY = this.scrollY;
    this.velocity += (delta - this.velocity) * 0.18;

    const target = Math.min(Math.abs(this.velocity) / 55, 1);
    this.warp += (target - this.warp) * (target > this.warp ? 0.25 : 0.08);

    this.host.nativeElement.style.setProperty('--nebula-shift', (this.scrollY * -0.04).toFixed(2));

    if (Math.random() < 0.0022 && this.shootingStars.length < 2) {
      this.spawnShootingStar();
    }

    this.draw();
  }

  private spawnShootingStar() {
    const angle = Math.PI / 5 + Math.random() * (Math.PI / 6);
    const speed = 9 + Math.random() * 7;

    this.shootingStars.push({
      x: Math.random() * this.width * 0.7,
      y: Math.random() * this.height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1
    });
  }

  private starY(star: Star) {
    const offset = this.scrollY * star.depth * 0.45;
    return ((star.y - offset) % this.height + this.height) % this.height;
  }

  private draw() {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);

    const warp = this.warp;
    const direction = this.velocity >= 0 ? 1 : -1;

    // Las constelaciones solo viven en reposo: al acelerar dejan paso a los trazos.
    const linkAlpha = (1 - warp) * 0.5;
    if (linkAlpha > 0.02) this.drawConstellations(linkAlpha);

    for (const star of this.stars) {
      const y = this.starY(star);

      star.twinkle += star.twinkleSpeed;
      const flicker = 0.55 + Math.sin(star.twinkle) * 0.3;
      const alpha = Math.min(flicker * (0.35 + star.depth * 0.65), 1);
      const streak = warp * star.depth * 150;

      if (streak > 1.5) {
        const tail = y - streak * direction;
        const gradient = ctx.createLinearGradient(star.x, y, star.x, tail);
        gradient.addColorStop(0, 'rgba(255, 211, 105, ' + (alpha * warp).toFixed(3) + ')');
        gradient.addColorStop(1, 'rgba(180, 226, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.radius * (1 + warp);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(star.x, y);
        ctx.lineTo(star.x, tail);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(214, 236, 255, ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, y, star.radius * (1 + warp * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawShootingStars();
  }

  private drawConstellations(alpha: number) {
    const ctx = this.context;
    const near = this.stars.filter(star => star.depth > 0.62);
    const maxDistance = 132;

    ctx.lineWidth = 0.6;

    for (let i = 0; i < near.length; i++) {
      const a = near[i];
      const ay = this.starY(a);

      for (let j = i + 1; j < near.length; j++) {
        const b = near[j];
        const by = this.starY(b);
        const distance = Math.hypot(a.x - b.x, ay - by);
        if (distance > maxDistance) continue;

        const strength = (1 - distance / maxDistance) * alpha;
        ctx.strokeStyle = 'rgba(120, 190, 214, ' + (strength * 0.5).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, ay);
        ctx.lineTo(b.x, by);
        ctx.stroke();
      }

      // Hilos hacia el cursor: la constelación reacciona al puntero.
      if (this.pointerX < 0) continue;
      const pointerDistance = Math.hypot(a.x - this.pointerX, ay - this.pointerY);
      if (pointerDistance > 180) continue;

      const glow = (1 - pointerDistance / 180) * alpha;
      ctx.strokeStyle = 'rgba(255, 211, 105, ' + (glow * 0.7).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(a.x, ay);
      ctx.lineTo(this.pointerX, this.pointerY);
      ctx.stroke();
    }
  }

  private drawShootingStars() {
    const ctx = this.context;

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const shot = this.shootingStars[i];
      shot.x += shot.vx;
      shot.y += shot.vy;
      shot.life -= 0.012;

      if (shot.life <= 0 || shot.x > this.width + 120 || shot.y > this.height + 120) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = shot.x - shot.vx * 11;
      const tailY = shot.y - shot.vy * 11;
      const gradient = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
      gradient.addColorStop(0, 'rgba(255, 236, 190, ' + (shot.life * 0.9).toFixed(3) + ')');
      gradient.addColorStop(1, 'rgba(255, 211, 105, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shot.x, shot.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }
}
