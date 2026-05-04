import { Unit, Enemy } from '../entities';

export interface ThreatInfo {
  enemy: Enemy;
  distance: number;
  isDangerous: boolean;
}

export const assessThreat = (unit: Unit, enemy: Enemy): ThreatInfo => {
  const dist = unit.distanceTo(enemy);
  const canAttack = dist <= unit.attackRange + enemy.attackRange;
  const willWin = unit.hpPercent > enemy.hpPercent || unit.damage >= enemy.health;
  
  return {
    enemy,
    distance: dist,
    isDangerous: canAttack && !willWin
  };
};

export const findThreats = (unit: Unit, enemies: Enemy[]): ThreatInfo[] => {
  const threats: ThreatInfo[] = [];
  
  for (const enemy of enemies) {
    if (enemy.isDead()) continue;
    if (unit.canSee(enemy)) {
      threats.push(assessThreat(unit, enemy));
    }
  }
  
  return threats.sort((a, b) => a.distance - b.distance);
};