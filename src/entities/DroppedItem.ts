import { Vec2, ResourceType } from '../types/common';
import { Entity } from './Entity';

export class DroppedItem extends Entity {
  resourceType: ResourceType;
  amount: number;

  constructor(position: Vec2, resourceType: ResourceType, amount: number) {
    super(position, 'droppedItem', 8, 8);
    this.resourceType = resourceType;
    this.amount = amount;
  }
}