import * as THREE from "three";
import { EventDispatcher } from "three";

import { loaderOBJ } from "../../utils/loader";
import { POKEMON_ROSTER, Enemy, player } from "../../utils/monsters";
import { EnemyTurn, PlayerTurn } from "../../utils/utils";
import Monster from "../monster";
import { fetchPokemon, mapPokemonToMonster } from "../../api/fetchData";

export default class BattleScene {
  constructor(_selectedMonsterName) {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.objects = [];
    this._deltaTime = null;
    this.Events = {};
    this.Turn = true;
    this._gameElement = undefined;
    this._loadingElement = undefined;
    this._gameLoop = undefined;
    this._onEnemyDefeated = this._handleEnemyDefeated.bind(this);
    this._onPlayerFainted = this._handlePlayerFainted.bind(this);
    this._onSwitchMonster = this._handleSwitchMonster.bind(this);
    this._playerInfo = null;
    this._currentEnemyName = null;
    this._activePartyIdx = 0;

    this._selectedMonsterName = _selectedMonsterName;

    this._init();
  }

  _init() {
    this._document();
    this._events();
    this._addListener();
    this._renderer();
    this._scene();
    this._camera();
    this._light();
    this._createObject();
    window.addEventListener("resize", this._onWindowResize.bind(this));
  }

  _document() {
    this._gameElement = document.getElementById("game");
    this._loadingElement = document.createElement("loading-element");
    this._gameElement.appendChild(this._loadingElement);
  }

  _events() {
    this.Events["changeTurn"] = new EventDispatcher();
    this.Events["monsterPlayerHpChanged"] = new EventDispatcher();
    this.Events["monsterEnemyHpChanged"] = new EventDispatcher();
  }

  _addListener() {
    this.Events["changeTurn"].addEventListener("changeTurn", () => {
      this.Turn = !this.Turn;
      if (this.Turn) PlayerTurn(); else EnemyTurn();
    });
    document.addEventListener("enemyDefeated", this._onEnemyDefeated);
    document.addEventListener("playerFainted", this._onPlayerFainted);
    document.addEventListener("switchMonster", this._onSwitchMonster);
  }

  async _handleEnemyDefeated() {
    const deadEnemy = this.objects.find(m => !m._isPlayer);
    deadEnemy?.Destroy();
    this.objects = this.objects.filter(m => m._isPlayer);

    // Orphan the dead enemy's listener by replacing the dispatcher
    this.Events["monsterEnemyHpChanged"] = new EventDispatcher();

    EnemyTurn();

    const rewardScreen = document.createElement("item-reward-screen");
    rewardScreen.setAttribute("enemy", JSON.stringify(Enemy.selectedMonster));
    this._gameElement.appendChild(rewardScreen);
    const rewardEvent = await new Promise(resolve => document.addEventListener("rewardSelected", resolve, { once: true }));

    if (rewardEvent.detail?.type === "pokemon") {
      player.monsters.push(rewardEvent.detail.pokemon);
      const partyHud = this._gameElement?.querySelector("party-hud");
      if (partyHud) partyHud.setAttribute("party", JSON.stringify(player.monsters));
    }

    this._gameElement.appendChild(this._loadingElement);

    const available = POKEMON_ROSTER.filter(
      n => n !== this._playerInfo.name && n !== this._currentEnemyName
    );
    const enemyName = available[Math.floor(Math.random() * available.length)];
    const enemyInfo = mapPokemonToMonster(await fetchPokemon(enemyName));

    this._currentEnemyName = enemyInfo.name;
    Enemy.selectedMonster = enemyInfo;

    this._gameElement.removeChild(this._loadingElement);

    const playerMonster = this.objects.find(m => m._isPlayer);
    const newEnemy = new Monster(
      this.scene, { x: 0, y: 0.5, z: -6 }, 2.5, this.Events, enemyInfo, false, this.camera
    );
    newEnemy.setOpponent(player.monsters[this._activePartyIdx]);
    playerMonster?.setOpponent(enemyInfo);
    this.objects.push(newEnemy);

    PlayerTurn();
  }

  _handleGameOver() {
    const battleMenu = this._gameElement?.querySelector("battle-menu");
    if (battleMenu) battleMenu.style.display = "none";
    const gameOver = document.createElement("game-over");
    this._gameElement.appendChild(gameOver);
  }

  _handlePlayerFainted() {
    player.monsters[this._activePartyIdx].currentHp = 0;

    const nextIdx = player.monsters.findIndex(
      (m, i) => i !== this._activePartyIdx && (m.currentHp ?? m.life) > 0
    );

    if (nextIdx === -1) {
      this._handleGameOver();
      return;
    }

    this._switchActivePokemon(nextIdx, { free: true });
  }

  _handleSwitchMonster(e) {
    const { to } = e.detail;
    if (to === this._activePartyIdx) return;
    const target = player.monsters[to];
    if (!target || (target.currentHp ?? target.life) <= 0) return;
    this._switchActivePokemon(to, { free: false });
  }

  async _switchActivePokemon(toIdx, { free = false } = {}) {
    const activeMonster = this.objects.find(m => m._isPlayer);
    const enemyMonster = this.objects.find(m => !m._isPlayer);

    if (activeMonster) {
      player.monsters[this._activePartyIdx].currentHp = activeMonster._hp;
      activeMonster.Destroy();
    }
    this.objects = this.objects.filter(m => !m._isPlayer);

    this.Events["monsterPlayerHpChanged"] = new EventDispatcher();

    this._activePartyIdx = toIdx;
    const newInfo = player.monsters[toIdx];

    const newPlayer = new Monster(
      this.scene, { x: 0, y: 0.5, z: 6 }, 2.5, this.Events, newInfo, true, this.camera
    );
    newPlayer.setOpponent(Enemy.selectedMonster);
    enemyMonster?.setOpponent(newInfo);
    this.objects.push(newPlayer);

    const partyHud = this._gameElement?.querySelector("party-hud");
    if (partyHud) {
      partyHud.setAttribute("active", String(toIdx));
      partyHud.setAttribute("party", JSON.stringify(player.monsters));
    }

    if (!free) {
      EnemyTurn();
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (enemyMonster) {
        enemyMonster._playAttackAnimation(0);
        const damage = enemyMonster._calculateDamage(enemyMonster._information, newInfo);
        this.Events["monsterPlayerHpChanged"].dispatchEvent({ type: "monsterPlayerHpChanged", damage });
      }
      PlayerTurn();
    } else {
      PlayerTurn();
    }
  }

  _renderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.getElementById("app"),
    });
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
    this.camera.position.set(0.73,0.95, 8);
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

  async _createObject() {
    const stadium = await loaderOBJ(
      "assets/stadium/Super Training Stage.obj",
      "assets/stadium/Super Training Stage.mtl"
    );
    this.scene.add(stadium);

    const playerInfo = this._selectedMonsterName?.sprites
      ? this._selectedMonsterName
      : mapPokemonToMonster(await fetchPokemon(this._selectedMonsterName?.name ?? "charmander"));

    const available = POKEMON_ROSTER.filter(n => n !== playerInfo.name);
    const enemyName = available[Math.floor(Math.random() * available.length)];
    const enemyInfo = mapPokemonToMonster(await fetchPokemon(enemyName));

    this._playerInfo = playerInfo;
    this._currentEnemyName = enemyInfo.name;
    player.selectedMonster = playerInfo;
    player.monsters = [playerInfo];
    Enemy.selectedMonster = enemyInfo;

    this._gameElement.removeChild(this._loadingElement);
    const battleMenu = document.createElement("battle-menu");
    this._gameElement.appendChild(battleMenu);

    const partyHud = document.createElement("party-hud");
    partyHud.setAttribute("party", JSON.stringify(player.monsters));
    partyHud.setAttribute("active", "0");
    this._gameElement.appendChild(partyHud);

    // player bottom-right of arena, enemy top-left — mirrors original FBX positions
    const playerMonster = new Monster(this.scene, { x: 0, y: 0.5, z: 6 }, 2.5, this.Events, playerInfo, true, this.camera);
    const enemyMonster = new Monster(this.scene, { x: 0, y: 0.5, z: -6 }, 2.5, this.Events, enemyInfo, false, this.camera);
    playerMonster.setOpponent(enemyInfo);
    enemyMonster.setOpponent(playerInfo);
    this.objects.push(playerMonster, enemyMonster);
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _sceneLoop(t) {
    if (this._deltaTime === null) this._deltaTime = t;
    this._gameLoop = requestAnimationFrame((t) => this._sceneLoop(t));
    this.objects.forEach(el => el.Update());
    this._render();
    this._deltaTime = t;
  }

  SceneLoop() {
    this._gameLoop = requestAnimationFrame((t) => this._sceneLoop(t));
  }

  InitScene() {
    this.SceneLoop();
  }

  DestroyScene() {
    cancelAnimationFrame(this._gameLoop);
    this.renderer.setAnimationLoop(null);
    document.removeEventListener("enemyDefeated", this._onEnemyDefeated);
    document.removeEventListener("playerFainted", this._onPlayerFainted);
    document.removeEventListener("switchMonster", this._onSwitchMonster);
    window.removeEventListener("resize", this._onWindowResize.bind(this));
    const battleMenu = this._gameElement?.querySelector("battle-menu");
    if (battleMenu) battleMenu.remove();
    const gameOver = this._gameElement?.querySelector("game-over");
    if (gameOver) gameOver.remove();
    const rewardScreen = this._gameElement?.querySelector("item-reward-screen");
    if (rewardScreen) rewardScreen.remove();
    const partyHud = this._gameElement?.querySelector("party-hud");
    if (partyHud) partyHud.remove();
    document.querySelectorAll("monster-hp-element").forEach(el => el.remove());
    this.renderer.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this._deltaTime = null;
  }
}
