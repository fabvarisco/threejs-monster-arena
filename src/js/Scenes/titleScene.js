import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


export default class TitleScene {
  constructor() {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this._deltaTime = null;
    this._gameLoop = undefined;
    this._gameElement = undefined;
    this._titleScreenElement = undefined;
    this._boundOnWindowResize = this._onWindowResize.bind(this);
    this._init();
  }

  _init() {
    this._renderer();
    this._scene();
    this._camera();
    this._controls();
    this._light();
    this._createObject();
    this._addWebComponents();
    window.addEventListener("resize", this._boundOnWindowResize);
  }

  _addWebComponents() {
    this._gameElement = document.getElementById("game");
    this._titleScreenElement = document.createElement("title-screen-element");
    this._gameElement.appendChild(this._titleScreenElement);
  }

  _renderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.getElementById("app"),
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _scene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
  }

  _camera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.set(0, 10, 14);
  }

  _controls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 25;
    this.controls.autoRotate = true;
  }

  _light() {
    const hemLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemLight.position.set(0, 200, 0);
    this.scene.add(hemLight);

    const dirLight = new THREE.DirectionalLight(0x002288);
    dirLight.position.set(-1, -1, -1);
    this.scene.add(dirLight);

    this.scene.add(new THREE.AmbientLight(0x222222));
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  _createObject() {}

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _sceneLoop() {
    this._gameLoop = requestAnimationFrame((t) => {
      if (this._deltaTime === null) this._deltaTime = t;
      this._sceneLoop();
      this.controls.update();
      this._render();
      this._deltaTime = t;
    });
  }

  InitScene() {
    this._sceneLoop();
  }

  DestroyScene() {
    cancelAnimationFrame(this._gameLoop);
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this._boundOnWindowResize);

    const titleScreenElement = this._gameElement?.querySelector("title-screen-element");
    if (titleScreenElement) this._gameElement.removeChild(titleScreenElement);

    this.controls.dispose();
    this.renderer.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this._deltaTime = null;
  }
}
