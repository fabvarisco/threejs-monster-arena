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
        gap: 1.5rem;
      ">
        <h1 style="color: white; font-family: MedievalSharp; font-size: clamp(2.5rem, 10vw, 4rem); margin: 0; text-align: center;">Game Over</h1>
        <button id="tryAgain" style="
          font-family: Nunito;
          font-size: 1.2rem;
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 0.5rem;
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
