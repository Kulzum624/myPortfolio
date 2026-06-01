import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';

// --- THREE types only (erased at runtime, zero bundle cost) ---
import type * as THREEType from 'three';

@Component({
  selector: 'app-wave-background',
  imports: [],
  templateUrl: './wave-background.component.html',
  styleUrl: './wave-background.component.css'
})
export class WaveBackgroundComponent implements OnInit, OnDestroy {
  // Hold references as `any` — typed via THREEType locally where needed
  private THREE!: typeof THREEType;
  private renderer!: THREEType.WebGLRenderer;
  private scene!: THREEType.Scene;
  private camera!: THREEType.PerspectiveCamera;
  private points!: THREEType.Points;
  private animationFrameId!: number;
  private container!: HTMLElement;
  private observer!: IntersectionObserver;
  private clock!: THREEType.Clock;

  private originalPositions!: Float32Array;
  private resetInterval: any;

  // Ring geometry parameters
  private readonly RING_RADIUS = 4.5;
  private readonly TUBE_RADIUS = 1.2;
  private readonly RADIAL_SEGMENTS = 100;
  private readonly TUBULAR_SEGMENTS = 40;

  constructor(private el: ElementRef) {}

  async ngOnInit() {
    // ✅ Dynamic import — Three.js stays OUT of the initial bundle
    this.THREE = await import('three');

    this.container = this.el.nativeElement.querySelector('#wave-container');
    this.clock = new this.THREE.Clock();
    this.initScene();
    this.setupIntersectionObserver();

    // Reset animation every 12 seconds
    this.resetInterval = setInterval(() => {
      this.clock.start();
      const positions = this.points.geometry.attributes['position'];
      for (let i = 0; i < positions.count; i++) {
        positions.setXYZ(
          i,
          this.originalPositions[i * 3],
          this.originalPositions[i * 3 + 1],
          this.originalPositions[i * 3 + 2]
        );
      }
      positions.needsUpdate = true;
    }, 12000);
  }

  private initScene() {
    const THREE = this.THREE;
    this.scene = new THREE.Scene();
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    const geometry = new THREE.TorusGeometry(
      this.RING_RADIUS,
      this.TUBE_RADIUS,
      this.TUBULAR_SEGMENTS,
      this.RADIAL_SEGMENTS
    );
    geometry.rotateX(Math.PI / 1.2);

    this.originalPositions = new Float32Array(geometry.attributes['position'].array);

    const material = new THREE.PointsMaterial({
      color: '#96ed28',
      size: 0.035,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    window.addEventListener('resize', this.onResize);
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!this.animationFrameId) this.animate();
        } else {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = 0;
        }
      });
    });
    this.observer.observe(this.container);
  }

  private onResize = () => {
    const newWidth = this.container.clientWidth;
    const newHeight = this.container.clientHeight;
    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(newWidth, newHeight);
  };

  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();
    const positions = this.points.geometry.attributes['position'];
    const count = positions.count;

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const angle = Math.atan2(positions.getZ(i), x);

      const wave1 = Math.sin(angle * 1.5 + elapsed * 2.5) * 0.012;
      const wave2 = Math.cos(angle * 0.1 + elapsed) * 0.005;
      const wave3 = Math.sin(x * 0.5 + elapsed * 3) * 0.02;

      positions.setY(i, y + wave1 + wave2 + wave3);
    }
    positions.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    cancelAnimationFrame(this.animationFrameId);
    clearInterval(this.resetInterval);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer.dispose();
      this.scene.clear();
    }
  }
}
