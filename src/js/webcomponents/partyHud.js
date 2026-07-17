class PartyHud extends HTMLElement {
  static get observedAttributes() {
    return ["party", "active", "disabled"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const party = JSON.parse(this.getAttribute("party") ?? "[]");
    const activeIdx = parseInt(this.getAttribute("active") ?? "0", 10);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          z-index: 20;
          font-family: 'Nunito', sans-serif;
        }

        .slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .ball {
          border-radius: 50%;
          border: 3px solid white;
          position: relative;
          overflow: hidden;
        }

        .sprite {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
          padding: 4px;
          z-index: 3;
        }

        .ball.active {
          width: 4.5rem;
          height: 4.5rem;
          cursor: default;
          box-shadow: 0 0 0 3px white, 0 0 20px rgba(255, 255, 255, 0.65);
        }

        .ball.bench {
          width: 3.75rem;
          height: 3.75rem;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
        }

        .ball.bench:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 2px white;
        }

        :host([disabled]) .ball.bench {
          cursor: not-allowed;
          opacity: 0.45;
          pointer-events: none;
        }

        .ball.fainted {
          width: 3.75rem;
          height: 3.75rem;
          filter: grayscale(1);
          opacity: 0.3;
          cursor: default;
        }

        .ball.empty {
          width: 3.75rem;
          height: 3.75rem;
          background: linear-gradient(to bottom, #555 50%, #888 50%);
          opacity: 0.35;
          cursor: default;
        }

        .name {
          font-size: 0.6875rem;
          font-weight: 700;
          color: white;
          text-transform: capitalize;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
          max-width: 4.5rem;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .name.fainted-name {
          opacity: 0.3;
        }

        .name.empty-name {
          opacity: 0.25;
        }

        @media (max-width: 1024px) {
          :host {
            gap: 0.625rem;
            bottom: 0.75rem;
          }
          .ball.active {
            width: 3.5rem;
            height: 3.5rem;
          }
          .ball.bench,
          .ball.fainted,
          .ball.empty {
            width: 3rem;
            height: 3rem;
          }
          .name {
            font-size: 0.625rem;
            max-width: 3.5rem;
          }
        }

        @media (max-width: 600px) {
          :host {
            bottom: 0.5rem;
          }
          .ball.active {
            width: 3rem;
            height: 3rem;
          }
          .ball.bench,
          .ball.fainted,
          .ball.empty {
            width: 2.5rem;
            height: 2.5rem;
          }
          .name {
            max-width: 3rem;
          }
        }
      </style>

      ${[0, 1, 2].map((i) => this._slot(party[i] ?? null, i === activeIdx, i)).join("")}
    `;

    if (!this.hasAttribute("disabled")) {
      this.shadowRoot.querySelectorAll(".ball.bench").forEach((ball) => {
        ball.addEventListener("click", () => {
          document.dispatchEvent(
            new CustomEvent("switchMonster", {
              detail: { to: parseInt(ball.dataset.idx, 10) },
            })
          );
        });
      });
    }
  }

  _slot(monster, isActive, idx) {
    if (!monster) {
      return `
        <div class="slot">
          <div class="ball empty" data-idx="${idx}">
            <div class="ball-btn"></div>
          </div>
          <span class="name empty-name">—</span>
        </div>
      `;
    }

    const hp = monster.currentHp ?? monster.life;
    const isFainted = hp <= 0;

    let ballClass;
    if (isActive) ballClass = "ball active";
    else if (isFainted) ballClass = "ball fainted";
    else ballClass = "ball bench";

    const nameClass = isFainted ? "name fainted-name" : "name";

    return `
      <div class="slot">
        <div class="${ballClass}" data-idx="${idx}">
          <img class="sprite" src="${monster.sprites?.front ?? ""}">
          <div class="ball-btn"></div>
        </div>
        <span class="${nameClass}">${monster.name}</span>
      </div>
    `;
  }
}

customElements.define("party-hud", PartyHud);
