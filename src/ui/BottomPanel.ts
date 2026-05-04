import { Game } from '../game/Game';

export class BottomPanel {
  private game: Game;
  private tabs: NodeListOf<HTMLButtonElement>;
  private tabPanes: NodeListOf<HTMLElement>;
  private recruitBtn: HTMLButtonElement;

  constructor(game: Game) {
    this.game = game;

    this.tabs = document.querySelectorAll('#bottom-panel .tab');
    this.tabPanes = document.querySelectorAll('#bottom-panel .tab-pane');
    this.recruitBtn = document.querySelector('#units-tab .recruit-btn') as HTMLButtonElement;

    this.setupTabs();
    this.setupRecruitButton();
  }

  private setupTabs(): void {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `${targetTab}-tab`) {
            pane.classList.add('active');
          }
        });
      });
    });
  }

  private setupRecruitButton(): void {
    this.recruitBtn.addEventListener('click', () => {
      // NO recruit logic yet - UI state only
    });
  }

  update(): void {
    this.updateButtonState();
  }

  private updateButtonState(): void {
    const base = this.game.world.base;
    const wood = base.getResource('wood');
    const food = base.getResource('food');
    const canAfford = wood >= 3 && food >= 1;

    if (canAfford) {
      this.recruitBtn.classList.remove('disabled');
      this.recruitBtn.style.cursor = 'pointer';
    } else {
      this.recruitBtn.classList.add('disabled');
      this.recruitBtn.style.cursor = 'not-allowed';
    }
  }
}