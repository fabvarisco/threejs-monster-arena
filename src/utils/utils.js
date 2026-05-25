


export function PlayerTurn(){
    document.getElementById('container').className = "block container";
    const hud = document.querySelector('party-hud');
    if (hud) hud.removeAttribute('disabled');
}

export function EnemyTurn(){
    document.getElementById('container').className = "none";
}