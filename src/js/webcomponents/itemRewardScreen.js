import itemsList from "../../utils/items.js";
import { player } from "../../utils/monsters.js";

class ItemRewardScreen extends HTMLElement {
  connectedCallback() {
    const enemy = JSON.parse(this.getAttribute("enemy") ?? "null");
    const hasSlot = player.monsters.length < 3;
    const canCatch = enemy && hasSlot;

    const allItems = Object.values(itemsList);
    const itemPicks = [...allItems].sort(() => Math.random() - 0.5).slice(0, canCatch ? 2 : 3);

    const cards = canCatch ? this._insertAt(itemPicks, { _isPokemon: true, monster: enemy }) : itemPicks;

    this._renderScreen(cards, canCatch);
  }

  _insertAt(arr, item) {
    const pos = Math.floor(Math.random() * (arr.length + 1));
    const result = [...arr];
    result.splice(pos, 0, item);
    return result;
  }

  _icon(category) {
    return { potion: "🧪", stat_boost: "⚡" }[category] ?? "🎁";
  }

  _renderScreen(cards, canCatch) {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.78);
          font-family: 'Nunito', sans-serif;
        }

        .title {
          font-size: 3rem;
          font-weight: 700;
          color: #ffd700;
          margin: 0 0 0.25rem;
          text-shadow: 0 0 24px rgba(255, 215, 0, 0.6);
          animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .subtitle {
          color: #ccc;
          font-size: 1rem;
          margin: 0 0 2.5rem;
          animation: pop 0.4s 0.05s both cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cards {
          display: flex;
          gap: 1.25rem;
          align-items: stretch;
        }

        .card {
          background: black;
          border: white 3px solid;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          width: 180px;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          color: #fff;
          animation: slideUp 0.4s both cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }

        .card:hover {
          animation: slideUp 0.4s both cubic-bezier(0.34, 1.56, 0.64, 1), pulse 2s infinite;
        }

        /* Pokemon card */
        .card-pokemon {
          padding: 1.5rem 1.5rem 2rem;
          gap: 0.5rem;
          position: relative;
        }

        .catch-badge {
          position: absolute;
          top: -10px;
          background: #e53935;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: 20px;
          border: 2px solid white;
          text-transform: uppercase;
        }

        .poke-sprite {
          width: 80px;
          height: 80px;
          object-fit: contain;
          image-rendering: pixelated;
          animation: bounce 0.7s infinite alternate ease-in-out;
        }

        .poke-name {
          font-size: 1.05rem;
          font-weight: 700;
          text-transform: capitalize;
          text-align: center;
        }

        .poke-desc {
          font-size: 0.75rem;
          color: #90caf9;
          text-align: center;
        }

        /* Item card */
        .icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .name {
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          color: #fff;
        }

        .desc {
          font-size: 0.78rem;
          color: #aaa;
          text-align: center;
          line-height: 1.4;
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }

        @keyframes bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
      </style>

      <h1 class="title">Vitória!</h1>
      <p class="subtitle">Escolha ${canCatch ? "uma recompensa" : "um item como recompensa"}</p>
      <div class="cards">
        ${cards.map(card => card._isPokemon ? this._pokemonCard(card.monster) : this._itemCard(card)).join("")}
      </div>
    `;

    shadow.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        if (card.dataset.type === "pokemon") {
          const monster = JSON.parse(card.dataset.monster);
          document.dispatchEvent(new CustomEvent("rewardSelected", { detail: { type: "pokemon", pokemon: monster } }));
        } else {
          const itemId = card.dataset.id;
          player.inventory[itemId] = (player.inventory[itemId] ?? 0) + 1;
          document.dispatchEvent(new CustomEvent("inventoryChanged"));
          document.dispatchEvent(new CustomEvent("rewardSelected", { detail: { type: "item", itemId } }));
        }
        this.remove();
      });
    });
  }

  _itemCard(item) {
    return `
      <button class="card" data-type="item" data-id="${item.id}">
        <span class="icon">${this._icon(item.category)}</span>
        <span class="name">${item.name}</span>
        <span class="desc">${item.description}</span>
      </button>
    `;
  }

  _pokemonCard(monster) {
    const monsterJson = JSON.stringify(monster).replace(/'/g, "&#39;");
    return `
      <button class="card card-pokemon" data-type="pokemon" data-monster='${monsterJson}'>
        <span class="catch-badge">Capturar</span>
        <img class="poke-sprite" src="${monster.sprites?.front ?? ""}">
        <span class="poke-name">${monster.name}</span>
        <span class="poke-desc">Adicionar ao time!</span>
      </button>
    `;
  }
}

customElements.define("item-reward-screen", ItemRewardScreen);
