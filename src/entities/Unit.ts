import { Vec2, Task, Temperament, CombatStyle, ResourceType } from '../types/common';
import { LivingEntity } from './LivingEntity';

const UNIT_NAMES = ['Aldric', 'Rowan', 'Cedric', 'Torin', 'Bren', 'Ewan', 'Lucan', 'Doran'];

export class Unit extends LivingEntity {
  name: string;
  task: Task;
  inventory: Map<ResourceType, number>;
  inventoryCapacity: number;
  temperament: Temperament;
  combatStyle: CombatStyle;
  targetPosition: Vec2 | null = null;
  gatherTimer: number = 0;
  healingTimer: number = 0;
  isHealingAtBase: boolean = false;

  constructor(
    position: Vec2,
    health: number,
    speed: number,
    visionRange: number,
    attackRange: number,
    damage: number,
    inventoryCapacity: number,
    temperament: Temperament,
    combatStyle: CombatStyle
  ) {
    super(position, 'unit', 20, 20, health, speed, visionRange, attackRange, damage, 'player');
    this.name = UNIT_NAMES[Math.floor(Math.random() * UNIT_NAMES.length)];
    this.task = 'idle';
    this.inventory = new Map();
    this.inventoryCapacity = inventoryCapacity;
    this.temperament = temperament;
    this.combatStyle = combatStyle;
  }

  get currentResources(): number {
    let total = 0;
    this.inventory.forEach(amount => {
      total += amount;
    });
    return total;
  }

  isInventoryFull(): boolean {
    return this.currentResources >= this.inventoryCapacity;
  }

  addResource(type: ResourceType, amount: number): boolean {
    if (this.isInventoryFull()) return false;
    const current = this.inventory.get(type) || 0;
    this.inventory.set(type, current + amount);
    return true;
  }

  clearInventory(): void {
    this.inventory.clear();
  }

  setTask(task: Task): void {
    this.task = task;
  }
}