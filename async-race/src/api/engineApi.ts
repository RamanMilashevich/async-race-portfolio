const BASE_URL = 'http://localhost:3000';

export async function startEngine(id: number) {
  const res = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return res.json();
}

export async function drive(id: number) {
  const res = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
    method: 'PATCH',
  });
  if (res.status !== 200) throw new Error('Drive failed');
  return res.json();
}

export async function stopEngine(id: number) {
  const res = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to stop engine');
  return res.json();
}
