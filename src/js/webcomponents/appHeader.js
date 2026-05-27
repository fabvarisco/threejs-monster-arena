class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --main-color: #313131;
          --btn-hover-color: #474747;
          --a-active-color: #747171;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: Nunito, sans-serif;
        }
        header {
          display: flex;
          align-items: center;
          color: white;
          background-color: var(--main-color);
          box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2),
            0px 4px 5px 0px rgba(0,0,0,0.14),
            0px 1px 10px 0px rgba(0,0,0,0.12);
          font-weight: bold;
        }
        nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          margin-right: 8px;
        }
        a {
          color: var(--a-active-color);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          height: 64px;
          padding-left: 24px;
          padding-right: 24px;
        }
        a:hover {
          background-color: var(--btn-hover-color);
          color: white;
        }
        a.a-active {
          color: white;
        }
        img {
          border-radius: 4px;
          flex-shrink: 0;
        }
      </style>
      <header>
        <nav>
        <a href="/" class="a-active">
          <img src="./assets/threejs_logo.png" width="24">Pokébattle
        </a>
          <a href="https://jquery-pokememory.vercel.app/"  target="_blank" rel="noopener">
            <img src="https://jquery-pokememory.vercel.app/jquery.svg" width="24">Pokémemory
          </a>
          <a href="https://react-pokedex-rho.vercel.app/" target="_blank" rel="noopener">
            <img src="https://react-pokedex-rho.vercel.app/favicon.ico" width="24">Pokédex
          </a>
        </nav>
      </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
