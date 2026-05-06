import { World } from './World';
import { Camera } from './Camera';
import { Unit, Enemy, Base, ResourceNode, DroppedItem } from '../entities';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = '#0f0f1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(world: World, camera: Camera): void {
    this.clear();
    this.renderGrid(camera);
    this.renderBase(world.base, camera);
    this.renderResourceNodes(world.resourceNodes, camera);
    this.renderDroppedItems(world.droppedItems, camera);
    this.renderUnits(world.units, camera);
    this.renderEnemies(world.enemies, camera);
    this.renderTargetLines(world.units, camera);
  }

  renderGrid(camera: Camera): void {
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < 10000; x += gridSize) {
      const screenX = (x - camera.x) * camera.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < 10000; y += gridSize) {
      const screenY = (y - camera.y) * camera.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(this.canvas.width, screenY);
      this.ctx.stroke();
    }
  }

  renderBase(base: Base, camera: Camera): void {
    const screenPos = camera.worldToScreen(base.position);
    const w = base.width * camera.zoom;
    const h = base.height * camera.zoom;
    
    this.ctx.fillStyle = '#4a3728';
    this.ctx.fillRect(screenPos.x, screenPos.y, w, h);
    
    this.ctx.strokeStyle = '#8b7355';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(screenPos.x, screenPos.y, w, h);
    
    this.ctx.fillStyle = '#c4a77d';
    this.ctx.font = `${12 * camera.zoom}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('BASE', screenPos.x + w / 2, screenPos.y + h / 2);
  }

  renderResourceNodes(nodes: ResourceNode[], camera: Camera): void {
    for (const node of nodes) {
      if (node.isDepleted) continue;
      
      const screenPos = camera.worldToScreen(node.position);
      const w = node.width * camera.zoom;
      const h = node.height * camera.zoom;
      
      this.ctx.fillStyle = '#3d8b3d';
      this.ctx.fillRect(screenPos.x, screenPos.y, w, h);
      
      this.ctx.strokeStyle = '#5cb85c';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(screenPos.x, screenPos.y, w, h);
    }
  }

  renderDroppedItems(items: DroppedItem[], camera: Camera): void {
    for (const item of items) {
      const screenPos = camera.worldToScreen(item.position);
      const radius = item.width / 2 * camera.zoom;
      const centerX = screenPos.x + radius;
      const centerY = screenPos.y + radius;
      
      if (item.resourceType === 'food') {
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - radius);
        this.ctx.lineTo(centerX + radius, centerY);
        this.ctx.lineTo(centerX, centerY + radius);
        this.ctx.lineTo(centerX - radius, centerY);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  renderUnits(units: Unit[], camera: Camera): void {
    for (const unit of units) {
      const screenPos = camera.worldToScreen(unit.position);
      const radius = 12 * camera.zoom;
      
      this.ctx.fillStyle = '#4da6ff';
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x + 10, screenPos.y + 10, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = '#80bfff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  renderEnemies(enemies: Enemy[], camera: Camera): void {
    for (const enemy of enemies) {
      if (enemy.isDead()) continue;
      
      const screenPos = camera.worldToScreen(enemy.position);
      const radius = 8 * camera.zoom;
      
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x + 7, screenPos.y + 7, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderTargetLines(units: Unit[], camera: Camera): void {
    for (const unit of units) {
      if (!unit.targetEntity) continue;
      
      const unitScreenPos = camera.worldToScreen(unit.position);
      const targetScreenPos = camera.worldToScreen(unit.targetEntity.position);
      
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(unitScreenPos.x + 10, unitScreenPos.y + 10);
      this.ctx.lineTo(targetScreenPos.x + unit.targetEntity.width / 2 * camera.zoom, targetScreenPos.y + unit.targetEntity.height / 2 * camera.zoom);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  renderSelection(unit: Unit, camera: Camera): void {
    const screenPos = camera.worldToScreen(unit.position);
    const radius = (unit.width / 2 + 5) * camera.zoom;
    
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x + unit.width / 2 * camera.zoom, screenPos.y + unit.height / 2 * camera.zoom, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}