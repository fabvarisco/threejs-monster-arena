import itemsList from "../../utils/items.js";
import { player } from "../../utils/monsters.js";

class ItemRewardScreen extends HTMLElement {
  connectedCallback() {
    const all = Object.values(itemsList);
    const picks = [...all].sort(() => Math.random() - 0.5).slice(0, 3);
    this._render(picks);
  }

  _icon(category) {
    return { potion: "🧪", stat_boost: "⚡" }[category] ?? "🎁";
  }

  _render(items) {
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
        }

        .card {
          background: black;
          border: white 3px solid;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          width: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
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
      </style>

      <h1 class="title">Vitória!</h1>
      <p class="subtitle">Escolha um item como recompensa</p>
      <div class="cards">
        ${items.map(item => `
          <button class="card" data-id="${item.id}">
            <span class="icon">${this._icon(item.category)}</span>
            <span class="name">${item.name}</span>
            <span class="desc">${item.description}</span>
          </button>
        `).join("")}
      </div>
    `;

    shadow.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const itemId = card.dataset.id;
        player.inventory[itemId] = (player.inventory[itemId] ?? 0) + 1;
        document.dispatchEvent(new CustomEvent("inventoryChanged"));
        document.dispatchEvent(new CustomEvent("rewardSelected", { detail: { itemId } }));
        this.remove();
      });
    });
  }
}

customElements.define("item-reward-screen", ItemRewardScreen);
