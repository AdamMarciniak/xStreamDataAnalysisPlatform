export const mouseYToZoomLevel = (newY, originalY, originalZoom) => {
  const yDistance = originalY - newY;
  const minZoomLevel = 0.01;
  const zoomScaler = 0.002;
  let zoomLevel = originalZoom + (yDistance * zoomScaler);
  zoomLevel = Math.min(1, Math.max(minZoomLevel, zoomLevel));
  return zoomLevel;
};

export const makeDragHandler = (onMouseMove) => {
  const removeWindowListeners = () => {
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', removeWindowListeners);
    document.querySelector('body').setAttribute('style', 'touch-action: auto');

  };
  window.addEventListener('pointermove', onMouseMove);
  window.addEventListener('pointerup', removeWindowListeners);
};
