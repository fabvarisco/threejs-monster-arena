import CharacterSelectionScene from "./Scenes/characterSelectionScene";
import TitleScene from "./Scenes/titleScene";
import BattleScene from "./Scenes/battleScene";

export default class GameManager {
  constructor() {
    this.Player = undefined;
    this.startScene = new TitleScene();
    this.currentScene = this.startScene;
    this.selectedMonsterName = undefined;
    this._documentEvents();
  }

  _documentEvents() {
    document.addEventListener("startgame", () => {
      this._changeScene('CharacterSelectionScene');
    });
    document.addEventListener("startBattle", (event) => {
      console.log(event.detail)
      this.selectedMonsterName = event.detail.selectedMonster;
      this._changeScene('BattleScene');
    });
  }

  StartGame() {
    this.currentScene.InitScene();
  }

  _startGame() {
    this.currentScene.InitScene();
  }

  _changeScene(sceneName) {
    this.currentScene.DestroyScene();
    this.currentScene = null;

    switch(sceneName){
      case 'TitleScene':
        this.currentScene = new TitleScene();
        this.currentScene.InitScene();

      break;
      case 'BattleScene':
        this.currentScene = new BattleScene(this.selectedMonsterName);
        this.currentScene.InitScene()
      break;
      case 'CharacterSelectionScene':
        this.currentScene = new CharacterSelectionScene();
        this.currentScene.InitScene();
      break;
    }
  }
}
