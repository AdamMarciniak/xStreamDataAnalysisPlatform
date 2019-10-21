let simulationTime = 0;
let maxTimeValue = 0;
let minTimeValue = 0;

const getSimulationTime = (realWorldTime, times) => {
  console.log(data);
  const index = getClosestIndex(realWorldTime, times);
  return times[index];
}


export const getClosestIndex = (goal, array) => {
  let closestIndex = 0
  for (let i = 0; i < array.length; i++){
    if (Math.abs(goal - array[i]) < Math.abs(goal - array[closestIndex])){
      closestIndex = i;
    }
  }
  return closestIndex
};

