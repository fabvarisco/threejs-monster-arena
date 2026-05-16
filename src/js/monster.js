import * as THREE from "three";
import { EnemyTurn, PlayerTurn } from "../utils/utils";

export default class Monster {
  constructor(scene, position, scale, events, information, isPlayer) {
    this._maxHp = information.life;
    this._hp = this._maxHp;
    this._scene = scene;
    this._position = position;
    this._scale = scale;
    this._events = events;
    this._information = information;
    this._isPlayer = isPlayer;
    this._opponentInfo = null;
    this._sprite = null;
    this._htmlContainer = null;

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

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this._sprite = new THREE.Sprite(material);
    this._sprite.position.set(this._position.x, this._position.y, this._position.z);
    this._sprite.scale.setScalar(this._scale);

    this._scene.add(this._sprite);
  }

  setOpponent(info) {
    this._opponentInfo = info;
  }

  _playIdleAnimation() {}

  // attackIndex: 0 = first attack, 1 = second attack
  _playAttackAnimation(_attackIndex) {}

  _playDamageAnimation() {
    if (!this._sprite) return;
    
    this._sprite.material.color.set(0xff4444);
    setTimeout(() => {
      if (this._sprite) this._sprite.material.color.set(0xffffff);
    }, 300);
  }

  _playDeathAnimation() {}

  // ---

  Destroy() {
    if (this._sprite) {
      this._scene.remove(this._sprite);
      this._sprite.material.map?.dispose();
      this._sprite.material.dispose();
      this._sprite = null;
    }
    if (this._htmlContainer) {
      this._htmlContainer.remove();
      this._htmlContainer = null;
    }
  }

  _calculateDamage(attackerInfo, defenderInfo) {
    const base = Math.floor((attackerInfo.damage / Math.max(1, defenderInfo.defense)) * 20);
    const variance = 0.85 + Math.random() * 0.15;
    return Math.max(1, Math.floor(base * variance));
  }

  _addListeners() {
    if (this._isPlayer) {
      const onAttack = (attackIndex) => {
        EnemyTurn();
        this._playAttackAnimation(attackIndex);
        const damage = this._calculateDamage(
          this._information,
          this._opponentInfo ?? { defense: 1 }
        );
        this._events["monsterEnemyHpChanged"].dispatchEvent({
          type: "monsterEnemyHpChanged",
          damage,
        });
      };

      document.getElementById("attack1").addEventListener("click", () => onAttack(0));
      document.getElementById("attack2").addEventListener("click", () => onAttack(1));
      document.getElementById("item1").addEventListener("click", () => EnemyTurn());
      document.getElementById("item2").addEventListener("click", () => EnemyTurn());

      this._events["monsterPlayerHpChanged"].addEventListener("monsterPlayerHpChanged", (e) => {
        this._playDamageAnimation();
        this._damage(e.damage);
        if (this._hp <= 0) {
          this._playDeathAnimation();
          document.dispatchEvent(new CustomEvent("gameOver"));
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
            this._opponentInfo ?? { defense: 1 }
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
    this._htmlContainer = document.createElement("div");
    this._htmlContainer.className = this._isPlayer ? "playerContainer" : "enemyContainer";
    this._htmlContainer.innerHTML = `
      <span class="monster-name">${this._information.name}</span>
      <div>
        <span class="hp-text">${this._hp}/${this._maxHp}</span>
      </div>`;
    document.body.appendChild(this._htmlContainer);
  }

  _updateHtmlContainer() {
    if (!this._htmlContainer) return;
    const hpText = this._htmlContainer.querySelector(".hp-text");
    if (hpText) hpText.textContent = `${this._hp}/${this._maxHp}`;
  }

  Update() {}
}
