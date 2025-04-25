 export function showWinnerModal(name: string, time: number): void {
  console.log('🏁 MODAL should appear!', name, time);
  
  const modal = document.createElement('div');
  modal.className = 'winner-modal';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const title = document.createElement('h3');
  title.textContent = '🏁 Winner!';

  const info = document.createElement('p');
  info.textContent = `${name} won for ${time.toFixed(2)} sec.`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  content.append(title, info, closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
}
