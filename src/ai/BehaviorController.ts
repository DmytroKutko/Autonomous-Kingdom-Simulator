import { Unit, Base, ResourceNode, Enemy, DroppedItem } from '../entities';
import { World } from '../game/World';
import { canReach, moveToward, distance } from './MovementLogic';
import { findNearestResource, depositResources } from './GatheringLogic';

export interface BehaviorContext {
  unit: Unit;
  base: Base;
  resourceNodes: ResourceNode[];
  enemies?: Enemy[];
  droppedItems?: DroppedItem[];
  world?: World;
}

const RAT_SAFE_ZONE = 5 * 20;
const HEAL_THRESHOLD = 0.5;
const SOFT_HEAL_THRESHOLD = 0.8;
const HEAL_INTERVAL = 10;
const HEAL_AMOUNT_PERCENT = 0.1;

const findNearestEnemy = (unit: Unit, enemies: Enemy[]): Enemy | null => {
  let nearest: Enemy | null = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    if (enemy.isDead()) continue;
    const d = unit.distanceTo(enemy);
    if (d < minDist && d <= unit.visionRange) {
      minDist = d;
      nearest = enemy;
    }
  }

  return nearest;
};

const findNearestDroppedFood = (unit: Unit, items: DroppedItem[]): DroppedItem | null => {
  let nearest: DroppedItem | null = null;
  let minDist = Infinity;

  for (const item of items) {
    if (item.resourceType !== 'food') continue;
    const d = unit.distanceTo(item);
    if (d < minDist && d <= unit.visionRange) {
      minDist = d;
      nearest = item;
    }
  }

  return nearest;
};

const handleHealing = (unit: Unit, base: Base, dt: number): boolean => {
  if (unit.hpPercent >= 1) {
    unit.isHealingAtBase = false;
    unit.healingTimer = 0;
    return false;
  }

  if (!canReach(unit, base.center, 60)) {
    moveToward(unit, base.center, dt);
    unit.setTask('returning');
    return true;
  }

  unit.healingTimer += dt;
  unit.setTask('healing');

  if (unit.healingTimer >= HEAL_INTERVAL) {
    const healAmount = unit.maxHealth * HEAL_AMOUNT_PERCENT;
    unit.heal(healAmount);
    unit.healingTimer = 0;
  }

  return true;
};

const shouldEmergencyRetreat = (unit: Unit): boolean => {
  return unit.hpPercent < HEAL_THRESHOLD;
};

const shouldSoftHeal = (unit: Unit): boolean => {
  return unit.hpPercent < SOFT_HEAL_THRESHOLD;
};

export const updateUnitBehavior = (ctx: BehaviorContext, dt: number): void => {
  const { unit, base, resourceNodes, droppedItems, world } = ctx;

  unit.updateCooldowns(dt);

  if (shouldEmergencyRetreat(unit) && !unit.isHealingAtBase) {
    unit.isHealingAtBase = true;
    unit.setTask('returning');
  }

  if (unit.isHealingAtBase) {
    if (handleHealing(unit, base, dt)) {
      return;
    }
  }

  if (unit.targetEntity) {
    const targetAsLiving = unit.targetEntity as unknown as { isDead(): boolean };
    if (!targetAsLiving.isDead()) {
      const enemy = unit.targetEntity as Enemy;
      if (unit.isInRange(enemy) || enemy.isInRange(unit)) {
        unit.setTask('fighting');
        unit.performAttack(enemy);
        if (enemy.isDead()) {
          unit.targetEntity = null;
        }
        return;
      } else if (unit.distanceTo(enemy) <= unit.visionRange) {
        unit.setTask('fighting');
        moveToward(unit, enemy.center, dt);
        return;
      }
      unit.targetEntity = null;
    }
  }

  const enemy = findNearestEnemy(unit, ctx.enemies || []);
  if (enemy && (unit.isInRange(enemy) || enemy.isInRange(unit) || unit.distanceTo(enemy) <= unit.visionRange)) {
    unit.targetEntity = enemy;
    unit.setTask('fighting');
    if (unit.isInRange(enemy)) {
      unit.performAttack(enemy);
      console.log('Enemy health after attack:', enemy.health);
      if (enemy.isDead()) {
        console.log('Enemy died in combat!');
        unit.targetEntity = null;
      }
    } else {
      moveToward(unit, enemy.center, dt);
    }
    return;
  }

  if (unit.isInventoryFull()) {
    unit.setTask('returning');
    if (canReach(unit, base.center, 50)) {
      if (depositResources(unit, base)) {
        if (shouldSoftHeal(unit)) {
          unit.isHealingAtBase = true;
          handleHealing(unit, base, dt);
          return;
        }
        unit.setTask('idle');
      }
    } else {
      moveToward(unit, base.center, dt);
    }
    return;
  }

  const droppedFood = findNearestDroppedFood(unit, droppedItems || []);
  if (droppedFood) {
    console.log('Found dropped food, distance:', unit.distanceTo(droppedFood));
    const dist = unit.distanceTo(droppedFood);
    if (dist <= unit.attackRange + 10) {
      console.log('Warrior picked up food');
      unit.addResource('food', droppedFood.amount);
      if (world) {
        world.removeDroppedItem(droppedFood);
      }
      unit.setTask('idle');
      return;
    } else {
      unit.setTask('moving_to_target');
      moveToward(unit, droppedFood.center, dt);
      return;
    }
  }

  if (unit.gatherTimer > 0) {
    unit.gatherTimer -= dt;
    unit.setTask('gathering');
    if (unit.gatherTimer <= 0) {
      const resource = findNearestResource(unit, resourceNodes);
      if (resource && unit.distanceTo(resource) <= unit.attackRange + 10) {
        const gathered = resource.gather(1);
        if (gathered > 0) {
          unit.addResource(resource.resourceType, gathered);
        }
      }
    }
    return;
  }

  const resource = findNearestResource(unit, resourceNodes);
  if (!resource) {
    unit.setTask('idle');
    return;
  }

  unit.setTask('moving_to_resource');
  const dist = unit.distanceTo(resource);
  if (dist > unit.attackRange + 10) {
    moveToward(unit, resource.center, dt);
    return;
  }

  unit.setTask('gathering');
  unit.gatherTimer = 1;
};

export const updateEnemyBehavior = (
  enemy: Enemy,
  units: Unit[],
  base: Base,
  dt: number
): void => {
  enemy.updateCooldowns(dt);

  const distToBase = distance(enemy.center, base.center);

  if (enemy.state === 'returning' && distance(enemy.center, enemy.homePosition) < 10) {
    enemy.state = 'wandering';
    enemy.wanderTarget = null;
  }

  if (enemy.state === 'returning') {
    moveToward(enemy, enemy.homePosition, dt);
    if (distToBase > RAT_SAFE_ZONE) {
      enemy.state = 'wandering';
    }
    return;
  }

  if (distToBase < RAT_SAFE_ZONE) {
    enemy.state = 'returning';
    moveToward(enemy, enemy.homePosition, dt);
    return;
  }

  let targetUnit: Unit | null = null;
  let minDist = Infinity;

  for (const unit of units) {
    if (unit.isDead()) continue;
    const d = enemy.distanceTo(unit);
    if (d < enemy.visionRange && d < minDist) {
      minDist = d;
      targetUnit = unit;
    }
  }

  if (targetUnit) {
    const newDistToBase = distance(targetUnit.center, base.center);
    if (newDistToBase < RAT_SAFE_ZONE) {
      enemy.state = 'returning';
      moveToward(enemy, enemy.homePosition, dt);
      return;
    }

    enemy.state = 'chasing';
    if (enemy.isInRange(targetUnit)) {
      enemy.setTask('fighting');
      enemy.performAttack(targetUnit);
    } else {
      enemy.setTask('moving_to_target');
      moveToward(enemy, targetUnit.center, dt);
    }
    return;
  }

  if (enemy.state === 'wandering' || enemy.state === 'chasing') {
    enemy.wanderTimer -= dt;
    if (enemy.wanderTimer <= 0 || !enemy.wanderTarget) {
      const wanderDist = 50 + Math.random() * 100;
      const wanderAngle = Math.random() * Math.PI * 2;
      const newX = enemy.homePosition.x + Math.cos(wanderAngle) * wanderDist;
      const yOffset = Math.sin(wanderAngle) * wanderDist;
      const newY = enemy.homePosition.y + yOffset;

      const finalDistToBase = Math.sqrt((newX - base.center.x) ** 2 + (newY - base.center.y) ** 2);
      if (finalDistToBase > RAT_SAFE_ZONE) {
        enemy.wanderTarget = { x: newX, y: newY };
      } else {
        const angleToBase = Math.atan2(base.center.y - enemy.homePosition.y, base.center.x - enemy.homePosition.x);
        const safeX = enemy.homePosition.x + Math.cos(angleToBase) * RAT_SAFE_ZONE;
        const safeY = enemy.homePosition.y + Math.sin(angleToBase) * RAT_SAFE_ZONE;
        enemy.wanderTarget = { x: safeX, y: safeY };
      }
      enemy.wanderTimer = 2 + Math.random() * 3;
    }

    if (enemy.wanderTarget) {
      const d = distance(enemy.center, enemy.wanderTarget);
      if (d > 10) {
        enemy.setTask('wandering');
        moveToward(enemy, enemy.wanderTarget, dt);
      }
    }
  }
};