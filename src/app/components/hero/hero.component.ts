import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ElementRef,
  NgZone,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../shared/services/theme.service';

// ✅ Type-only imports — zero runtime bundle cost
import type {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  AnimationMixer
} from 'three';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { WaveBackgroundComponent } from '../wave-background/wave-background.component';

@Component({
  selector: 'app-hero',
  imports: [WaveBackgroundComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('avatarContainer', { static: true }) avatarContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef<HTMLElement>;

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private clock!: Clock;
  private mixer: AnimationMixer | null = null;
  private rafId: number | null = null;
  private intersectionObserver?: IntersectionObserver;

  private modelPath = 'assets/avatar/blackjacket.glb';

  constructor(private theme: ThemeService, private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) { }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // On slow networks (2G/slow-2G) defer 3D load until idle so hero text paints first
    const conn = (navigator as any).connection;
    const isSlow = conn && (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g');
    const maxDPR = isSlow ? 1 : 1.75; // cap pixel ratio on slow networks

    const load3D = () => {
      this.ngZone.runOutsideAngular(async () => {
        const [THREE, glbBuffer, { GLTFLoader }] = await Promise.all([
          import('three'),
          fetch(this.modelPath).then(r => r.arrayBuffer()),
          import('three/examples/jsm/loaders/GLTFLoader.js')
        ]);

        const container = this.avatarContainer.nativeElement;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        const rect = container.getBoundingClientRect();
        const aspect = rect.width / Math.max(rect.height, 1);

        this.camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 100);
        this.camera.position.set(0, 5.78, 2.2);

        this.renderer = new THREE.WebGLRenderer({ antialias: !isSlow, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.setSize(rect.width, rect.height, false);
        this.renderer.domElement.classList.add('avatar-canvas');

        container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 10, 7.5);
        this.scene.add(dir);

        const loader = new GLTFLoader();
        loader.parse(
          glbBuffer,
          '',
          (gltf) => {
            const model = gltf.scene;
            model.rotation.y = Math.PI * -0.012;
            model.rotation.x = Math.PI * 0.015;
            model.position.set(0, 1, 0);
            model.scale.set(2.8, 2.8, 2.8);
            this.scene.add(model);
          },
          (err) => { console.error('Error parsing GLB avatar:', err); }
        );

        this.onResize();
        window.addEventListener('resize', this.onResizeBound);
        this.setupIntersectionObserver();
      });
    };

    // On slow connections: wait for browser idle before loading 3D
    if (isSlow && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(load3D, { timeout: 5000 });
    } else {
      load3D();
    }
  }

  private onResizeBound = this.onResize.bind(this);

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    if (!this.renderer) return;
    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private onResize() {
    if (!this.renderer || !this.camera) return;
    const container = this.avatarContainer.nativeElement;
    const width = container.clientWidth || container.getBoundingClientRect().width;
    const height = container.clientHeight || container.getBoundingClientRect().height || 1;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    // Keep the same capped DPR set at init — don't override it on resize
    this.renderer.setSize(width, height, false);
  }

  private setupIntersectionObserver() {
    const sectionEl = this.heroSection?.nativeElement;
    if (!sectionEl || !('IntersectionObserver' in window)) {
      this.startLoop();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const targetEntry = entries.find((entry) => entry.target === sectionEl);
        if (!targetEntry) return;
        if (targetEntry.isIntersecting) {
          this.startLoop();
        } else {
          this.stopLoop();
        }
      },
      { threshold: 0.2 }
    );

    this.intersectionObserver.observe(sectionEl);

    if (this.isElementVisible(sectionEl)) {
      this.startLoop();
    }
  }

  private startLoop() {
    if (this.rafId === null) this.animate();
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private isElementVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopLoop();
    try { window.removeEventListener('resize', this.onResizeBound); } catch (e) { }
    this.intersectionObserver?.disconnect();

    if (this.renderer) {
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.avatarContainer?.nativeElement?.contains(this.renderer.domElement)) {
        this.avatarContainer.nativeElement.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose?.();
    }
  }
}
