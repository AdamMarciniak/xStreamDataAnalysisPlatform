export const scaleValues = (input, inMin, inMax, outMin, outMax) => outMin
  + ((input - inMin) / (inMax - inMin)) * (outMax - outMin);

export default { scaleValues };
