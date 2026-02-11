import { useState, useRef, useEffect } from "react";

import { ReactSketchCanvas } from "react-sketch-canvas";
import { SyncLoader } from "react-spinners";

import { isHeartShaped } from "./Util";
import { predict } from "./Tensorflow";
import svgSlim from "svg-slim";

import redo from "/redo.png";
import dottedHeart from "/dotted-heart.png";
import dottedDick from "/dotted-dick.png";
const isMobile = window.innerWidth <= 600;
const BASE = "https://kv-worker.isabisabel.workers.dev";

export default function DrawPage(props) {
  var { category, setTitle, setSubtitle, setPage, setLastPage, userId } = props;
  var [drawingComplete, setDrawingComplete] = useState(false);
  var [drawingConfirmed, setDrawingConfirmed] = useState(false);
  var [valentineFinished, setValentineFinished] = useState(false);
  var [numRedos, setNumRedos] = useState(0);
  var [message, setMessage] = useState("");
  var [fromText, setFromText] = useState("");
  var [toText, setToText] = useState("");
  var [currentId, setCurrentId] = useState(null);
  var [numIncorrect, setNumIncorrect] = useState(0);
  var [predictProcessing, setPredictProcessing] = useState(false);
  var [saveProcessing, setSaveProcessing] = useState(false);

  var canvasRef = useRef(null);
  var toInputRef = useRef(null);
  var fromInputRef = useRef(null);

  var sweetFillColor = "#E53A8F";
  var spicyFillColor = "#ef3737";

  var strokeColor = category == "sweet" ? sweetFillColor : spicyFillColor;
  const styles = {
    pointerEvents: drawingComplete ? "none" : "all",
  };

  const options = { debug: false };
  const idGen = new ShortUID(options);

  useEffect(() => {
    var canvas_with_mask = document.querySelector(
      "#react-sketch-canvas__stroke-group-0",
    );
    canvas_with_mask.removeAttribute("mask");
  }, []);

  const onStroke = (e) => {
    processDrawing(e);
  };

  async function processDrawing(e) {
    if (!e.paths || e.paths.length == 1) {
      return;
    }
    var needsRedo = false;
    if (isClosed(e.paths)) {
      var path = document.getElementById("react-sketch-canvas__0");
      path.setAttribute("style", "fill: " + strokeColor);

      setPredictProcessing(true);
      var canvas = await turnPathIntoCanvas(path);
      var prediction = await predict(canvas);
      setPredictProcessing(false);

      var p = category == "sweet" ? prediction[0] : prediction[1];
      var op = category == "sweet" ? prediction[1] : prediction[0];
      if (p.probability > 0.97) {
        var r = Math.random() * 100;
        if (r < 50) {
          setSubtitle("beautiful");
        } else {
          setSubtitle("masterpiece");
        }
      } else if (p.probability > 0.75) {
        var r = Math.random() * 100;
        if (r < 33) {
          setSubtitle(
            "this is the worst " +
              (category == "sweet" ? "heart" : "dick") +
              " i've ever seen",
          );
        } else if (r < 66) {
          setSubtitle(
            "you call this a " + (category == "sweet" ? "heart" : "dick") + "?",
          );
        } else {
          setSubtitle("ummm... i guess");
        }
      } else if (op.probability > 0.97) {
        if (numIncorrect > 0) {
          setSubtitle(
            "stop drawing " + (category == "sweet" ? "dick" : "heart") + "s!!",
          );
        } else {
          setSubtitle("that wasn't what you were supposed to draw!");
        }

        setNumIncorrect(numIncorrect + 1);
        needsRedo = true;
      } else {
        var r = Math.random() * 100;
        if (r < 50) {
          setSubtitle("you have to be joking");
        } else {
          setSubtitle("wtf was that?");
        }

        needsRedo = true;
      }
      console.log(
        prediction[0].probability,
        prediction[1].probability,
        prediction[2].probability,
      );
    } else {
      var r = Math.random() * 100;
      if (r < 50) {
        setSubtitle("try again");
      } else {
        setSubtitle("close the path idiot");
      }
      needsRedo = true;
    }

    if (needsRedo) {
      canvasRef.current.clearCanvas();
    } else {
      setDrawingComplete(true);
    }
  }

  async function turnPathIntoCanvas(path) {
    const bbox = path.getBBox();
    var padding = 10;

    var dimension = Math.max(bbox.width, bbox.height);
    const width = dimension + padding * 2;
    const height = dimension + padding * 2;
    var newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    newSvg.setAttribute("width", width);
    newSvg.setAttribute("height", height);
    newSvg.setAttribute(
      "viewBox",
      `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`,
    );
    const clonedPath = path.cloneNode(true);
    newSvg.appendChild(clonedPath);
    const svgString = new XMLSerializer().serializeToString(newSvg);
    const svgBase64 = btoa(svgString);
    const imgSrc = "data:image/svg+xml;base64," + svgBase64;
    const img = new Image();
    img.width = bbox.width;
    img.height = bbox.height;
    img.style.background = "#ffd4e9";
    img.src = imgSrc;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }

  const isClosed = (paths, threshold = 100) => {
    for (var i = 0; i < paths.length - 1; i++) {
      var p1 = paths[i];
      var p2 = paths[i + 1];
      for (var j = i; j < paths.length - 1; j++) {
        var p3 = paths[j];
        var p4 = paths[j + 1];
        if (intersects(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y)) {
          return true;
        }
      }
    }

    const first = paths[0];
    const last = paths[paths.length - 1];

    const dx = last.x - first.x;
    const dy = last.y - first.y;

    console.log("end points diff: " + Math.hypot(dx, dy));
    if (Math.hypot(dx, dy) <= threshold) {
      return true;
    }
    return false;
  };

  // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
  function intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  }

  function redoDrawing() {
    setDrawingComplete(false);
    canvasRef.current.clearCanvas();
    setNumRedos(numRedos + 1);
    if (numRedos == 2) {
      setSubtitle("again??");
    }
    if (numRedos == 3) {
      setSubtitle("dude that one was FINE");
    }
  }

  function confirmDrawing() {
    setDrawingConfirmed(true);

    var path = document.getElementById("react-sketch-canvas__0");
    var rect = path.getBoundingClientRect();
    console.log(rect);

    var newScale = window.innerHeight / 2 / rect.height;
    if (isMobile) {
      var newScaleW = (window.innerWidth * 0.8) / rect.width;
      var newScaleH = (window.innerHeight * 0.4) / rect.height;
      console.log(window.innerHeight, rect.height, newScaleH);
      newScale = Math.min(newScaleW, newScaleH);
    }
    var svg = document.getElementById("react-sketch-canvas");
    console.log(svg, newScale);
    svg.style.scale = newScale;
    var offFromCenterX = rect.x + rect.width / 2 - window.innerWidth / 2;
    var offFromCenterY = rect.y + rect.height / 2 - window.innerHeight / 2;
    if (isMobile) {
      offFromCenterY += window.innerHeight * 0.1;
    }
    svg.style.transform =
      "translate(" + -offFromCenterX + "px, " + -offFromCenterY + "px)";
    setTitle("WRITE SOMETHING");
  }

  function getTextDivStyle() {
    var path = document.getElementById("react-sketch-canvas__0");
    var rect = path.getBoundingClientRect();
    return {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
      display: "flex",
    };
  }

  const getFinalMessageStyle = () => {
    var path = document.getElementById("react-sketch-canvas__0");
    var rect = path.getBoundingClientRect();
    var yOffset = window.innerHeight * 0.04;
    if (isMobile) {
      return {
        left: 0,
        top: rect.top + rect.height + 30 + "px",
      };
    }

    return {
      left: rect.left + rect.width + 50 + "px",
      top: rect.top + rect.height / 2 - yOffset + "px",
    };
  };

  function finishValentine() {
    setValentineFinished(true);

    setTitle("SEND TO YOUR CRUSH");
  }

  async function copyShareLink() {
    setSaveProcessing(true);
    var id = await exportValentine();
    setSaveProcessing(false);
    var url = window.location.origin + window.location.pathname + "#/" + id;
    /*navigator.clipboard.writeText(
      window.location.origin + window.location.pathname + "#/" + id,
    );*/
    navigator.share({
      url: url,
    });
  }

  async function exportValentine() {
    var svg = await canvasRef.current.exportSvg();
    var compressed = await svgSlim(svg);
    console.log(compressed);
    const match = compressed.match(/d="([^"]*)"/);

    var compressedMessage = LZString.compressToEncodedURIComponent(message);

    var id = currentId;
    if (currentId == null) {
      id = idGen.randomUUID();
      setCurrentId(id);
    }

    var data = {
      d: match[1],
      m: compressedMessage,
      t: toText,
      f: fromText,
      c: category,
      id: id,
      u: userId,
    };

    if (currentId == null) {
      // save
      await fetch(`${BASE}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      gtag("event", "post_score", {
        score: category == "sweet" ? 0 : 1,
      });
    }

    return id;
  }

  function isFinishButtonDisabled() {
    return (
      !fromInputRef.current ||
      fromInputRef.current.value == "" ||
      !toInputRef.current ||
      toInputRef.current.value == ""
    );
  }

  const setToInput = () => {
    if (toInputRef.current) {
      setToText(toInputRef.current.value);
    }
  };

  const setFromInput = () => {
    if (fromInputRef.current) {
      setFromText(fromInputRef.current.value);
    }
  };

  return (
    <div className="page page-draw">
      {!drawingComplete && (
        <div className="dotted-container">
          {category == "sweet" ? (
            <img src={dottedHeart} className="dotted-heart" />
          ) : (
            <img src={dottedDick} className="dotted-dick" />
          )}
        </div>
      )}
      <ReactSketchCanvas
        style={styles}
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        strokeWidth={10}
        onStroke={onStroke}
        strokeColor={strokeColor}
        canvasColor="#ffffff00"
      />
      {drawingComplete && !drawingConfirmed && (
        <div className="draw-button-container">
          <button className="continue-button" onClick={confirmDrawing}>
            Continue
          </button>
          <button className="redo-button" onClick={redoDrawing}>
            Redo
            <img src={redo} className="redo-icon" />
          </button>
        </div>
      )}
      {drawingConfirmed && (
        <div className="message-result-div" style={getTextDivStyle()}>
          {message}
        </div>
      )}
      {drawingConfirmed && !valentineFinished && (
        <div className="message-container">
          <div className="message-instructions">Message:</div>
          <textarea
            className="message"
            id="message"
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <div className="message-text">
            <span>To:</span>
            <input
              id="to"
              ref={toInputRef}
              className="input to-input"
              onChange={setToInput}
            ></input>
          </div>
          <div className="message-text">
            <span>From:</span>
            <input
              id="from"
              ref={fromInputRef}
              className="input from-input"
              onChange={setFromInput}
            ></input>
          </div>

          <button
            className="finish-button"
            onClick={finishValentine}
            disabled={isFinishButtonDisabled()}
          >
            Finish
          </button>
        </div>
      )}

      <SyncLoader
        loading={predictProcessing}
        size={15}
        color={"#000000a8"}
        cssOverride={{ position: "absolute" }}
      />

      {valentineFinished && (
        <div
          className="final-message-container"
          id="final-message-container"
          style={getFinalMessageStyle()}
        >
          <div className="message-text">To: {toText}</div>
          <div className="message-text">From: {fromText}</div>
        </div>
      )}
      {valentineFinished && (
        <div className="share-container">
          <button
            className="share-button"
            onClick={copyShareLink}
            disabled={saveProcessing}
          >
            {saveProcessing ? "..." : "Share"}
          </button>

          <button
            className="start-over-button red"
            onClick={() => {
              setLastPage("draw");
              setPage("main");
            }}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
