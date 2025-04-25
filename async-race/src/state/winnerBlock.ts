let winnerBlockedByResize = false;

export function setWinnerBlockedByResize(value: boolean) {
  winnerBlockedByResize = value;
}

export function isWinnerBlockedByResize(): boolean {
  console.log('isWinnerBlockedByResize', winnerBlockedByResize);
  return winnerBlockedByResize;
}