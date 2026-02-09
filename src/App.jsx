import { useState, useEffect } from "react";

import "./App.css";
import DrawPage from "./DrawPage";
import Valentine from "./Valentine";
import back from "/back.png";
import Collection from "./Collection";
const BASE = "https://kv-worker.isabisabel.workers.dev";

function App() {
  const [page, setPage] = useState("main");
  const [lastPage, setLastPage] = useState("main");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [currentValentine, setCurrentValentine] = useState(null);
  const [collection, setCollection] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userId, setUserId] = useState(null);

  const options = { debug: false };
  const idGen = new ShortUID(options);

  useEffect(() => {
    loadData();
    window.addEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      onHashChange();
    }
  }, [dataLoaded]);

  const onHashChange = () => {
    var newValentineData = window.location.hash.replace(/^#\/?/, "");
    if (newValentineData) {
      tryFetchData(newValentineData);
    }
  };

  async function tryFetchData(data) {
    const json = await fetch(`${BASE}/${data}`).then((r) => r.json());
    if (!json) {
      return;
    }
    setCurrentValentine(json);
    console.log(json);
    var newCollection = { ...collection };
    if (!newCollection[json.id] && json.u != userId) {
      newCollection[json.id] = json;
      setCollection(newCollection);
    }
    console.log(newCollection);
    setLastPage(page);
    setPage("open");
  }

  useEffect(() => {
    saveData();
  }, [collection, userId]);

  function loadData() {
    var saveData = localStorage.getItem("valentines");

    if (saveData != null) {
      try {
        saveData = JSON.parse(window.atob(saveData));
      } catch (e) {
        saveData = JSON.parse(saveData);
      }
      console.log("loaded ", saveData);
      setCollection(saveData.collection);
      setUserId(saveData.userId);
    } else {
      var id = idGen.randomUUID();
      setUserId(id);
    }
    setDataLoaded(true);
  }

  function saveData() {
    var newPlayerData = {
      collection: collection,
      userId: userId,
    };
    var saveString = JSON.stringify(newPlayerData);
    console.log(saveString);
    localStorage.setItem("valentines", saveString);
  }

  useEffect(() => {
    setTitle(getDefaultTitle());
    setSubtitle(getDefaultSubtitle());
  }, [page]);

  useEffect(() => {
    if (tempStatus == "redo") {
      setTempTitle("THAT'S NOT A HEART...");
      var r = Math.random() * 100;
      if (r < 50) {
        setTempSubtitle("try again");
      } else {
        setTempSubtitle("close the path idiot");
      }
    } else {
      setTitle(getDefaultTitle());
      setSubtitle(getDefaultSubtitle());
    }
  }, [tempStatus]);

  var getDefaultTitle = () => {
    console.log(tempStatus);
    if (page == "main") {
      return "MAKE A VALENTINE!";
    } else if (page == "open") {
      if (lastPage == "collection") {
        return "THIS IS A VALENTINE";
      } else {
        if (currentValentine.u == userId) {
          return "YOU SENT A VALENTINE TO YOURSELF?";
        }
        return "YOU GOT A VALENTINE!";
      }
    } else if (page == "collection") {
      return "YOUR VALENTINES";
    } else if (tempStatus == "writing") {
      return "SPEAK YO SHIT";
    } else if (tempStatus == "sharing") {
      return "SEND TO UR CRUSH";
    } else if (page == "draw") {
      return "DRAW YOUR CARD";
    }
  };

  var getDefaultSubtitle = () => {
    if (tempStatus == "confirming") {
      return "yayy nice job";
    }
    return "";
  };

  const setTempTitle = (text, delay = 200, duration = 1000) => {
    setTimeout(() => {
      setSubtitle(text);
    }, delay);

    setTimeout(() => {
      setSubtitle(getDefaultTitle());
    }, duration + delay);
  };

  const setTempSubtitle = (text, delay = 200, duration = 1000) => {
    setTimeout(() => {
      setSubtitle(text);
    }, delay);

    setTimeout(() => {
      setSubtitle(getDefaultSubtitle());
    }, duration + delay);
  };

  const setValentinesCategory = (category) => {
    setCategory(category);
    setLastPage(page);
    setPage("draw");
    setTempStatus(null);
  };

  const closeValentine = () => {
    setCurrentValentine(null);
    if (lastPage == "collection") {
      setPage("collection");
    } else {
      console.log(window.location);
      setPage("collection");
    }
  };

  const getNumSweet = () => {
    return Object.values(collection).filter((v) => v.c == "sweet").length;
  };

  const getNumSpicy = () => {
    return Object.values(collection).filter((v) => v.c == "spicy").length;
  };

  const onMiniValentineClicked = (data) => {
    setCurrentValentine(data);
    setLastPage(page);
    setPage("open");
  };

  return (
    <div id="content">
      <div className="title-container">
        <div className="title">{title}</div>
        <div className="subtitle">{subtitle}</div>
      </div>

      {page == "main" && (
        <div className="page page-main">
          <div className="buttons-container">
            <button
              className="sweet"
              onClick={() => setValentinesCategory("sweet")}
            >
              SWEET
            </button>{" "}
            or{" "}
            <button
              className="spicy"
              onClick={() => setValentinesCategory("spicy")}
            >
              SPICY
            </button>
            ?
          </div>

          {collection.length == 0 ? (
            <div className="collection-container">
              "No one sent you any valentines yet :("
            </div>
          ) : (
            <div className="collection-container">
              You've received:
              <div>{getNumSweet()} 🩷</div>
              <div>{getNumSpicy()} 🔥</div>
              <button
                className="view-all-button"
                onClick={() => {
                  setLastPage(page);
                  setPage("collection");
                }}
              >
                View All ➤
              </button>
            </div>
          )}
        </div>
      )}
      {page == "draw" && (
        <DrawPage
          category={category}
          drawStatus={tempStatus}
          setDrawStatus={setTempStatus}
          setTempSubtitle={setTempSubtitle}
          setPage={setPage}
          setLastPage={setLastPage}
          userId={userId}
        />
      )}

      {page == "open" && (
        <Valentine
          data={currentValentine}
          closeValentine={closeValentine}
          firstView={lastPage != "collection"}
        />
      )}

      {page != "main" && (
        <img
          src={back}
          className="back-arrow"
          onClick={() => setPage("main")}
        />
      )}

      {page == "collection" && (
        <Collection
          collection={collection}
          onMiniValentineClicked={onMiniValentineClicked}
          setPage={setPage}
          setLastPage={setLastPage}
        />
      )}
    </div>
  );
}

export default App;
