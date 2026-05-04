import { World } from './World';
import { updateUnitBehavior, updateEnemyBehavior, BehaviorContext } from '../ai/BehaviorController';
import { DroppedItem, Enemy } from '../entities';
import { enemyConfigs } from '../config/enemyConfigs';

export class Simulation {
  world: World;
  lastTime: number = -1;
  accumulator: number = 0;
  fixedDt: number = 1 / 60;

  constructor(world: World) {
    this.world = world;
  }

  private handleEnemyDeath(enemy: Enemy): void {
    console.log('Rat died, dropping loot');
    const config = enemyConfigs[enemy.enemyType];
    console.log('Config:', config);
    console.log('Loot:', config?.loot);
    if (config?.loot && Math.random() < config.loot.dropChance) {
      console.log('Dropping food at', enemy.position);
      const item = new DroppedItem(
        { x: enemy.position.x, y: enemy.position.y },
        config.loot.resourceType,
        config.loot.amount
      );
      console.log('Dropped item created:', item);
      this.world.addDroppedItem(item);
      console.log('World droppedItems count:', this.world.droppedItems.length);
    }
  }

  update(currentTime: number): void {
    if (this.lastTime < 0) {
      this.lastTime = currentTime;
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.accumulator += dt;

    while (this.accumulator >= this.fixedDt) {
      this.fixedUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
  }

  fixedUpdate(dt: number): void {
    for (const unit of this.world.units) {
      const ctx: BehaviorContext = {
        unit,
        base: this.world.base,
        resourceNodes: this.world.resourceNodes,
        enemies: this.world.enemies,
        droppedItems: this.world.droppedItems,
        world: this.world
      };
      updateUnitBehavior(ctx, dt);
    }

    for (const enemy of [...this.world.enemies]) {
      if (enemy.isDead()) {
        this.handleEnemyDeath(enemy);
        continue;
      }
      updateEnemyBehavior(enemy, this.world.units, this.world.base, dt);
      if (enemy.isDead()) {
        this.handleEnemyDeath(enemy);
      }
    }

    this.world.removeDeadEnemies();
    this.world.respawnResources();
  }
}