let editingCar: { id: number; name: string; color: string } | null = null;

export function setEditingCarState(id: number, name: string, color: string) {
  editingCar = { id, name, color };
}

export function getEditingCarState() {
  return editingCar;
}