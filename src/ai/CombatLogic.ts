import { Unit, Enemy, DroppedItem, LivingEntity } from '../entities';
import { Vec2 } from '../types/common';
import { moveToward } from './MovementLogic';

export const attackEnemy = (attacker: LivingEntity, enemy: Enemy, dt: number, droppedItems: DroppedItem[]): boolean => {
  if (attacker.isInRange(enemy)) {
    enemy.takeDamage(attacker.damage * dt);
    if (enemy.isDead()) {
      const dropPos: Vec2 = { x: enemy.position.x, y: enemy.position.y };
      droppedItems.push(new DroppedItem(dropPos, 'food', 3));
    }
    return true;
  }
  
  moveToward(attacker, enemy.center, dt);
  return false;
};

export const attackPlayerUnit = (enemy: LivingEntity, unit: Unit, dt: number): boolean => {
  if (enemy.isInRange(unit)) {
    unit.takeDamage(enemy.damage * dt);
    return true;
  }
  
  moveToward(enemy, unit.center, dt);
  return false;
};

export const canWinFight = (attacker: LivingEntity, enemy: Enemy): boolean => {
  const attackerDamage = attacker.damage;
  const enemyDamage = enemy.damage;
  const attackerHp = attacker.health;
  const enemyHp = enemy.health;
  
  const attackerTimeToKill = enemyHp / attackerDamage;
  const enemyTimeToKill = attackerHp / enemyDamage;
  
  return attackerTimeToKill < enemyTimeToKill;
};