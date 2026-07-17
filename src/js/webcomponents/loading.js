class Loading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <div id="loading" style="position:fixed; inset:0; background: black; opacity: 0.5;">
        <h1 style="position:relative; color: white; display:flex; justify-content:center;">
            LOADING....
        </h1>
      </div>
    `;
  }
}

customElements.define("loading-element", Loading);
