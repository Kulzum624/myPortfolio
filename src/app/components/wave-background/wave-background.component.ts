import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-wave-background',
  imports: [],
  templateUrl: './wave-background.component.html',
  styleUrl: './wave-background.component.css'
})
export class WaveBackgroundComponent implements OnInit, OnDestroy {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private points!: THREE.Points;
  private animationFrameId!: number;
  private container!: HTMLElement;
  private observer!: IntersectionObserver;
  private clock = new THREE.Clock();

  private originalPositions!: Float32Array; // ⬅ Store original positions
  private resetInterval: any;

  // Ring geometry parameters
  private readonly RING_RADIUS = 4.5;
  private readonly TUBE_RADIUS = 1.2;
  private readonly RADIAL_SEGMENTS = 100; // Reduced from 180
  private readonly TUBULAR_SEGMENTS = 40; // Reduced from 80

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.container = this.el.nativeElement.querySelector('#wave-container');
    this.initScene();
    this.setupIntersectionObserver();

    // 🔁 Reset animation every 5 seconds
    this.resetInterval = setInterval(() => {
      this.clock.start();

      // Reset geometry positions
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

  initScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Create a torus (ring) geometry for the wave effect
    const geometry = new THREE.TorusGeometry(
      this.RING_RADIUS,
      this.TUBE_RADIUS,
      this.TUBULAR_SEGMENTS,
      this.RADIAL_SEGMENTS
    );

    // Tilt the ring to face the camera at an angle
    // geometry.rotateY(Math.PI / 1.5);
    geometry.rotateX(Math.PI / 1.2);

    this.originalPositions = new Float32Array(geometry.attributes['position'].array);


    // geometry.rotateX += 0.1;

    const material = new THREE.PointsMaterial({
      color: '#96ed28',

      size: 0.035,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    // Resize handler
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

    // Animate the positions to create ocean-like ripples along the ring surface
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Calculate angle around the ring
      const angle = Math.atan2(z, x);
      // Distance from the ring center (on XZ plane)
      // const dist = Math.sqrt(x + z);

      // Create wave displacement based on angle and time
      const wave1 = Math.sin(angle * 1.5 + elapsed * 2.5) * 0.012;
      const wave2 = Math.cos(angle * 0.1 + elapsed) * 0.005;
      const wave3 = Math.sin(x * 0.5 + elapsed * 3) * 0.02;

      // Apply vertical displacement (Y axis after rotation)
      const displacement = wave1 + wave2 + wave3;

      // Offset the Y position based on the wave
      const baseY = y;
      positions.setY(i, baseY + displacement);
    }
    positions.needsUpdate = true;

    // Slow rotation of the entire ring for added depth
    // this.points.rotation.z += 0.0008;

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.scene.clear();
  }
}
