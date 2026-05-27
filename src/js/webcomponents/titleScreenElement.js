class TitleScreenElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/src/css/buttons.css">
      <style>
        :host {
          position: fixed;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
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
        .img-size { width: 34px; height: 34px; margin-right: 22px; }
      </style>
      <h1>Pokébattle</h1>
      <button id="start-game" class="btn btn-wrapper">Start Game<span class="icon"><img class="img-size" src="/public/battle_icon.png"></span></button>
    `;

    this.shadowRoot.getElementById("start-game").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("startgame", { bubbles: true }));
    });
  }
}

customElements.define("title-screen-element", TitleScreenElement);
