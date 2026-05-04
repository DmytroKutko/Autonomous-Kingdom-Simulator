import { Unit, Enemy, Base, ResourceNode, DroppedItem } from '../entities';

export class World {
  width: number;
  height: number;
  units: Unit[];
  enemies: Enemy[];
  base: Base;
  resourceNodes: ResourceNode[];
  droppedItems: DroppedItem[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.units = [];
    this.enemies = [];
    this.base = new Base({ x: width / 2 - 30, y: height / 2 - 30 });
    this.resourceNodes = [];
    this.droppedItems = [];
  }

  addUnit(unit: Unit): void {
    this.units.push(unit);
  }

  addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  addResourceNode(node: ResourceNode): void {
    this.resourceNodes.push(node);
  }

  addDroppedItem(item: DroppedItem): void {
    this.droppedItems.push(item);
  }

  removeDroppedItem(item: DroppedItem): void {
    const index = this.droppedItems.indexOf(item);
    if (index > -1) {
      this.droppedItems.splice(index, 1);
    }
  }

  removeDeadEnemies(): void {
    this.enemies = this.enemies.filter(e => !e.isDead());
  }

  removeDroppedItems(): void {
    this.droppedItems = this.droppedItems.filter(item => {
      for (const unit of this.units) {
        if (unit.distanceTo(item) < 20 && !unit.isInventoryFull()) {
          return false;
        }
      }
      return true;
    });
  }

  respawnResources(): void {
    for (const node of this.resourceNodes) {
      node.tryRespawn(this.base.position);
    }
  }
}