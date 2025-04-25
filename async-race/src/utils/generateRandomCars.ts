export function generateRandomName(): string {
  const brands = ['BMW', 'Audi', 'Tesla', 'Toyota', 'Mazda', 'Nissan', 'Ford', 'Lexus', 'Chevy', 'Bugatti'];
  const models = ['GT', 'RX', 'X5', 'S3', 'Turbo', 'Speed', 'Drift', 'Neo', 'Z4', 'RS'];
  const randomBrand = brands[Math.floor(Math.random() * brands.length)];
  const randomModel = models[Math.floor(Math.random() * models.length)];
  return `${randomBrand} ${randomModel}`;
}

export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}