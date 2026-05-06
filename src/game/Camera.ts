import { Vec2 } from '../types/common';

export class Camera {
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;
  zoom: number = 0.5;
  speed: number = 5;
  minZoom: number = 0.5;
  maxZoom: number = 2.0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setZoom(level: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, level));
  }

  zoomIn(): void {
    this.setZoom(this.zoom * 1.2);
  }

  zoomOut(): void {
    this.setZoom(this.zoom / 1.2);
  }

  centerOn(x: number, y: number): void {
    this.x = x - this.width / 2 / this.zoom;
    this.y = y - this.height / 2 / this.zoom;
  }

  move(dx: number, dy: number): void {
    this.x += dx * this.speed;
    this.y += dy * this.speed;
  }

  worldToScreen(pos: Vec2): Vec2 {
    return {
      x: (pos.x - this.x) * this.zoom,
      y: (pos.y - this.y) * this.zoom
    };
  }

  screenToWorld(pos: Vec2): Vec2 {
    return {
      x: pos.x / this.zoom + this.x,
      y: pos.y / this.zoom + this.y
    };
  }
}