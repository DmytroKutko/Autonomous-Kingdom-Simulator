import { Game } from './game/Game';
import { DebugPanel } from './ui/DebugPanel';
import { BottomPanel } from './ui/BottomPanel';

console.log('MAIN LOADED', Date.now());

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
console.log('CANVAS CREATED', Date.now());
const container = document.getElementById('app')!;

function resize(): void {
  const panelWidth = 300;
  const bottomPanelHeight = 140;
  canvas.width = container.clientWidth - panelWidth;
  canvas.height = container.clientHeight - bottomPanelHeight;
}

window.addEventListener('resize', resize);
resize();

const game = new Game(canvas);
game.init();

const debugPanel = new DebugPanel(game);
debugPanel.update();

const bottomPanel = new BottomPanel(game);
bottomPanel.update();

const keys: Set<string> = new Set();

window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === '+' || e.key === '=') {
    game.camera.zoomIn();
  }
  if (e.key === '-') {
    game.camera.zoomOut();
  }
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
});

window.addEventListener('wheel', (e) => {
  if (e.deltaY < 0) {
    game.camera.zoomIn();
  } else {
    game.camera.zoomOut();
  }
  e.preventDefault();
}, { passive: false });

function handleInput(): void {
  if (keys.has('w') || keys.has('arrowup')) {
    game.camera.move(0, -1);
  }
  if (keys.has('s') || keys.has('arrowdown')) {
    game.camera.move(0, 1);
  }
  if (keys.has('a') || keys.has('arrowleft')) {
    game.camera.move(-1, 0);
  }
  if (keys.has('d') || keys.has('arrowright')) {
    game.camera.move(1, 0);
  }
}

function gameLoop(time: number): void {
  handleInput();
  game.update(time);
  game.render();
  debugPanel.update();
  bottomPanel.update();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
console.log('LOOP STARTED', Date.now());