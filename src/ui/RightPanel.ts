import { Game } from '../game/Game';

export class RightPanel {
  private game: Game;
  private resourcesContainer: HTMLElement;
  private unitsContainer: HTMLElement;
  private selectedUnitContainer: HTMLElement;
  private selectedUnitId: number | null = null;
  private cachedResourceCount: number = 0;
  private cachedUnitCount: number = 0;
  private cachedSelectedUnitId: number | null = null;

  constructor(game: Game) {
    this.game = game;
    this.resourcesContainer = document.getElementById('kingdom-resources')!;
    this.unitsContainer = document.getElementById('units-list')!;
    this.selectedUnitContainer = document.getElementById('selected-unit-details')!;
    
    this.game.onResourceChange(() => this.renderResources());
    this.game.onUnitChange(() => {
      this.cachedUnitCount = 0;
      this.renderUnitsList();
      this.renderSelectedUnit();
    });
    
    this.setupUnitListClickHandler();
  }

  private setupUnitListClickHandler(): void {
    this.unitsContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const unitItem = target.closest('.unit-item') as HTMLElement;
      if (unitItem) {
        const unitId = parseInt(unitItem.getAttribute('data-unit-id')!, 10);
        if (!isNaN(unitId)) {
          this.selectedUnitId = unitId;
          this.updateUnitSelectionClasses();
          this.renderSelectedUnit();
        }
      }
    });
  }

  private updateUnitSelectionClasses(): void {
    const unitItems = this.unitsContainer.querySelectorAll('.unit-item');
    unitItems.forEach((item) => {
      const itemId = parseInt(item.getAttribute('data-unit-id')!, 10);
      if (itemId === this.selectedUnitId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  render(): void {
    this.renderResources();
    this.renderUnitsList();
    this.renderSelectedUnit();
  }

  private renderResources(): void {
    const base = this.game.world.base;
    const wood = base.getResource('wood');
    const food = base.getResource('food');
    const currentTotal = wood + food;

    if (currentTotal === this.cachedResourceCount) {
      return;
    }
    this.cachedResourceCount = currentTotal;

    let html = `
      <h3>Resources</h3>
      <div class="resource-row">
        <span class="resource-label">Wood:</span>
        <span class="resource-value">${wood}</span>
      </div>
    `;
    
    if (food > 0) {
      html += `
        <div class="resource-row">
          <span class="resource-label">Food:</span>
          <span class="resource-value">${food}</span>
        </div>
      `;
    }

    this.resourcesContainer.innerHTML = html;
  }

  private renderUnitsList(): void {
    const units = this.game.world.units;
    
    if (units.length === this.cachedUnitCount && this.selectedUnitId === this.cachedSelectedUnitId) {
      const existingItems = this.unitsContainer.querySelectorAll('.unit-item');
      let needsUpdate = false;
      
      if (existingItems.length !== units.length) {
        needsUpdate = true;
      } else {
        units.forEach((unit, index) => {
          const item = existingItems[index] as HTMLElement;
          if (item && item.getAttribute('data-unit-id') !== unit.id.toString()) {
            needsUpdate = true;
          }
        });
      }
      
      if (!needsUpdate) {
        return;
      }
    }
    
    this.cachedUnitCount = units.length;
    this.cachedSelectedUnitId = this.selectedUnitId;

    if (units.length === 0) {
      this.unitsContainer.innerHTML = '<p class="no-units">No units</p>';
      this.selectedUnitId = null;
      return;
    }

    if (this.selectedUnitId === null || !units.find(u => u.id === this.selectedUnitId)) {
      this.selectedUnitId = units[0].id;
    }

    let html = '';
    for (const unit of units) {
      const isSelected = unit.id === this.selectedUnitId;
      const selectedClass = isSelected ? 'selected' : '';
      html += `
        <div class="unit-item ${selectedClass}" data-unit-id="${unit.id}">
          <span class="unit-name-display">${unit.constructor.name}</span>
          <span class="unit-personal-name">(${unit.name})</span>
        </div>
      `;
    }
    this.unitsContainer.innerHTML = html;
  }

  private renderSelectedUnit(): void {
    const unit = this.game.world.units.find(u => u.id === this.selectedUnitId);
    
    if (!unit) {
      this.selectedUnitContainer.innerHTML = '';
      return;
    }

    const hpPercent = (unit.health / unit.maxHealth) * 100;
    const hpClass = hpPercent <= 33 ? 'low' : hpPercent <= 66 ? 'medium' : 'healthy';

    const currentCount = unit.currentResources;
    let inventoryHtml = `
      <div class="stat-row">
        <span class="stat-label">Inventory:</span>
        <span class="stat-value">${currentCount}/${unit.inventoryCapacity}</span>
      </div>
    `;
    
    if (currentCount > 0) {
      unit.inventory.forEach((amount, type) => {
        if (amount > 0) {
          inventoryHtml += `<div class="inventory-item">- ${type} x${amount}</div>`;
        }
      });
    } else {
      inventoryHtml += `<div class="inventory-item empty">Empty</div>`;
    }

    this.selectedUnitContainer.innerHTML = `
      <div class="unit-detail-header">${unit.constructor.name}: ${unit.name}</div>
      
      <div class="stat-row">
        <span class="stat-label">Health:</span>
        <span class="stat-value">${unit.health}/${unit.maxHealth}</span>
      </div>
      <div class="hp-bar-container">
        <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%"></div>
      </div>
      
      <div class="stat-row">
        <span class="stat-label">Attack:</span>
        <span class="stat-value">${unit.damage}</span>
      </div>
      
      <div class="stat-row">
        <span class="stat-label">Task:</span>
        <span class="stat-value">${unit.task}</span>
      </div>
      
      ${inventoryHtml}
      
      <div class="stat-row">
        <span class="stat-label">Position:</span>
        <span class="stat-value">${Math.floor(unit.position.x)}, ${Math.floor(unit.position.y)}</span>
      </div>
    `;
  }

  getSelectedUnitId(): number | null {
    return this.selectedUnitId;
  }

  setSelectedUnit(unitId: number | null): void {
    this.selectedUnitId = unitId;
    this.render();
  }
}
