import itemsData from "./items.json";

function buildItemFunc({ stat, type, value }) {
  return (monster) => {
    if (type === "restore") {
      monster._hp = Math.min(monster._maxHp, monster._hp + value);
      monster._updateHtmlContainer();
    } else if (type === "restore_full") {
      monster._hp = monster._maxHp;
      monster._updateHtmlContainer();
    } else if (type === "permanent_add") {
      if (stat === "life") {
        monster._maxHp += value;
        monster._hp = Math.min(monster._hp + value, monster._maxHp);
        monster._information.life = monster._maxHp;
        monster._updateHtmlContainer();
      } else {
        monster._information[stat] += value;
      }
    }
  };
}

const itemsList = Object.fromEntries(
  itemsData.items.map((item) => [
    item.id,
    {
      ...item,
      func: buildItemFunc(item.effect),
    },
  ])
);

export default itemsList;
