import { useState, useEffect } from "react";

import "./App.css";
import DrawPage from "./DrawPage";
import Valentine from "./Valentine";
import back from "/back.png";
import Collection from "./Collection";

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      var newValentineData = window.location.hash.replace(/^#\/?/, "");
      if (newValentineData) {
        var decompressed =
          LZString.decompressFromEncodedURIComponent(newValentineData);
        console.log(decompressed);
        var json = JSON.parse(decompressed);
        if (!json) {
          return;
        }
        setCurrentValentine(json);
        console.log(json, collection);
        var newCollection = { ...collection };
        if (!newCollection[json.id]) {
          newCollection[json.id] = json;
          setCollection(newCollection);
        }
        console.log(newCollection);
        setLastPage(page);
        setPage("open");
      }
    }
  }, [dataLoaded]);

  useEffect(() => {
    saveData();
  }, [collection]);

  function loadData() {
    var saveData = localStorage.getItem("valentines");

    if (saveData != null) {
      try {
        saveData = JSON.parse(window.atob(saveData));
        console.log("loaded ", saveData);
        setCollection(saveData.collection);
        setDataLoaded(true);
      } catch (e) {
        return null;
      }
    }
  }

  function saveData() {
    var newPlayerData = {
      collection: collection,
    };
    var saveString = JSON.stringify(newPlayerData);
    localStorage.setItem("valentines", window.btoa(saveString));
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
    } else if (tempStatus == "writing") {
      return "SPEAK YO SHIT";
    } else if (tempStatus == "sharing") {
      return "SEND TO UR CRUSH";
    } else if (page == "draw") {
      return "DRAW YOUR CARD";
    } else if (page == "open") {
      if (lastPage == "collection") {
        return "THIS IS A VALENTINE";
      } else {
        return "YOU GOT A VALENTINE!";
      }
    } else if (page == "collection") {
      return "YOUR VALENTINES";
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
  };

  const closeValentine = () => {
    setCurrentValentine(null);
    if (lastPage == "collection") {
      setPage("collection");
    } else {
      window.location.href = "/";
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
        />
      )}
    </div>
  );
}

export default App;
