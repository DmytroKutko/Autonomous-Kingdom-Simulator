import { World } from './World';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Simulation } from './Simulation';
import { Unit, ResourceNode, Enemy } from '../entities';
import { unitConfigs } from '../config/unitConfigs';
import { resourceConfigs } from '../config/resourceConfigs';
import { enemyConfigs } from '../config/enemyConfigs';

export class Game {
  world: World;
  camera: Camera;
  renderer: Renderer;
  simulation: Simulation;
  selectedUnit: Unit | null = null;
  running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    console.log('GAME CONSTRUCTOR', Date.now());
    const mapSize = 100 * 50;
    this.world = new World(mapSize, mapSize);
    this.camera = new Camera(canvas.width, canvas.height);
    this.renderer = new Renderer(canvas);
    this.simulation = new Simulation(this.world);
  }

  init(): void {
    this.createInitialObjects();
    this.camera.centerOn(this.world.base.position.x, this.world.base.position.y);
    this.running = true;
    console.log('Game initialized');
  }

  createInitialObjects(): void {
    console.log('WORLD GENERATED', Date.now());
    const centerX = this.world.width / 2;
    const centerY = this.world.height / 2;
    const basePos = this.world.base.position;

    const config = unitConfigs.warrior;
    const warrior = new Unit(
      { x: centerX + 50, y: centerY },
      config.health,
      config.speed,
      config.visionRange,
      config.attackRange,
      config.damage,
      config.inventoryCapacity,
      config.temperament,
      config.combatStyle
    );
    this.world.addUnit(warrior);

    const treeCount = 80;
    for (let i = 0; i < treeCount; i++) {
      const dist = 100 + Math.random() * 7000;
      const angle = Math.random() * Math.PI * 2;
      let x = centerX + Math.cos(angle) * dist;
      let y = centerY + Math.sin(angle) * dist;

      const baseCenterX = basePos.x + 30;
      const baseCenterY = basePos.y + 30;
      const distToBase = Math.sqrt((x - baseCenterX) ** 2 + (y - baseCenterY) ** 2);
      if (distToBase < 175) {
        x = baseCenterX + Math.cos(angle) * 200;
        y = baseCenterY + Math.sin(angle) * 200;
      }

      const node = new ResourceNode(
        { x, y },
        'wood',
        resourceConfigs.tree.amount,
        resourceConfigs.tree.respawnTime
      );
      this.world.addResourceNode(node);
    }

    const ratCount = 16;
    const ratConfig = enemyConfigs.rat;
    for (let i = 0; i < ratCount; i++) {
      let x: number, y: number, distToBase: number;
      do {
        const ratDist = 100 + Math.random() * 1125;
        const ratAngle = Math.random() * Math.PI * 2;
        x = centerX + Math.cos(ratAngle) * ratDist;
        y = centerY + Math.sin(ratAngle) * ratDist;
        const baseCenterX = basePos.x + 30;
        const baseCenterY = basePos.y + 30;
        distToBase = Math.sqrt((x - baseCenterX) ** 2 + (y - baseCenterY) ** 2);
      } while (distToBase < 150);

      const rat = new Enemy(
        { x, y },
        'rat',
        ratConfig.health,
        ratConfig.speed,
        ratConfig.visionRange,
        ratConfig.attackRange,
        ratConfig.damage,
        ratConfig.temperament,
        ratConfig.combatStyle
      );
      rat.homePosition = { x, y };
      this.world.addEnemy(rat);
    }
  }

  update(time: number): void {
    if (!this.running) return;
    
    this.simulation.update(time);
  }

  render(): void {
    this.renderer.render(this.world, this.camera);
    
    if (this.selectedUnit) {
      this.renderer.renderSelection(this.selectedUnit, this.camera);
    }
  }

  selectUnit(unit: Unit | null): void {
    this.selectedUnit = unit;
  }

  hireWarrior(): boolean {
    if (this.world.base.spendResources(1, 1)) {
      const config = unitConfigs.warrior;
      const warrior = new Unit(
        { 
          x: this.world.base.position.x + (Math.random() - 0.5) * 40, 
          y: this.world.base.position.y + (Math.random() - 0.5) * 40 
        },
        config.health,
        config.speed,
        config.visionRange,
        config.attackRange,
        config.damage,
        config.inventoryCapacity,
        config.temperament,
        config.combatStyle
      );
      this.world.addUnit(warrior);
      return true;
    }
    return false;
  }
}