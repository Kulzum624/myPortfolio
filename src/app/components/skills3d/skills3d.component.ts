import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationMixer } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';


@Component({
  selector: 'app-skills3d',
  templateUrl: './skills3d.component.html',
  styleUrls: ['./skills3d.component.css'] // optional
})
export class Skills3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // three.js core objects
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId: number | null = null;
  private mixer: AnimationMixer | null = null;
  private observer!: IntersectionObserver;

  // ring group & rotation speed
  private ringGroup!: THREE.Group;
  private ringRotationSpeed = 0.4; // degrees per second

  // assets to load (file names in src/assets/logos)
  private skillLogos = [
    'Three.js.svg', 'typescript.svg', 'angular.svg', 'react.svg', 'sql.svg',
    'cpp.svg', 'python.svg', 'C.svg', 'tensorflow.svg', 'numpy.svg', 'node.svg', 'mongodb.svg', 'pgsql.svg'
  ];

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    // run outside Angular change detection
    this.ngZone.runOutsideAngular(() => {
      this.initScene();
      this.loadAvatarAndLogos();
      this.onResize();
      window.addEventListener('resize', this.onResizeBound);
      this.setupIntersectionObserver();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResizeBound);
    this.stopAnimationLoop();
    this.disposeAll();
  }

  // ---------- Initialization ----------
  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    // this.renderer.shadowMap.enabled = true;
    this.scene = new THREE.Scene();

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    this.camera.position.set(0, 1.4, 3.6);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 4);//0.8
    hemi.position.set(0, 1, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 5, 2);
    // dir.castShadow = true;
    // dir.shadow.camera.near = 0.1;
    // dir.shadow.camera.far = 50;
    // dir.shadow.mapSize.set(1024, 1024);
    this.scene.add(dir);

    // subtle ground to receive shadows
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    // ground.receiveShadow = true;
    this.scene.add(ground);

    // Orbit controls - limited so user can only rotate a bit
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1.8;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.3;
    this.controls.autoRotate = false;
    this.controls.enableZoom = false;   // disable wheel zoom
    this.controls.enablePan = false;    // prevent blocking scroll


    // ring group
    this.ringGroup = new THREE.Group();
    this.scene.add(this.ringGroup);
  }

  // ---------- Loading glTF avatar and logos ----------
  private loadAvatarAndLogos() {
    const loader = new GLTFLoader();
    const avatarPath = 'assets/avatar/light/Typing.glb'; // make sure in angular.json assets

    loader.load(avatarPath, (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // mesh.castShadow = true;
          // mesh.receiveShadow = true;
          // optionally tune material
          if ((mesh.material as any).metalness !== undefined) {
            (mesh.material as any).metalness = 0.2;
            (mesh.material as any).roughness = 0.6;
          }
        }
      });

      model.scale.setScalar(1.0);
      model.position.set(0, -0.85, 0); // adjust so avatar stands on plane
      this.scene.add(model);

      // animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new AnimationMixer(model);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    }, undefined, (err) => {
      console.error('Failed to load avatar', err);
    });

    // create the torus (ring)
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.00003, 16, 120), //0.03
      new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(0x2dd4bf).multiplyScalar(0.002), // 0.02
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.2 //0.9
      })
    );
    torus.rotation.x = Math.PI / 2;
    torus.position.y = 0.40;//0.035
    torus.receiveShadow = false;
    torus.castShadow = false;
    this.ringGroup.add(torus);

    // place logos on ring
    this.createLogoSprites();
  }

  onZoomScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    const maxScroll = event.target.scrollHeight - event.target.clientHeight;

    const zoomFactor = scrollTop / maxScroll;

    // Convert scroll position into camera zoom distance
    const minDistance = 2.5;
    const maxDistance = 6;//6

    this.controls.minDistance = minDistance;
    this.controls.maxDistance = maxDistance;

    const targetDistance = minDistance + (maxDistance - minDistance) * zoomFactor;

    this.camera.position.setLength(targetDistance);
  }


  private createLogoSprites() {
    const radius = 1.45;      // matches torus radius
    const logoSize = 0.28;    // adjust size
    const count = this.skillLogos.length;

    this.skillLogos.forEach((filename, i) => {
      const url = `assets/icons/${filename}`;

      this.loadSvgAsTexture(url).then((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });

        const plane = new THREE.PlaneGeometry(logoSize, logoSize);
        const mesh = new THREE.Mesh(plane, material);
        mesh.userData = { isLogo: true };

        // angle around circle
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        mesh.position.set(x, 0.40, z);
        mesh.lookAt(this.camera.position.x, this.camera.position.y, this.camera.position.z); // face initial camera
        this.ringGroup.add(mesh);
      }).catch((err) => {
        console.error('Logo load error', filename, err);
      });
    });
  }

  /**
   * Fetches an SVG file, sanitizes it, renders it onto a canvas,
   * and returns a CanvasTexture. This avoids THREE.TextureLoader
   * failing on SVGs with XML declarations, DOCTYPEs, or missing xmlns.
   */
  private loadSvgAsTexture(url: string): Promise<THREE.CanvasTexture> {
    return fetch(url)
      .then(res => res.text())
      .then(svgText => {
        return new Promise<THREE.CanvasTexture>((resolve, reject) => {
          // Ensure the SVG has an xmlns attribute
          let sanitized = svgText;
          if (!sanitized.includes('xmlns=')) {
            sanitized = sanitized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }

          // Create a blob URL from the SVG text
          const blob = new Blob([sanitized], { type: 'image/svg+xml;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);

          const img = new Image();
          img.onload = () => {
            // Draw onto a canvas at a fixed resolution for crisp rendering
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(blobUrl);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            resolve(texture);
          };
          img.onerror = (e) => {
            URL.revokeObjectURL(blobUrl);
            reject(e);
          };
          img.src = blobUrl;
        });
      });
  }

  // ---------- Animation loop ----------
  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.startAnimationLoop();
        } else {
          this.stopAnimationLoop();
        }
      });
    });
    this.observer.observe(this.canvasRef.nativeElement);
  }

  private startAnimationLoop() {
    if (this.animationId) return; // already running

    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      // update mixer for avatar animations
      if (this.mixer) this.mixer.update(delta);

      // rotate the ring group slowly around Y axis
      const rpm = this.ringRotationSpeed; // degrees per second
      const radPerSec = (rpm * Math.PI) / 180;
      this.ringGroup.rotation.y += radPerSec * delta;

      // Make each logo face the camera smoothly
      this.ringGroup.traverse((obj) => {
        if ((obj as any).userData && (obj as any).userData.isLogo) {
          const logo = obj as THREE.Mesh;
          // compute world position to look at camera
          const worldPos = new THREE.Vector3();
          logo.getWorldPosition(worldPos);
          logo.lookAt(this.camera.position);
          // Optionally, keep z-axis aligned so plane stays upright:
          logo.rotation.z = 0;
        }
      });

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animate);
    };

    // run loop outside Angular
    this.animationId = requestAnimationFrame(animate);
  }

  private stopAnimationLoop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  // ---------- Resize and dispose ----------
  private onResizeBound = () => this.onResize();

  private onResize() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private disposeAll() {
    if (this.observer) {
      this.observer.disconnect();
    }
    // Dispose scene geometry, materials, textures
    this.scene.traverse((obj: any) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        const mat: any = obj.material;
        if (Array.isArray(mat)) {
          mat.forEach((m: any) => { if (m.map) m.map.dispose(); m.dispose(); });
        } else {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        }
      }
    });
    this.renderer.dispose();
  }
}

