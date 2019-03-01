import 'styles/index.scss';
import { map, distance, hexToRgbTreeJs } from './helpers';

export default class App {
  setup() {
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

  addSpotLight() {
    const obj = { color: '#fff' };
    const light = new THREE.SpotLight(obj.color, 1);

    light.position.set(0, 50, 0);
    light.castShadow = true;

    this.scene.add(light);

    const gui = this.gui.addFolder('Spot Light');
    gui.addColor(obj, 'color').onChange((color) => {
      light.color = hexToRgbTreeJs(color);
    });
  }

  addPointLight(color, position) {
    const pointLight = new THREE.PointLight(color, 1, 1000, 1);
    pointLight.position.set(position.x, position.y, position.z);

    this.scene.add(pointLight);
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

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let col = 0; col < this.grid.cols; col++) {
        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const mesh = this.getMesh(geometry, material);
        mesh.position.y = 2.5;

        const pivot = new THREE.Object3D();

        pivot.add(mesh);
        pivot.scale.set(1, 1, 1);
        pivot.position.set(col + (col * this.gutter.size), 0, row + (row * this.gutter.size));

        this.meshes[row][col] = pivot;

        this.groupMesh.add(pivot);
      }
    }

    const centerX = ((this.grid.cols) + ((this.grid.cols) * this.gutter.size)) * .46;
    const centerZ = ((this.grid.rows) + ((this.grid.rows) * this.gutter.size)) * .46;

    this.groupMesh.position.set(-centerX, 0, -centerZ);

    this.scene.add(this.groupMesh);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  addCameraControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(300, 300);
    const material = new THREE.ShadowMaterial({ opacity: .3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.rotateX(- Math.PI / 2);
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  init() {
    this.setup();

    this.createScene();

    this.createCamera();

    this.addAmbientLight();

    this.addSpotLight();

    this.addSphere();

    this.createGrid();

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

    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {

        const mesh = this.meshes[row][col];
        const mouseDistance = distance(x, z, mesh.position.x + this.groupMesh.position.x, mesh.position.z + this.groupMesh.position.z);
        const y = map(mouseDistance, 4.5, 1, 0, -1);
        const scale = y > 1 ? 1 : y < 0.001 ? 0.001 : y;

        TweenMax.to(mesh.scale, .3, {
          ease: Expo.easeOut,
          y: scale,
        });
      }
    }
  }

  animate() {
    this.controls.update();

    this.draw();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
