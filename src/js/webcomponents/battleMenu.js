import { player } from "../../utils/monsters.js";

class BattleMenu extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const attacks = player.selectedMonster?.attacks ?? [];
    const attack1Name = attacks[0]?.name ?? "Attack 1";
    const attack2Name = attacks[1]?.name ?? "Attack 2";

    this.innerHTML = `
        <div id="container" class="container block">
          <div id="options" class="block">
            <button id="btnAttack" class="btn btn-wrapper">Attacks <span class="icon"><img class="img-size" src="/public/battle_icon.png"></span></button>
            <button id="btnItems" class="btn btn-wrapper">Items<span class="icon"><img class="img-size" src="/public/items_icon.png"></span></button>
          </div>

          <div id="attacks" class="none">
            <button id="attack1" class="btn">${attack1Name}</button>
            <button id="attack2" class="btn">${attack2Name}</button>
            <button class="btn btn-back">Back</button>
          </div>

          <div id="items" class="none">
            <button id="item1" class="btn">Item 1</button>
            <button id="item2" class="btn">Item 2</button>
            <button class="btn btn-back">Back</button>
          </div>
        </div>
      `;

    // Adding event listeners after the elements are created
    this.querySelector("#btnAttack").addEventListener("click", () =>
      this.showContainer("attacks")
    );
    this.querySelector("#btnItems").addEventListener("click", () =>
      this.showContainer("items")
    );
    this.querySelector("#attacks .btn-back").addEventListener("click", () =>
      this.back("attacks")
    );
    this.querySelector("#items .btn-back").addEventListener("click", () =>
      this.back("items")
    );
  }

  showContainer(containerName) {
    document.getElementById("options").className = "none";
    document.getElementById(containerName).className = "block";
  }

  back(containerName) {
    document.getElementById("options").className = "block";
    document.getElementById(containerName).className = "none";
  }

  hideAllContainers() {
    const containers = this.querySelectorAll(".container > div");
    containers.forEach((container) => {
      container.classList.add("none");
    });
  }
}

customElements.define("battle-menu", BattleMenu);
