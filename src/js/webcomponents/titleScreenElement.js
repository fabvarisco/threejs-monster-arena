import buttonsCss from "../../css/buttons.css?inline";

class TitleScreenElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${buttonsCss}</style>
      <style>
        :host {
          position: fixed;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          font-family: 'Nunito', sans-serif;
          z-index: 10;
          text-align: center;
          white-space: nowrap;
        }
        h1 {
          margin: 0;
          font-size: 3.5rem;
          font-weight: 900;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-shadow: 0 0 24px rgba(74, 70, 70, 0.85), 0 2px 8px rgba(255, 248, 248, 0.9);
        }
        p {
          margin: 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .icon { display: flex; align-items: center; }
        .img-size { width: 2.125rem; height: 2.125rem; margin-right: 1.375rem; }

        @media (max-width: 1024px) {
          h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 600px) {
          h1 {
            font-size: clamp(2rem, 9vw, 2.5rem);
          }
        }
      </style>
      <h1>Pokébattle</h1>
      <button id="start-game" class="btn btn-wrapper">Start Game<span class="icon"><img class="img-size" src="/battle_icon.png"></span></button>
    `;

    this.shadowRoot
      .getElementById("start-game")
      .addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("startgame", { bubbles: true }));
      });
  }
}

customElements.define("title-screen-element", TitleScreenElement);
