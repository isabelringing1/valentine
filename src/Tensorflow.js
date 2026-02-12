const URL = "/model/";

let model, loading;
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

// Load the image model and setup the webcam
async function initModel(setLoaded) {
  if (model || loading) {
    console.log("already loaded");
    return;
  }

  loading = true;
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  await tf.setBackend("webgl");
  loading = false;
  setLoaded(true);
}

// run the webcam image through the image model
async function predict(img) {
  // predict can take in an image, video or canvas html element
  //await new Promise((_) => setTimeout(_, 5000));
  const predictionPromise = model.predict(img);

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(null), 1000);
  });

  return await Promise.race([predictionPromise, timeoutPromise]);
}

export { initModel, predict };
