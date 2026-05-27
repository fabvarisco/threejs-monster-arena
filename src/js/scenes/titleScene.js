import * as THREE from "three";
import { loaderGLTF } from "../../utils/loader";
import { vpWidth, vpHeight, vpAspect } from "../../utils/viewport";

export default class TitleScene {
  constructor() {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this._pokeball = null;
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
      alpha: true,
      canvas: document.getElementById("app"),
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(vpWidth(), vpHeight());
    this.renderer.setClearColor(0x000000, 0);
  }

  _scene() {
    this.scene = new THREE.Scene();
    document.body.style.backgroundImage = "url('/assets/body_bg.png')";
  }

  _camera() {
    this.camera = new THREE.PerspectiveCamera(60, vpAspect(), 1, 1000);
    this.camera.position.set(0, 1, 5);
  }

  _light() {
    const hemLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemLight.position.set(0, 200, 0);
    this.scene.add(hemLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 20);
    pointLight.position.set(3, 3, 3);
    this.scene.add(pointLight);

    this.scene.add(new THREE.AmbientLight(0x888888));
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  async _createObject() {
    const model = await loaderGLTF("/assets/low-poly-poke-ball/source/model.gltf");
    model.scale.setScalar(2);
    this._pokeball = model;
    this.scene.add(model);
  }

  _onWindowResize() {
    this.camera.aspect = vpAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(vpWidth(), vpHeight());
  }

  _sceneLoop() {
    this._gameLoop = requestAnimationFrame(() => {
      this._sceneLoop();
      if (this._pokeball) this._pokeball.rotation.y += 0.01;
      this._render();
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

    document.body.style.backgroundImage = "";
    this.renderer.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this._pokeball = null;
    this._deltaTime = null;
  }
}
