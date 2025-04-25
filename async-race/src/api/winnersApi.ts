import { Winner } from './api'; 
const BASE_URL = 'http://127.0.0.1:3000';

export async function getWinner(id: number): Promise<Winner | null> {
  const response = await fetch(`${BASE_URL}/winners/${id}`);
  if (response.status === 404) return null;
  return response.json();
}

export async function createWinner(winner: Winner): Promise<void> {
  console.log('[API] Creating winner:', winner);
  await fetch(`${BASE_URL}/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
}

export async function updateWinner(winner: Winner): Promise<void> {
  await fetch(`${BASE_URL}/winners/${winner.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winner),
  });
}

export async function getWinners(
  page = 1,
  limit = 10,
  sort = 'wins',
  order: 'ASC' | 'DESC' = 'DESC'
): Promise<{ winners: Winner[]; total: number }> {
  const response = await fetch(`${BASE_URL}/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`);
  const winners = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;
  return { winners, total };
}

export async function deleteWinner(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/winners/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete winner with id ${id}`);
  }
}

