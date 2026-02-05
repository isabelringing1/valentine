import { useState } from "react";

import "./App.css";

function App() {
  const [page, setPage] = useState("main");

  const getTitle = () => {
    switch (page) {
      case "main":
        return "MAKE A VALENTINE!";
    }
  };

  return (
    <div id="content">
      <div className="title">{getTitle()}</div>
      {page == "main" && (
        <div className="page page-main">
          <div className="buttons-container">
            <button className="sweet">SWEET</button> or{" "}
            <button className="spicy">SPICY</button>?
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
