import * as THREE from "three";

import { POKEMON_ROSTER } from "../../utils/monsters";
import { fetchPokemon, mapPokemonToMonster } from "../../api/fetchData";
import { vpWidth, vpHeight, vpAspect } from "../../utils/viewport";

export default class CharacterSelectionScene {
  constructor() {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this._lastFrameTime = null;
    this._gameLoop = undefined;
    this._gameElement = undefined;
    this._loadingElement = undefined;
    this._previewSprite = undefined;
    this._infoElement = undefined;
    this._boundOnWindowResize = this._onWindowResize.bind(this);
    this._fadeDuration = 0.25;
    this._fadeState = "idle"; // "fadeOut" | "loading" | "fadeIn" | "idle"
    this._fadeProgress = 0;
    this._pendingMonster = null;
    this._init();
  }

  async _init() {
    this._addWebComponents();
    this._renderer();
    this._scene();
    this._camera();
    this._light();
    this._createObject();

    const results = await Promise.all(POKEMON_ROSTER.map(name => fetchPokemon(name)));
    const monsters = results.map(mapPokemonToMonster);

    this._gameElement.removeChild(this._loadingElement);

    const list = document.createElement("monster-list-element");
    this._gameElement.appendChild(list);
    list.setAttribute("monsters", JSON.stringify(monsters));

    this._infoElement = document.createElement("monster-info-element");
    this._gameElement.appendChild(this._infoElement);
    
    list.addEventListener("changeMonster", (e) => {
      this._loadSelectedMonster(e.detail.monster);
      this._infoElement.setAttribute("monster", JSON.stringify(e.detail.monster));
    });

    if (monsters.length > 0) {
      this._loadSelectedMonster(monsters[0]);
      this._infoElement.setAttribute("monster", JSON.stringify(monsters[0]));
    }

    window.addEventListener("resize", this._boundOnWindowResize);
  }

  _addWebComponents() {
    this._gameElement = document.getElementById("game");
    this._loadingElement = document.createElement("loading-element");
    this._gameElement.appendChild(this._loadingElement);
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
    this.camera = new THREE.PerspectiveCamera(
      60,
      vpAspect(),
      1,
      1000
    );
    this.camera.position.set(0, 1.5, 4);
    this.camera.lookAt(0, 1.5, 0);
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

  _loadSelectedMonster(monster) {
    this._pendingMonster = monster;
    if (this._previewSprite && this._fadeState !== "fadeOut") {
      this._fadeState = "fadeOut";
      this._fadeProgress = 0;
    } else if (!this._previewSprite && this._fadeState === "idle") {
      this._startLoadingMonster(monster);
    }
  }

  async _startLoadingMonster(monster) {
    this._fadeState = "loading";

    if (this._previewSprite) {
      this.scene.remove(this._previewSprite);
      this._previewSprite.material.map?.dispose();
      this._previewSprite.material.dispose();
      this._previewSprite = undefined;
    }

    const texture = await new THREE.TextureLoader().loadAsync(monster.sprites.front);
    texture.magFilter = THREE.NearestFilter;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 });
    this._previewSprite = new THREE.Sprite(material);
    this._previewSprite.position.set(0, 1.5, 0);
    this._previewSprite.scale.setScalar(3);
    this.scene.add(this._previewSprite);

    this._fadeState = "fadeIn";
    this._fadeProgress = 0;
  }

  _onWindowResize() {
    this.camera.aspect = vpAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(vpWidth(), vpHeight());
  }

  _updateFade(timeElapsed) {
    if (this._fadeState === "fadeOut") {
      this._fadeProgress += timeElapsed / this._fadeDuration;
      if (this._fadeProgress >= 1) {
        this._startLoadingMonster(this._pendingMonster);
      } else if (this._previewSprite) {
        this._previewSprite.material.opacity = 1 - this._fadeProgress;
      }
    } else if (this._fadeState === "fadeIn") {
      this._fadeProgress += timeElapsed / this._fadeDuration;
      if (this._fadeProgress >= 1) {
        this._previewSprite.material.opacity = 1;
        this._fadeState = "idle";
      } else if (this._previewSprite) {
        this._previewSprite.material.opacity = this._fadeProgress;
      }
    }
  }

  _sceneLoop() {
    this._gameLoop = requestAnimationFrame((t) => {
      const timeElapsed = this._lastFrameTime === null ? 0 : (t - this._lastFrameTime) / 1000;
      this._lastFrameTime = t;
      this._updateFade(timeElapsed);
      this._render();
      this._sceneLoop();
    });
  }

  InitScene() {
    this._sceneLoop();
  }

  DestroyScene() {
    cancelAnimationFrame(this._gameLoop);
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this._boundOnWindowResize);

    this._gameElement?.querySelector("monster-list-element")?.remove();
    this._gameElement?.querySelector("monster-info-element")?.remove();

    if (this._previewSprite) {
      this.scene.remove(this._previewSprite);
      this._previewSprite.material.map?.dispose();
      this._previewSprite.material.dispose();
    }

    document.body.style.backgroundImage = "";
    this.renderer.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this._lastFrameTime = null;
  }
}
