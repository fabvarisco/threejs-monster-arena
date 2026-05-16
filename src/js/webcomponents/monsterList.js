class MonsterList extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
      .select-monster-container {
        display: flex;
        background: black;
        width: 50%;
        height: 50%;
      }
      .select-monster-card-container {
        position: fixed;
        top: 25%;
        display: flex;
        gap: 8px;
        flex-direction: column;
        margin: 8px;
      }

      .selected-monster {
        color: white;
      }

      .btn {
        width: 180px;
        min-height: 72px;
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        font-weight: 600;
        background: black;
        color: white;
        font-size: 18px;
        font-family: Nunito;
        border: white 6px solid;
        cursor: pointer;
      }
      .btn:hover {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }

      .monster-thumb {
        width: 48px;
        height: 48px;
        image-rendering: pixelated;
        object-fit: contain;
        flex-shrink: 0;
      }

      .btn.select-monster {
        position: absolute;
        right: 0;
        bottom: 10px;
        width: 200px;
        justify-content: center;
      }
      </style>
      <div class="select-monster-container">
        <div class="select-monster-card-container"></div>
        <div class="selected-monster"></div>
      </div>
      <button id="start-battle" class="btn select-monster">Select Monster</button>
    `;

    this.monsters = [];
    this.selectedMonster = {};
    this.selectMonsterContainerCard = this.shadowRoot.querySelector(
      ".select-monster-card-container"
    );

    const startBattleScene = this.shadowRoot.getElementById("start-battle");
    startBattleScene.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("startBattle", { bubbles: true, detail: { selectedMonster: this.selectedMonster } }));
    });
  }

  static get observedAttributes() {
    return ["monsters"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "monsters") {
      this.monsters = JSON.parse(newValue);
      this.renderMonsters();
    }
  }

  connectedCallback() {
    this.renderMonsters();
  }

  renderMonsters() {
    this.selectMonsterContainerCard.innerHTML = "";
    this.monsters.forEach((monster, index) => {
      const listItem = document.createElement("div");
      listItem.className = "btn";
      listItem.dataset.index = index;
      listItem.innerHTML = `
        <img src="${monster.sprites?.front ?? ''}" alt="${monster.name}" class="monster-thumb" />
        <span>${monster.name}</span>
      `;
      listItem.addEventListener("click", () => {
        this.selectedMonster = monster;
        this.dispatchEvent(
          new CustomEvent("changeMonster", {
            bubbles: true,
            detail: { monster: this.selectedMonster },
          })
        );
      });
      this.selectMonsterContainerCard.appendChild(listItem);
    });
  }
}

customElements.define("monster-list-element", MonsterList);
