import * as THREE from "three";
import { EnemyTurn, PlayerTurn } from "../utils/utils";
import { getTypeMultiplier } from "../utils/typeChart";
import itemsList from "../utils/items";
import { player } from "../utils/monsters";

const vertexShader = `
  uniform float uShake;
  uniform float uTime;
  uniform float uPulse;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += sin(uTime * 40.0) * 0.15 * uShake;
    pos *= 1.0 + sin(uPulse * 3.14159) * 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uFlash;
  varying vec2 vUv;
  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    if (texColor.a < 0.1) discard;
    gl_FragColor = vec4(mix(texColor.rgb, vec3(1.0, 0.2, 0.2), uFlash), texColor.a);
  }
`;

export default class Monster {
  constructor(scene, position, scale, events, information, isPlayer, camera) {
    this._maxHp = information.life;
    this._hp = information.currentHp ?? this._maxHp;
    this._scene = scene;
    this._position = position;
    this._scale = scale;
    this._events = events;
    this._information = information;
    this._isPlayer = isPlayer;
    this._camera = camera;
    this._opponentInfo = null;
    this._mesh = null;
    this._material = null;
    this._htmlContainer = null;
    this._flashStartTime = null;
    this._flashDuration = 500;
    this._pulseStartTime = null;
    this._pulseDuration = 400;

    this._init();
  }

  async _init() {
    await this._loadSprite();
    this._addListeners();
    this._createHtmlContainer();
  }

  async _loadSprite() {
    const url = this._isPlayer
      ? this._information.sprites.back
      : this._information.sprites.front;

    const texture = await new THREE.TextureLoader().loadAsync(url);
    texture.magFilter = THREE.NearestFilter;

    this._material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uFlash: { value: 0.0 },
        uShake: { value: 0.0 },
        uTime: { value: 0.0 },
        uPulse: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    this._mesh = new THREE.Mesh(geometry, this._material);
    this._mesh.position.set(this._position.x, this._position.y, this._position.z);
    this._mesh.scale.setScalar(this._scale);
    this._scene.add(this._mesh);
  }

  setOpponent(info) {
    this._opponentInfo = info;
  }

  _playIdleAnimation() {}

  // attackIndex: 0 = first attack, 1 = second attack
  _playAttackAnimation(_attackIndex) {
    if (!this._material) return;
    this._material.uniforms.uPulse.value = 1.0;
    this._pulseStartTime = performance.now();
  }

  _playDamageAnimation() {
    if (!this._material) return;
    this._material.uniforms.uFlash.value = 1.0;
    this._material.uniforms.uShake.value = 1.0;
    this._flashStartTime = performance.now();
  }

  _playDeathAnimation() {}

  // ---

  Destroy() {
    const btn1 = document.getElementById("attack1");
    const btn2 = document.getElementById("attack2");
    if (btn1 && this._onAttack1) btn1.removeEventListener("click", this._onAttack1);
    if (btn2 && this._onAttack2) btn2.removeEventListener("click", this._onAttack2);
    this._onAttack1 = null;
    this._onAttack2 = null;
    if (this._onUseItem) {
      document.removeEventListener("useItem", this._onUseItem);
      this._onUseItem = null;
    }
    if (this._mesh) {
      this._scene.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._material.uniforms.uTexture.value?.dispose();
      this._material.dispose();
      this._mesh = null;
      this._material = null;
    }
    if (this._htmlContainer) {
      this._htmlContainer.remove();
      this._htmlContainer = null;
    }
  }

  _calculateDamage(attackerInfo, defenderInfo, attackIndex = 0) {
    const atk = attackerInfo.damage;
    const def = Math.max(1, defenderInfo.defense);
    const base = atk - def;
    const attackType = attackerInfo.attacks?.[attackIndex]?.type ?? attackerInfo.type;
    const defenderTypes = defenderInfo.types ?? [defenderInfo.type ?? "normal"];
    const typeMultiplier = getTypeMultiplier(attackType, defenderTypes);
    const variance = 0.85 + Math.random() * 0.15;
    return Math.max(1, Math.floor(base * typeMultiplier * variance));
  }

  _addListeners() {
    if (this._isPlayer) {
      const onAttack = (attackIndex) => {
        EnemyTurn();
        this._playAttackAnimation(attackIndex);
        const damage = this._calculateDamage(
          this._information,
          this._opponentInfo ?? { defense: 1, type: "normal", types: ["normal"] },
          attackIndex
        );
        this._events["monsterEnemyHpChanged"].dispatchEvent({
          type: "monsterEnemyHpChanged",
          damage,
        });
      };

      this._onAttack1 = () => onAttack(0);
      this._onAttack2 = () => onAttack(1);
      document.getElementById("attack1").addEventListener("click", this._onAttack1);
      document.getElementById("attack2").addEventListener("click", this._onAttack2);

      this._onUseItem = (e) => {
        const { itemId } = e.detail;
        const item = itemsList[itemId];
        if (!item || (player.inventory[itemId] ?? 0) <= 0) return;
        player.inventory[itemId]--;
        item.func(this);
        document.dispatchEvent(new CustomEvent("inventoryChanged"));
        EnemyTurn();
      };
      document.addEventListener("useItem", this._onUseItem);

      this._events["monsterPlayerHpChanged"].addEventListener("monsterPlayerHpChanged", (e) => {
        this._playDamageAnimation();
        this._damage(e.damage);
        if (this._hp <= 0) {
          this._playDeathAnimation();
          document.dispatchEvent(new CustomEvent("playerFainted"));
        }
      });
    } else {
      this._events["monsterEnemyHpChanged"].addEventListener("monsterEnemyHpChanged", (e) => {
        this._playDamageAnimation();
        this._damage(e.damage);
        if (this._hp <= 0) {
          this._playDeathAnimation();
          document.dispatchEvent(new CustomEvent("enemyDefeated"));
          return;
        }
        setTimeout(() => {
          this._playAttackAnimation(0);
          const damage = this._calculateDamage(
            this._information,
            this._opponentInfo ?? { defense: 1, type: "normal", types: ["normal"] }
          );
          this._events["monsterPlayerHpChanged"].dispatchEvent({
            type: "monsterPlayerHpChanged",
            damage,
          });
          PlayerTurn();
        }, 1500);
      });
    }
  }

  _damage(value) {
    this._hp = Math.max(0, this._hp - value);
    this._updateHtmlContainer();
  }

  _createHtmlContainer() {
    this._htmlContainer = document.createElement("monster-hp-element");
    this._htmlContainer.setAttribute("name", this._information.name);
    this._htmlContainer.setAttribute("hp", this._hp);
    this._htmlContainer.setAttribute("max-hp", this._maxHp);
    if (this._isPlayer) this._htmlContainer.setAttribute("player", "");
    document.body.appendChild(this._htmlContainer);
  }

  _updateHtmlContainer() {
    if (!this._htmlContainer) return;
    this._htmlContainer.setAttribute("hp", this._hp);
  }

  Update() {
    if (this._mesh && this._camera) {
      this._mesh.quaternion.copy(this._camera.quaternion);
    }
    if (this._flashStartTime !== null && this._material) {
      const elapsed = performance.now() - this._flashStartTime;
      const t = Math.max(0, 1 - elapsed / this._flashDuration);
      this._material.uniforms.uFlash.value = t;
      this._material.uniforms.uShake.value = t;
      this._material.uniforms.uTime.value = performance.now() / 1000;
      if (t === 0) this._flashStartTime = null;
    }
    if (this._pulseStartTime !== null && this._material) {
      const elapsed = performance.now() - this._pulseStartTime;
      const t = Math.max(0, 1 - elapsed / this._pulseDuration);
      this._material.uniforms.uPulse.value = t;
      if (t === 0) this._pulseStartTime = null;
    }
  }
}
