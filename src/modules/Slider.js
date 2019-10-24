const mouseYToZoomLevel = (newY, originalY, originalZoom) => {
  const yDistance = originalY - newY;
  const minZoomLevel = 0.02;
  const zoomScaler = 0.002;
  let zoomLevel = originalZoom + (yDistance * zoomScaler);
  zoomLevel = Math.min(1, Math.max(minZoomLevel, zoomLevel));
  return zoomLevel;
};


const makeDragHandler = (onMouseMove) => {
  const removeWindowListeners = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', removeWindowListeners);
  }
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', removeWindowListeners);
}


export {mouseYToZoomLevel, makeDragHandler}