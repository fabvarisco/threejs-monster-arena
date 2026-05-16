class MonsterHp extends HTMLElement {
  static get observedAttributes() {
    return ["name", "hp", "max-hp"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 220px;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
          z-index: 10;
          font-family: Nunito, sans-serif;
        }
        :host([player]) {
          bottom: 12%;
          left: 3%;
        }
        :host(:not([player])) {
          top: 3%;
          right: 3%;
        }
        .name {
          font-weight: 600;
          text-transform: capitalize;
          font-size: 14px;
        }
        .hp-bar-bg {
          width: 100%;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }
        .hp-bar-fill {
          height: 100%;
          border-radius: 3px;
          background: #4caf50;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .hp-bar-fill.medium { background: #ff9800; }
        .hp-bar-fill.low    { background: #f44336; }
        .hp-text {
          font-size: 12px;
          color: #555;
          text-align: right;
        }
      </style>
      <span class="name"></span>
      <div class="hp-bar-bg"><div class="hp-bar-fill"></div></div>
      <span class="hp-text"></span>
    `;
  }

  attributeChangedCallback() {
    this._update();
  }

  _update() {
    const name = this.getAttribute("name") ?? "";
    const hp = Number(this.getAttribute("hp") ?? 0);
    const maxHp = Number(this.getAttribute("max-hp") ?? 1);

    this.shadowRoot.querySelector(".name").textContent = name;
    this.shadowRoot.querySelector(".hp-text").textContent = `${hp}/${maxHp}`;

    const pct = Math.max(0, (hp / maxHp) * 100);
    const fill = this.shadowRoot.querySelector(".hp-bar-fill");
    fill.style.width = `${pct}%`;
    fill.className = "hp-bar-fill" + (pct <= 25 ? " low" : pct <= 50 ? " medium" : "");
  }
}

customElements.define("monster-hp-element", MonsterHp);
