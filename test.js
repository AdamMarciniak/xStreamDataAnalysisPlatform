const nonTimeProperties = ['velocity', 'acceleration', 'right Arm Angle', 'left Arm Angle', 'rear Stress', 'front Stress', '1', '2', '4', '5', '6', 'hello', 'laura', 'data']

SAMPLE_PERIOD_SECONDS = 0.1;
numOverviewDataPoints= 1000;


const createFakeRawData = () => {
  const allRawData = {};
  let rawData = {};
  const timeArray = [];
  let k = 1;
  const createFakeData = nonTimeProperties.forEach((property) => {
    k += 10;
    let time = [];
    let xValues = [];
    for (let i = 0; i < 1000; i++) {
      timeArray[i] = (parseFloat((SAMPLE_PERIOD_SECONDS * i).toFixed(5)));
      xValues[i] = ((2 * Math.sin(i * 2 / k) + 3 * Math.sin(i / 10))
        + Math.tanh(i * k) + Math.sin(i));
    };
    rawData[property] = xValues;

  });
  allRawData['yValues'] = rawData;
  allRawData['timeValues'] = timeArray;
  return allRawData;
};
const allRawData = createFakeRawData();

overviewWidth = 500;

const reduceToOverviewDataPoints = (allRawData, overviewWidth) => {

  



}

