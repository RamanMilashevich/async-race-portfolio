import { EngineResponse } from '../../models/Engine';
import { startEngine, drive, stopEngine } from '../../api/engineApi';
import { updateCar, deleteCar } from '../../api/api';
import { carSvgTemplate } from '../../utils/carSvgTemplate';
import { flagSvgTemplate } from '../../utils/flagSvgTemplate';
import { isWinnerBlockedByResize } from '../../state/winnerBlock';
import { updateRaceAllAvailability } from '../garage/GarageView';

export class CarCard {
  private carElement: HTMLElement;
  private id: number;
  private name: string;
  private color: string;
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private running = false;
  private frozen = false;

  constructor(
    id: number,
    name: string,
    color: string,
    private onDelete: (deletedElement: HTMLElement) => void,
    private onFinish?: (id: number, time: number, sessionId: number) => void
  ) {
    this.id = id;
    this.name = name;
    this.color = color;

    this.carElement = document.createElement('div');
    this.carElement.classList.add('car-wrapper');
    this.carElement.style.position = 'relative';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = this.name;
    nameSpan.className = 'car-name';

    this.startBtn = document.createElement('button');
    this.startBtn.textContent = 'Start';
    this.startBtn.addEventListener('click', () => this.startCar(0));

    this.stopBtn = document.createElement('button');
    this.stopBtn.textContent = 'Stop';
    this.stopBtn.disabled = true;
    this.stopBtn.addEventListener('click', () => this.stopCar());

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => this.editCar());

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => this.deleteCar());

    const carWrapper = document.createElement('div');
    carWrapper.className = 'car-svg-wrapper';
    carWrapper.innerHTML = carSvgTemplate.replace('CURRENT_COLOR', this.color);

    const carBody = carWrapper.querySelector('svg') as SVGElement;
    carBody.id = `car-${this.id}`;
    carBody.style.transition = 'transform 0s linear';
    carBody.style.position = 'relative';

    const road = document.createElement('div');
    road.className = 'car-road';

    const flag = document.createElement('div');
    flag.className = 'flag';
    flag.innerHTML = flagSvgTemplate;

    const roadWrapper = document.createElement('div');
    roadWrapper.className = 'road-wrapper';
    roadWrapper.appendChild(road);
    roadWrapper.appendChild(flag);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'car-buttons';
    buttonsContainer.append(this.startBtn, this.stopBtn, editBtn, deleteBtn);

    this.carElement.append(nameSpan, carWrapper, roadWrapper, buttonsContainer);

    editBtn.addEventListener('click', () => {
      const form = document.querySelector('.car-form') as any;
      if (form?.setEditingCar) {
        form.setEditingCar(this.id, this.name, this.color);
      }
    });
  }

  render(): HTMLElement {
    return this.carElement;
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  highlightWinner(): void {
    this.carElement.classList.add('winner');
  }

  removeHighlight(): void {
    this.carElement.classList.remove('winner');
  }

  freeze(): void {
    const car = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;
    const current = getComputedStyle(car).transform;

    car.style.transition = 'none';
    if (current && current !== 'none') {
      car.style.transform = current;
    }

    this.running = false;
    this.frozen = true;
    this.updateButtonsState();
  }

  private updateButtonsState(): void {
    if (this.frozen) {
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;
    } else if (this.running) {
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;
    } else {
      this.startBtn.disabled = false;
      this.stopBtn.disabled = true;
    }
  }

  resetPosition(): void {
    const car = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;
    car.style.transition = 'none';
    car.style.transform = 'translateX(0)';
    this.running = false;
    this.frozen = false;
    this.updateButtonsState();
  }

  async startCar(sessionId: number): Promise<{ time: number, sessionId: number } | null> {
    if (this.running || this.frozen) return null;

    this.running = true;
    updateRaceAllAvailability();
    this.updateButtonsState();

    try {
      const { distance, velocity } = await startEngine(this.id);

      const car = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;
      const flag = this.carElement.querySelector('.flag') as HTMLElement;

      await new Promise(requestAnimationFrame);
      const travel = flag.getBoundingClientRect().left - car.getBoundingClientRect().right + 20;
      const time = distance / velocity / 1000;

      car.style.transition = `transform ${time}s linear`;
      car.style.transform = `translateX(${travel}px)`;

      try {
        await drive(this.id);
        this.onFinish?.(this.id, time, sessionId);
        return { time, sessionId };
      } catch {
        this.freeze();
        return null;
      }

    } catch (e) {
      this.running = false;
      this.frozen = true;
      this.updateButtonsState();
      console.error(`Engine start failed for ${this.id}:`, e);
      return null;
    }
  }

  async stopCar() {
    this.startBtn.disabled = true;
    this.stopBtn.disabled = true;

    try {
      await stopEngine(this.id);

      const car = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;
      car.style.transition = 'none';
      car.style.transform = 'translateX(0)';

      this.running = false;
      this.frozen = false;
      this.updateButtonsState();
    } catch (err) {
      console.error(`Car stop error ${this.id}:`, err);
      this.updateButtonsState();
    }
  }

  async editCar() {
    const form = document.querySelector('.car-form') as any;
    if (form?.setEditingCar) {
      form.setEditingCar(this.id, this.name, this.color);
    }
  }

  async deleteCar() {
    if (!confirm('Delete this car?')) return;
    try {
      await deleteCar(this.id);
      this.carElement.remove();
      this.onDelete(this.carElement);
    } catch (e) {
      console.error(`Failed to delete car ${this.id}:`, e);
    }
  }

  async abortRun() {
    if (!this.running) return;
    const car = this.carElement.querySelector(`#car-${this.id}`) as HTMLElement;
    const current = getComputedStyle(car).transform;
    car.style.transition = 'none';
    car.style.transform = current !== 'none' ? current : 'translateX(0)';
    this.running = false;
    this.updateButtonsState();
  }

  isRunning(): boolean {
    return this.running;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  wasStarted(): boolean {
    return this.running || this.frozen;
  }
}
