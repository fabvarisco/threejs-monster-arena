import * as THREE from "three";
import { EnemyTurn, PlayerTurn } from "../utils/utils";
import { getTypeMultiplier } from "../utils/typeChart";
import itemsList from "../utils/items";
import { player } from "../utils/monsters";

const vertexShader = `
  uniform float uShake;
  uniform float uTime;
  uniform float uPulse;
  uniform float uOffsetX;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += sin(uTime * 40.0) * 0.15 * uShake;
    pos *= 1.0 + sin(uPulse * 3.14159) * 0.25;
    pos.x += uOffsetX;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uFlash;
  uniform float uHeal;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    if (texColor.a < 0.1) discard;
    vec3 col = mix(texColor.rgb, vec3(1.0, 0.2, 0.2), uFlash);
    col = mix(col, vec3(0.2, 1.0, 0.2), uHeal);
    gl_FragColor = vec4(col, texColor.a * uOpacity);
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
    this._healFlashStartTime = null;
    this._healFlashDuration = 500;
    this._pulseStartTime = null;
    this._pulseDuration = 400;
    this._exitAnimStartTime = null;
    this._exitAnimDuration = 350;
    this._enterAnimStartTime = null;
    this._enterAnimDuration = 350;
    this._pendingEnterAnim = false;

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
        uHeal: { value: 0.0 },
        uShake: { value: 0.0 },
        uTime: { value: 0.0 },
        uPulse: { value: 0.0 },
        uOpacity: { value: 1.0 },
        uOffsetX: { value: 0.0 },
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

    if (this._pendingEnterAnim) {
      this._pendingEnterAnim = false;
      this._playEnterAnimation();
    }
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

  _playHealAnimation() {
    if (!this._material) return;
    this._material.uniforms.uHeal.value = 1.0;
    this._healFlashStartTime = performance.now();
  }

  _playDeathAnimation() {}

  _playExitAnimation() {
    this._exitAnimStartTime = performance.now();
    return new Promise(resolve => setTimeout(resolve, this._exitAnimDuration));
  }

  _playEnterAnimation() {
    if (!this._material) {
      this._pendingEnterAnim = true;
      return;
    }
    this._material.uniforms.uOpacity.value = 0;
    this._material.uniforms.uOffsetX.value = 3;
    this._enterAnimStartTime = performance.now();
  }

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
    if (this._onPlayerUsedItem) {
      document.removeEventListener("playerUsedItem", this._onPlayerUsedItem);
      this._onPlayerUsedItem = null;
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
    const base = Math.max(1, atk - Math.floor(def / 2));
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
        this._playHealAnimation();
        document.dispatchEvent(new CustomEvent("inventoryChanged"));
        EnemyTurn();
        document.dispatchEvent(new CustomEvent("playerUsedItem"));
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
      this._onPlayerUsedItem = () => {
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
        }, 1200);
      };
      document.addEventListener("playerUsedItem", this._onPlayerUsedItem);

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
    this._information.currentHp = this._hp;
    this._updateHtmlContainer();
    if (this._isPlayer) document.dispatchEvent(new CustomEvent("playerHpChanged"));
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
    if (this._healFlashStartTime !== null && this._material) {
      const t = Math.max(0, 1 - (performance.now() - this._healFlashStartTime) / this._healFlashDuration);
      this._material.uniforms.uHeal.value = t;
      if (t === 0) this._healFlashStartTime = null;
    }
    if (this._pulseStartTime !== null && this._material) {
      const elapsed = performance.now() - this._pulseStartTime;
      const t = Math.max(0, 1 - elapsed / this._pulseDuration);
      this._material.uniforms.uPulse.value = t;
      if (t === 0) this._pulseStartTime = null;
    }
    if (this._exitAnimStartTime !== null && this._material) {
      const t = Math.max(0, 1 - (performance.now() - this._exitAnimStartTime) / this._exitAnimDuration);
      this._material.uniforms.uOpacity.value = t;
      this._material.uniforms.uOffsetX.value = -3 * (1 - t);
      if (t === 0) this._exitAnimStartTime = null;
    }
    if (this._enterAnimStartTime !== null && this._material) {
      const t = Math.min(1, (performance.now() - this._enterAnimStartTime) / this._enterAnimDuration);
      this._material.uniforms.uOpacity.value = t;
      this._material.uniforms.uOffsetX.value = 3 * (1 - t);
      if (t === 1) this._enterAnimStartTime = null;
    }
  }
}
