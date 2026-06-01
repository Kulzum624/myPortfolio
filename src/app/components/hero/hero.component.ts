
import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { ThemeService } from '../../shared/services/theme.service';

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Clock,
  SRGBColorSpace,
  ACESFilmicToneMapping
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';
import { WaveBackgroundComponent } from "../wave-background/wave-background.component";

@Component({
  selector: 'app-hero',
  // keep the wave background import you already had
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
  private clock = new Clock();
  private mixer: AnimationMixer | null = null;
  private rafId: number | null = null;
  private intersectionObserver?: IntersectionObserver;

  // path to your model
  private modelPath = 'assets/avatar/blackjacket.glb';

  constructor(private theme: ThemeService, private ngZone: NgZone) { }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  ngAfterViewInit(): void {
    // run the render loop outside Angular to avoid change detection on every frame
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.loadModel();
      this.onResize(); // set initial sizes
      window.addEventListener('resize', this.onResizeBound);
      this.setupIntersectionObserver();
    });
  }

  // bound handler so we can remove later
  private onResizeBound = this.onResize.bind(this);

  private initThree() {
    const container = this.avatarContainer.nativeElement;
    this.scene = new Scene();

    const rect = container.getBoundingClientRect();
    const aspect = rect.width / Math.max(rect.height, 1);

    this.camera = new PerspectiveCamera(32, aspect, 0.1, 100);
    this.camera.position.set(0, 5.78, 2.2);

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setSize(rect.width, rect.height, false);
    this.renderer.domElement.classList.add('avatar-canvas');

    // append canvas
    container.appendChild(this.renderer.domElement);

    // lights
    const ambient = new AmbientLight(0xffffff, 1);
    this.scene.add(ambient);

    // const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 4);//0.8
    // hemi.position.set(0, 1, 0);
    // this.scene.add(hemi);

    const dir = new DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    this.scene.add(dir);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      this.modelPath,
      (gltf) => {
        const model = gltf.scene;
        // adjust scale / rotation / position to taste
        model.rotation.y = Math.PI * -0.012;
        model.rotation.x = Math.PI * 0.015; // face camera
        model.position.set(0, 1, 0);
        model.scale.set(2.8, 2.8, 2.8);

        this.scene.add(model);

        // animations
        // if (gltf.animations && gltf.animations.length) {
        //   this.mixer = new AnimationMixer(model);
        //   // play all clips (or choose gltf.animations[0] etc)
        //   gltf.animations.forEach((clip) => {
        //     const action = this.mixer!.clipAction(clip);
        //     action.reset();
        //     action.play();
        //   });
        // }
      },
      (xhr) => {
        // optional: progress logging
        // console.log(`avatar ${Math.round((xhr.loaded / (xhr.total || 1)) * 100)}% loaded`);
      },
      (err) => {
        console.error('Error loading GLB avatar:', err);
      }
    );
  }

  private animate = () => {
    // requestAnimationFrame loop
    this.rafId = requestAnimationFrame(this.animate);
    if (!this.renderer) {
      return;
    }
    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private onResize() {
    const container = this.avatarContainer.nativeElement;
    const width = container.clientWidth || container.getBoundingClientRect().width;
    const height = container.clientHeight || container.getBoundingClientRect().height || 1;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
  }

  private setupIntersectionObserver() {
    const sectionEl = this.heroSection?.nativeElement;
    if (!sectionEl) {
      this.startLoop();
      return;
    }

    if (!('IntersectionObserver' in window)) {
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
    if (this.rafId === null) {
      this.animate();
    }
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
    // cleanup
    this.stopLoop();
    try {
      window.removeEventListener('resize', this.onResizeBound);
    } catch (e) { }

    this.intersectionObserver?.disconnect();

    // dispose renderer and scene children
    if (this.renderer) {
      this.renderer.forceContextLoss();
      // remove canvas from DOM if attached
      if (this.renderer.domElement && this.avatarContainer?.nativeElement?.contains(this.renderer.domElement)) {
        this.avatarContainer.nativeElement.removeChild(this.renderer.domElement);
      }
      // @ts-ignore
      this.renderer.dispose && this.renderer.dispose();
    }

    // optional: traverse and dispose materials/geometries if you expect memory issues
  }
}
