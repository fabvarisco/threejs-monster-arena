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
          margin-right: 0.5rem;
        }
        a {
          color: var(--a-active-color);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          height: var(--header-h, 4rem);
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        a:hover {
          background-color: var(--btn-hover-color);
          color: white;
        }
        a.a-active {
          color: white;
        }
        img {
          width: 1.5rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          a {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          a[target="_blank"] .label {
            display: none;
          }
        }
      </style>
      <header>
        <nav>
        <a href="/" class="a-active">
          <img src="./assets/threejs_logo.png" width="24"><span class="label">Pokébattle</span>
        </a>
          <a href="https://jquery-pokememory.vercel.app/"  target="_blank" rel="noopener">
            <img src="https://jquery-pokememory.vercel.app/jquery.svg" width="24"><span class="label">Pokémemory</span>
          </a>
          <a href="https://react-pokedex-rho.vercel.app/" target="_blank" rel="noopener">
            <img src="https://react-pokedex-rho.vercel.app/favicon.ico" width="24"><span class="label">Pokédex</span>
          </a>
        </nav>
      </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
