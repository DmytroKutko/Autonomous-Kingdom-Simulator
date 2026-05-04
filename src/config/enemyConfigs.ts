import { EnemyConfig } from '../types/common';

export const enemyConfigs: Record<string, EnemyConfig> = {
  rat: {
    health: 30,
    speed: 2,
    visionRange: 100,
    attackRange: 20,
    damage: 5,
    temperament: 'aggressive',
    combatStyle: 'melee',
    loot: {
      resourceType: 'food',
      amount: 1,
      dropChance: 1.0
    }
  }
};