import { Vec2, ResourceType } from '../types/common';
import { Entity } from './Entity';

export class ResourceNode extends Entity {
  resourceType: ResourceType;
  amount: number;
  maxAmount: number;
  respawnTime: number;
  lastGathered: number = 0;
  isDepleted: boolean = false;

  constructor(
    position: Vec2,
    resourceType: ResourceType,
    amount: number,
    respawnTime: number,
    width: number = 25,
    height: number = 25
  ) {
    super(position, 'resourceNode', width, height);
    this.resourceType = resourceType;
    this.amount = amount;
    this.maxAmount = amount;
    this.respawnTime = respawnTime;
  }

  gather(amount: number): number {
    const gathered = Math.min(this.amount, amount);
    this.amount -= gathered;
    if (this.amount <= 0) {
      this.isDepleted = true;
      this.lastGathered = Date.now();
    }
    return gathered;
  }

  tryRespawn(basePosition?: Vec2): void {
    if (this.isDepleted && Date.now() - this.lastGathered >= this.respawnTime) {
      this.amount = this.maxAmount;
      this.isDepleted = false;
      if (basePosition) {
        const baseCenterX = basePosition.x + 30;
        const baseCenterY = basePosition.y + 30;
        const distToBase = Math.sqrt((this.position.x - baseCenterX) ** 2 + (this.position.y - baseCenterY) ** 2);
        if (distToBase < 175) {
          const angle = Math.random() * Math.PI * 2;
          this.position.x = baseCenterX + Math.cos(angle) * 200;
          this.position.y = baseCenterY + Math.sin(angle) * 200;
        }
      }
    }
  }

  get resourcePercent(): number {
    return this.amount / this.maxAmount;
  }
}