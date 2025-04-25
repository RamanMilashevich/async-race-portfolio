const BASE_URL = 'http://127.0.0.1:3000';

export interface Car {
  id?: number;
  name: string;
  color: string;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export async function getCars(page = 1, limit = 7): Promise<{ cars: Car[]; total: number }> {
  const response = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=${limit}`);
  const cars = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;
  return { cars, total };
}

export async function createCar(car: Car): Promise<Car> {
  const response = await fetch(`${BASE_URL}/garage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });

  if (!response.ok) {
    throw new Error('Failed to create car');
  }

  return response.json();
}

export async function getWinners(page = 1, limit = 10): Promise<{ winners: Winner[]; total: number }> {
  const response = await fetch(`${BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=wins&_order=DESC`);
  const winners = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;
  return { winners, total };
}

export async function getCar(id: number): Promise<Car> {
  const response = await fetch(`${BASE_URL}/garage/${id}`);
  return response.json();
}

export async function updateCar(id: number, car: Car): Promise<Car> {
  const response = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(car),
  });

  if (!response.ok) {
    throw new Error('Failed to update car');
  }

  return response.json();
}

export async function deleteCar(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete car');
  }
}


