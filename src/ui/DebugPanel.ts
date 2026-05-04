import { Game } from '../game/Game';
import { Unit } from '../entities/Unit';

export class DebugPanel {
  game: Game;
  panel: HTMLElement;
  baseResources: HTMLElement;
  unitList: HTMLElement;
  selectedUnit: HTMLElement;

  constructor(game: Game) {
    this.game = game;
    this.panel = document.getElementById('debug-panel')!;
    this.baseResources = document.getElementById('base-resources')!;
    this.unitList = document.getElementById('unit-list')!;
    this.selectedUnit = document.getElementById('selected-unit')!;
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
      <div class="stat">
        <span class="stat-label">Wood:</span>
        <span class="stat-value">${base.getResource('wood')}</span>
      </div>
    `;
    if (base.getResource('food') > 0) {
      html += `
        <div class="stat">
          <span class="stat-label">Food:</span>
          <span class="stat-value">${base.getResource('food')}</span>
        </div>
      `;
    }
    this.baseResources.innerHTML = html;
  }

  updateUnitList(): void {
    const units = this.game.world.units;
    if (units.length === 0) {
      this.unitList.innerHTML = '<p style="font-size: 11px; color: #666;">No units</p>';
      return;
    }

    let html = '';
    for (const unit of units) {
      html += `
        <div class="unit-item">
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
    const unit = this.game.world.units[0];
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
    inventoryHtml += `<div style="font-size: 10px; color: #888; margin-bottom: 4px;">Inventory: ${currentCount}/${unit.inventoryCapacity}</div>`;
    
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
      <div class="stat">
        <span class="stat-label">HP:</span>
        <span class="stat-value">${unit.health}/${unit.maxHealth}</span>
      </div>
      <div class="hp-bar-container">
        <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%"></div>
      </div>
      <div class="stat">
        <span class="stat-label">Attack:</span>
        <span class="stat-value">${unit.damage}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Task:</span>
        <span class="stat-value">${unit.task}</span>
      </div>
      ${inventoryHtml}
      <div class="stat">
        <span class="stat-label">Position:</span>
        <span class="stat-value">${Math.floor(unit.position.x)}, ${Math.floor(unit.position.y)}</span>
      </div>
    `;
  }
}