const TYPE_COLORS = {
  fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
  psychic: "#F85888", ice: "#98D8D8", dragon: "#7038F8", dark: "#705848",
  fairy: "#EE99AC", normal: "#A8A878", fighting: "#C03028", flying: "#A890F0",
  poison: "#A040A0", ground: "#E0C068", rock: "#B8A038", bug: "#A8B820",
  ghost: "#705898", steel: "#B8B8D0",
};

const STAT_COLORS = {
  hp: "#FF5959", attack: "#F5AC78", defense: "#FAE078", speed: "#FA92B2",
};

class PokemonInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._monster = null;
  }

  static get observedAttributes() {
    return ["monster"];
  }

  attributeChangedCallback(name, _old, newValue) {
    if (name === "monster") {
      this._monster = JSON.parse(newValue);
      this._render();
    }
  }

  connectedCallback() {
    this._render();
  }

  _statBar(label, value, key) {
    const pct = Math.min(100, Math.round((value / 255) * 100));
    const color = STAT_COLORS[key] ?? "#aaa";
    return `
      <div class="stat-row">
        <span class="stat-label">${label}</span>
        <span class="stat-value">${value}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width:${pct}%; background:${color}"></div>
        </div>
      </div>`;
  }

  _render() {
    const m = this._monster;
    const typeBadges = (m?.types ?? [])
      .map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t] ?? "#777"}">${t}</span>`)
      .join("");
    const attacks = (m?.attacks ?? [])
      .map(a => `<div class="attack-item">${a.name.replace(/-/g, " ")}</div>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          right: 3%;
          top: 50%;
          transform: translateY(-50%);
          font-family: Nunito, sans-serif;
        }
        .card {
          background: black;
          color: white;
          border-radius: 16px;
          padding: 20px 24px;
          width: 220px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 3px solid white;
        }
        .name {
          font-size: 22px;
          font-weight: 700;
          text-transform: capitalize;
          text-align: center;
        }
        .types {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .type-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          color: white;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #aaa;
        }
        .stat-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }
        .stat-label {
          width: 36px;
          color: #aaa;
          font-size: 11px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .stat-value {
          width: 28px;
          text-align: right;
          font-weight: 700;
          flex-shrink: 0;
        }
        .stat-bar-bg {
          flex: 1;
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }
        .stat-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .attack-item {
          font-size: 13px;
          text-transform: capitalize;
          padding: 4px 0;
          border-bottom: 1px solid #333;
        }
        .attack-item:last-child { border-bottom: none; }
      </style>
      <div class="card">
        ${m ? `
          <div class="name">${m.name}</div>
          <div class="types">${typeBadges}</div>
          <div class="section-title">Stats</div>
          ${this._statBar("HP", m.life, "hp")}
          ${this._statBar("ATK", m.damage, "attack")}
          ${this._statBar("DEF", m.defense, "defense")}
          ${this._statBar("SPD", m.speed, "speed")}
          <div class="section-title">Attacks</div>
          ${attacks}
        ` : ""}
      </div>
    `;
  }
}

customElements.define("monster-info-element", PokemonInfo);
