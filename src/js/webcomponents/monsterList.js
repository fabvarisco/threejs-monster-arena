class MonsterList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        .wrapper {
          position: fixed;
          top: calc(64px + 16px);
          left: 16px;
          width: 460px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
        }

        .panel-title {
          color: rgba(255,255,255,0.5);
          font-family: Nunito;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0 0 2px 4px;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.06);
          color: white;
          font-family: Nunito;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: rgba(255,255,255,0.5); }
        .search-input::placeholder { color: rgba(255,255,255,0.3); }

        .select-monster-card-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          overflow-y: auto;
          max-height: calc(100vh - 260px);
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.2) transparent;
          padding-right: 2px;
        }

        .btn {
          width: 100%;
          min-height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          font-weight: 600;
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 15px;
          font-family: Nunito;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          box-sizing: border-box;
          text-transform: capitalize;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
        }
        .btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.4);
          transform: scale(1.02);
        }

        .monster-thumb {
          width: 48px;
          height: 48px;
          image-rendering: pixelated;
          object-fit: contain;
          flex-shrink: 0;
        }
        .thumb-placeholder {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }

        .btn.select-monster {
          margin-top: 4px;
          justify-content: center;
          background: white;
          color: black;
          border-color: white;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.05em;
          min-height: 52px;
          border-radius: 12px;
        }
        .btn.select-monster:hover {
          background: rgba(255,255,255,0.88);
          transform: scale(1.02);
        }
      </style>

      <div class="wrapper">
        <span class="panel-title">Escolha seu Pokémon</span>
        <input id="search" class="search-input" placeholder="🔍 Buscar..." autocomplete="off" />
        <div class="select-monster-card-container"></div>
        <button id="start-battle" class="btn select-monster">Select Monster</button>
      </div>
    `;

    this.monsters = [];
    this.selectedMonster = {};
    this._filter = "";

    this.selectMonsterContainerCard = this.shadowRoot.querySelector(".select-monster-card-container");

    this.shadowRoot.getElementById("search").addEventListener("input", (e) => {
      this._filter = e.target.value.toLowerCase();
      this._renderMonsters();
    });

    this.shadowRoot.getElementById("start-battle").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("startBattle", { bubbles: true, detail: { selectedMonster: this.selectedMonster } }));
    });
  }

  static get observedAttributes() { return ["monsters"]; }

  attributeChangedCallback(name, _old, newValue) {
    if (name === "monsters") {
      this.monsters = JSON.parse(newValue);
      this._renderMonsters();
    }
  }

  connectedCallback() { this._renderMonsters(); }

  updateMonster(full) {
    const idx = this.monsters.findIndex(m => m.name === full.name);
    if (idx !== -1) this.monsters[idx] = full;
    this._renderMonsters();
  }

  updateMonsters(arr) {
    arr.forEach(full => {
      const idx = this.monsters.findIndex(m => m.name === full.name);
      if (idx !== -1) this.monsters[idx] = full;
    });
    this._renderMonsters();
  }

  _renderMonsters() {
    const visible = this._filter
      ? this.monsters.filter(m => m.name.toLowerCase().includes(this._filter))
      : this.monsters;

    this.selectMonsterContainerCard.innerHTML = "";
    visible.forEach((monster) => {
      const listItem = document.createElement("div");
      listItem.className = "btn";
      const thumb = monster.sprites?.front
        ? `<img src="${monster.sprites.front}" alt="${monster.name}" class="monster-thumb" />`
        : `<div class="thumb-placeholder"></div>`;
      listItem.innerHTML = `${thumb}<span>${monster.name}</span>`;
      listItem.addEventListener("click", () => {
        this.selectedMonster = monster;
        this.dispatchEvent(new CustomEvent("changeMonster", {
          bubbles: true,
          detail: { monster },
        }));
      });
      this.selectMonsterContainerCard.appendChild(listItem);
    });
  }
}

customElements.define("monster-list-element", MonsterList);
