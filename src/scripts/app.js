import 'styles/index.css';
import { map, distance, hexToRgbTreeJs } from './helpers';

export default class App {
  setup() {
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS; // milliseconds per frame
    this.lastFrameTime = 0;
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.querySelector('.stats').appendChild(this.stats.domElement);
    
    this.gui = new dat.GUI();
    this.raycaster = new THREE.Raycaster();
    this.pendulum = {
      length: 18,
      angle: 90,
      angleVelocity: 0,
      angleAcceleration: 0,
      origin: {
        x: 0,
        y: 10,
      },
      current: {
        x: 0,
        y: 0,
      }
    };

    this.backgroundColor = '#0dea8d';
    this.gutter = { size: .1 };
    this.meshes = [];
    this.grid = { cols: 28, rows: 12 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();

    const gui = this.gui.addFolder('Background');

    gui.addColor(this, 'backgroundColor').onChange((color) => {
      document.body.style.backgroundColor = color;
    });

    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height);
    this.camera.position.set(-28.15292047581049, 38.68633769613105, 30.980321888960155);

    this.scene.add(this.camera);
  }

  addAmbientLight() {
    const obj = { color: '#fff' };
    const light = new THREE.AmbientLight(obj.color, 1);

    this.scene.add(light);

    const gui = this.gui.addFolder('Ambient Light');
    gui.addColor(obj, 'color').onChange((color) => {
      light.color = hexToRgbTreeJs(color);
    });
  }

  addSphere() {
    const meshParams = {
      color: '#f90c53',
      metalness: .41,
      emissive: '#000000',
      roughness: 0,
    };

    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshStandardMaterial(meshParams);

    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(0, 0, 0);

    const gui = this.gui.addFolder('Sphere Material');

    gui.addColor(meshParams, 'color').onChange((color) => {
      material.color = hexToRgbTreeJs(color);
    });
    gui.add(meshParams, 'metalness', 0.1, 1).onChange((val) => {
      material.metalness = val;
    });
    gui.add(meshParams, 'roughness', 0.1, 1).onChange((val) => {
      material.roughness = val;
    });

    this.scene.add(this.sphere);
  }

  createGrid() {
    this.groupMesh = new THREE.Object3D();

    const meshParams = {
      color: '#fff',
      metalness: .3,
      emissive: '#000000',
      roughness: 1,
    };

    const material = new THREE.MeshPhysicalMaterial(meshParams);
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    geometry.translate( 0, 3, 0 );

    this.mesh = this.getMesh(geometry, material, this.grid.rows * this.grid.cols);
    this.scene.add(this.mesh);

    let ii = 0;
    this.centerX = ((this.grid.cols) + ((this.grid.cols) * this.gutter.size)) * .46;
    this.centerZ = ((this.grid.rows) + ((this.grid.rows) * this.gutter.size)) * .46;

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let col = 0; col < this.grid.cols; col++) {
        const pivot = new THREE.Object3D();
        pivot.scale.set(1, 1, 1);
        pivot.position.set(col + (col * this.gutter.size) - this.centerX, 0, row + (row * this.gutter.size) - this.centerZ);

        this.meshes[row][col] = pivot;

        pivot.updateMatrix();

        this.mesh.setMatrixAt(ii++, pivot.matrix);
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  getMesh(geometry, material, count) {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  addCameraControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  addDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.position.set(0, 1, 0);

    this.directionalLight.shadow.camera.far = 1000;
    this.directionalLight.shadow.camera.near = -200;

    this.directionalLight.shadow.camera.left = -40;
    this.directionalLight.shadow.camera.right = 40;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    this.directionalLight.shadow.camera.zoom = 1;
    this.directionalLight.shadow.camera.needsUpdate = true;

    const targetObject = new THREE.Object3D();
    targetObject.position.set(-50, -82, 40);
    this.directionalLight.target = targetObject;

    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(300, 300);
    const material = new THREE.ShadowMaterial({ opacity: .2 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = -1;
    this.floor.rotateX(- Math.PI / 2);
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  init() {
    this.setup();

    this.createScene();

    this.createCamera();

    this.addAmbientLight();

    this.addSphere();

    this.createGrid();

    this.addDirectionalLight();

    this.addCameraControls();

    this.addFloor();

    this.animate();
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  draw() {
    this.pendulum.current.x = this.pendulum.origin.x + this.pendulum.length * Math.sin(this.pendulum.angle);
    this.pendulum.current.y = this.pendulum.origin.y + this.pendulum.length * Math.cos(this.pendulum.angle);
    this.pendulum.angleAcceleration = 2 * .001 * Math.sin(this.pendulum.angle);
    this.pendulum.angleVelocity += this.pendulum.angleAcceleration;
    this.pendulum.angle += this.pendulum.angleVelocity;

    this.sphere.position.set(this.pendulum.current.x, this.pendulum.current.y + 10.5, 0);

    const { x, z } = this.sphere.position;

    let ii = 0;

    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {

        const pivot = this.meshes[row][col];
        const mouseDistance = distance(x, z, pivot.position.x, pivot.position.z);
        const y = map(mouseDistance, 4.5, 1, 0, -1.5);
        const scale = y > 1 ? 1 : y < 0.01 ? 0.01 : y;

        pivot.updateMatrix();

        this.mesh.setMatrixAt(ii++, pivot.matrix);

        TweenMax.to(pivot.scale, .3, {
          ease: Expo.easeOut,
          y: scale,
        });
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  animate(currentTime = 0) {
    this.stats.begin();
    this.controls.update();
    requestAnimationFrame(this.animate.bind(this));

    const timeElapsed = currentTime - this.lastFrameTime;

    // Only run animation logic if enough time has passed
    if (timeElapsed >= this.frameInterval) {
      // Update lastFrameTime, accounting for the actual time passed
      // This prevents timing drift
      this.lastFrameTime = currentTime - (timeElapsed % this.frameInterval);

      this.draw();
    }

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}
