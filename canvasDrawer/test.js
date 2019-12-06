resultsButton.addEventListener("click", () => {
    outputBox.value = null;
    const convertedData = convertAllData(data);
  
    convertedData.forEach(point => {
      outputBox.value = outputBox.value + "\n" + point;
    });