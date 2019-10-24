

export const getClosestIndex = (goal, array) => {
  let closestIndex = 0
  for (let i = 0; i < array.length; i++){
    if (Math.abs(goal - array[i]) < Math.abs(goal - array[closestIndex])){
      closestIndex = i;
    }
  }
  return closestIndex
};

