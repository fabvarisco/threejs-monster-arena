class GameOver extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.75);
        z-index: 100;
        gap: 24px;
      ">
        <h1 style="color: white; font-family: MedievalSharp; font-size: 4rem; margin: 0;">Game Over</h1>
        <button id="tryAgain" style="
          font-family: Nunito;
          font-size: 1.2rem;
          padding: 12px 32px;
          border: none;
          border-radius: 8px;
          background: white;
          cursor: pointer;
        ">Try Again</button>
      </div>
    `;
    this.querySelector("#tryAgain").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("startgame"));
    });
  }
}

customElements.define("game-over", GameOver);
