import { Vec2, ResourceType } from '../types/common';
import { Entity } from './Entity';

export class Base extends Entity {
  resources: Map<ResourceType, number>;

  constructor(position: Vec2) {
    super(position, 'base', 60, 60);
    this.resources = new Map();
    this.resources.set('wood', 0);
    this.resources.set('food', 0);
  }

  getResource(type: ResourceType): number {
    return this.resources.get(type) || 0;
  }

  addResource(type: ResourceType, amount: number): void {
    const current = this.resources.get(type) || 0;
    this.resources.set(type, current + amount);
  }

  hasResources(wood: number, food: number): boolean {
    return this.getResource('wood') >= wood && this.getResource('food') >= food;
  }

  spendResources(wood: number, food: number): boolean {
    if (!this.hasResources(wood, food)) return false;
    this.resources.set('wood', this.getResource('wood') - wood);
    this.resources.set('food', this.getResource('food') - food);
    return true;
  }

  getTotalResources(): number {
    let total = 0;
    this.resources.forEach(amount => {
      total += amount;
    });
    return total;
  }
}