export interface EngineResponse {
  velocity: number;
  distance: number;
}

export class Api {
  private base = 'http://localhost:3000';

  async startCar(id: number): Promise<EngineResponse> {
    const res = await fetch(`${this.base}/engine?id=${id}&status=started`, {
      method: 'PATCH',
    });
    return res.json();
  }

  async stopCar(id: number): Promise<EngineResponse> {
    const res = await fetch(`${this.base}/engine?id=${id}&status=stopped`, {
      method: 'PATCH',
    });
    return res.json();
  }
}
