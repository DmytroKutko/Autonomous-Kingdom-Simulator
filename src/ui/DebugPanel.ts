import { Game } from '../game/Game';
import { Unit } from '../entities/Unit';

export class DebugPanel {
  game: Game;
  panel: HTMLElement;
  baseResources: HTMLElement;
  unitList: HTMLElement;
  selectedUnit: HTMLElement;
  selectedUnitId: number | null = null;

  constructor(game: Game) {
    this.game = game;
    this.panel = document.getElementById('debug-panel')!;
    this.baseResources = document.getElementById('base-resources')!;
    this.unitList = document.getElementById('unit-list')!;
    this.selectedUnit = document.getElementById('selected-unit')!;
    this.setupUnitListClickHandler();
  }

  private setupUnitListClickHandler(): void {
    this.unitList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const unitItem = target.closest('.unit-item') as HTMLElement;
      if (unitItem && unitItem.parentElement === this.unitList) {
        const unitId = parseInt(unitItem.getAttribute('data-unit-id')!, 10);
        if (!isNaN(unitId)) {
          this.selectedUnitId = unitId;
        }
      }
    });
  }

  update(): void {
    this.updateBaseResources();
    this.updateUnitList();
    this.updateSelectedUnit();
  }

  updateBaseResources(): void {
    const base = this.game.world.base;
    let html = '<h3>Base</h3>';
    html += `
      <div class="row">
        <span class="label">Wood:</span>
        <span class="value">${base.getResource('wood')}</span>
      </div>
    `;
    if (base.getResource('food') > 0) {
      html += `
        <div class="row">
          <span class="label">Food:</span>
          <span class="value">${base.getResource('food')}</span>
        </div>
      `;
    }
    this.baseResources.innerHTML = html;
  }

  updateUnitList(): void {
    const units = this.game.world.units;
    if (units.length === 0) {
      this.unitList.innerHTML = '<p style="font-size: 11px; color: #666;">No units</p>';
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
          ${this.getUnitDisplayName(unit)}
        </div>
      `;
    }
    this.unitList.innerHTML = html;
  }

  getUnitDisplayName(unit: Unit): string {
    return `${unit.constructor.name} (${unit.name})`;
  }

  updateSelectedUnit(): void {
    const unit = this.game.world.units.find(u => u.id === this.selectedUnitId);
    if (!unit) {
      this.selectedUnit.innerHTML = '';
      return;
    }

    const hpPercent = (unit.health / unit.maxHealth) * 100;
    let hpClass = 'healthy';
    if (hpPercent <= 33) hpClass = 'low';
    else if (hpPercent <= 66) hpClass = 'medium';

    let inventoryHtml = '';
    const currentCount = unit.currentResources;
    inventoryHtml += `<div class="row"><span class="label">Inventory:</span><span class="value">${currentCount}/${unit.inventoryCapacity}</span></div>`;
    
    if (currentCount > 0) {
      unit.inventory.forEach((amount, type) => {
        if (amount > 0) {
          inventoryHtml += `<div class="inventory-item">- ${type} x${amount}</div>`;
        }
      });
    } else {
      inventoryHtml += `<div class="inventory-item" style="font-style: italic;">Empty</div>`;
    }

    this.selectedUnit.innerHTML = `
      <h3>${this.getUnitDisplayName(unit)}</h3>
      <div class="row">
        <span class="label">HP:</span>
        <span class="value">${unit.health}/${unit.maxHealth}</span>
      </div>
      <div class="hp-bar-container">
        <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%"></div>
      </div>
      <div class="row">
        <span class="label">Attack:</span>
        <span class="value">${unit.damage}</span>
      </div>
      <div class="row">
        <span class="label">Task:</span>
        <span class="value">${unit.task}</span>
      </div>
      ${inventoryHtml}
      <div class="row">
        <span class="label">Position:</span>
        <span class="value">${Math.floor(unit.position.x)}, ${Math.floor(unit.position.y)}</span>
      </div>
    `;
  }
}