import { player } from "../../utils/monsters.js";
import itemsList from "../../utils/items.js";

const battleItems = Object.values(itemsList).filter((item) => item.usableInBattle);

class BattleMenu extends HTMLElement {
  connectedCallback() {
    const attacks = player.selectedMonster?.attacks ?? [];
    const formatName = (name) => name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const attack1Name = formatName(attacks[0]?.name ?? "Attack 1");
    const attack2Name = formatName(attacks[1]?.name ?? "Attack 2");

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
          <div id="item-list"></div>
          <button class="btn btn-back items-back">Back</button>
        </div>
      </div>
    `;

    this.querySelector("#btnAttack").addEventListener("click", () => this.showContainer("attacks"));
    this.querySelector("#btnItems").addEventListener("click", () => this.showContainer("items"));
    this.querySelector("#attacks .btn-back").addEventListener("click", () => this.back("attacks"));
    this.querySelector("#items .btn-back").addEventListener("click", () => this.back("items"));

    this._renderItems();

    this._onInventoryChanged = () => this._renderItems();
    document.addEventListener("inventoryChanged", this._onInventoryChanged);
  }

  disconnectedCallback() {
    document.removeEventListener("inventoryChanged", this._onInventoryChanged);
  }

  _renderItems() {
    const container = this.querySelector("#item-list");
    if (!container) return;

    const availableItems = battleItems.filter((item) => (player.inventory[item.id] ?? 0) > 0);

    if (availableItems.length === 0) {
      container.innerHTML = `<p class="items-empty">No items available.</p>`;
      return;
    }

    container.innerHTML = availableItems
      .map((item) => {
        const qty = player.inventory[item.id];
        return `
          <button class="btn-item-card" data-item-id="${item.id}">
            <span class="item-card-name">${item.name}</span>
            <span class="item-card-qty">${qty}</span>
          </button>`;
      })
      .join("");

    container.querySelectorAll(".btn-item-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("useItem", { detail: { itemId: btn.dataset.itemId } }));
        this.back("items");
      });
    });
  }

  showContainer(containerName) {
    document.getElementById("options").className = "none";
    const el = document.getElementById(containerName);
    el.className = containerName === "items" ? "items-panel" : "block";
  }

  back(containerName) {
    document.getElementById("options").className = "block";
    document.getElementById(containerName).className = "none";
  }
}

customElements.define("battle-menu", BattleMenu);
