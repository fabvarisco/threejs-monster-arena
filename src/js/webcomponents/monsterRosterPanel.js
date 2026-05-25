const TYPE_COLORS = {
  fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
  psychic: "#F85888", ice: "#98D8D8", dragon: "#7038F8", dark: "#705848",
  fairy: "#EE99AC", normal: "#A8A878", fighting: "#C03028", flying: "#A890F0",
  poison: "#A040A0", ground: "#E0C068", rock: "#B8A038", bug: "#A8B820",
  ghost: "#705898", steel: "#B8B8D0",
};

function hpColor(pct) {
  if (pct >= 0.5) return "#4caf50";
  if (pct >= 0.25) return "#ffeb3b";
  return "#f44336";
}

class MonsterRosterPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._party = [];
  }

  static get observedAttributes() {
    return ["party", "side", "hide-stats", "active"];
  }

  attributeChangedCallback(name, _old, newValue) {
    if (name === "party") {
      this._party = JSON.parse(newValue);
    }
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _monsterCard(m, index) {
    const maxHp = m.life;
    const currentHp = m.currentHp ?? maxHp;
    const hpPct = Math.max(0, Math.min(1, currentHp / maxHp));
    const fainted = currentHp <= 0;
    const active = Number(this.getAttribute("active") ?? 0) === index;
    const color = hpColor(hpPct);
    const typeBadges = (m.types ?? [m.type].filter(Boolean))
      .map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t] ?? "#777"}">${t}</span>`)
      .join("");

    return `
      <div class="card${fainted ? " fainted" : ""}${active ? " active" : ""}">
        <img class="sprite" src="${m.sprites?.front ?? ""}" alt="${m.name}" />
        <div class="info">
          <div class="top-row">
            <span class="name">${m.name}</span>
            <div class="types">${typeBadges}</div>
          </div>
          <div class="hp-row">
            <span class="hp-label">HP</span>
            <div class="hp-bar-bg">
              <div class="hp-bar-fill" style="width:${Math.round(hpPct * 100)}%;background:${color}"></div>
            </div>
            <span class="hp-text">${currentHp}/${maxHp}</span>
          </div>
          ${this.hasAttribute("hide-stats") ? "" : `
          <div class="stats-row">
            <span class="stat"><em>ATK</em>${m.damage}</span>
            <span class="stat"><em>DEF</em>${m.defense}</span>
            <span class="stat"><em>SPD</em>${m.speed}</span>
          </div>`}
        </div>
      </div>`;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          left: 12px;
          bottom: 120px;
          font-family: Nunito, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          pointer-events: none;
        }
        :host([side="right"]) {
          left: auto;
          right: 12px;
          bottom: auto;
          top: calc(64px + 12px);
        }
        .card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,0,0,0.82);
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 14px;
          padding: 8px 14px 8px 8px;
          width: 280px;
          box-sizing: border-box;
        }
        .card.active {
          border-color: white;
        }
        .card.fainted {
          filter: grayscale(1);
          opacity: 0.5;
        }
        .sprite {
          width: 58px;
          height: 58px;
          image-rendering: pixelated;
          object-fit: contain;
          flex-shrink: 0;
        }
        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .top-row {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .name {
          color: white;
          font-weight: 700;
          font-size: 15px;
          text-transform: capitalize;
        }
        .types {
          display: flex;
          gap: 3px;
        }
        .type-badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          color: white;
        }
        .hp-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .hp-label {
          color: #aaa;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          width: 18px;
          flex-shrink: 0;
        }
        .hp-bar-bg {
          flex: 1;
          height: 7px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }
        .hp-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .hp-text {
          color: white;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          width: 52px;
          text-align: right;
          flex-shrink: 0;
        }
        .stats-row {
          display: flex;
          gap: 8px;
        }
        .stat {
          color: white;
          font-size: 13px;
          font-weight: 600;
        }
        .stat em {
          font-style: normal;
          color: #aaa;
          font-size: 10px;
          margin-right: 2px;
        }
      </style>
      ${this._party.map((m, i) => this._monsterCard(m, i)).join("")}
    `;
  }
}

customElements.define("monster-roster-panel", MonsterRosterPanel);
