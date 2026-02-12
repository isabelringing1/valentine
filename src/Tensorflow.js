const URL = "/model/";

let model, labelContainer;

// Load the image model and setup the webcam
async function initModel(setLoaded) {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  console.log("model loaded!");
  setLoaded(true);
}

// run the webcam image through the image model
async function predict(img) {
  // predict can take in an image, video or canvas html element
  return await model.predict(img);
}

export { initModel, predict };
