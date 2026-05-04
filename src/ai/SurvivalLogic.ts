import { LivingEntity, Base } from '../entities';
import { moveToward, canReach } from './MovementLogic';

export const tryHeal = (unit: LivingEntity, base: Base, dt: number): boolean => {
  if (unit.hpPercent >= 1) return true;
  
  if (!canReach(unit, base.center, 60)) {
    moveToward(unit, base.center, dt);
    return false;
  }
  
  unit.heal(1 * dt);
  return true;
};

export const shouldFlee = (unit: LivingEntity): boolean => {
  return unit.hpPercent < 0.3;
};

export const flee = (unit: LivingEntity, base: Base, dt: number): void => {
  moveToward(unit, base.center, dt);
};