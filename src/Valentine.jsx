import { useState, useEffect } from "react";
import envelope_open from "/envelope_open.png";
import envelope_closed from "/envelope_closed.png";
const isMobile = window.innerWidth <= 600;

export default function Valentine(props) {
  const { data, closeValentine, firstView } = props;

  var [svgStateLoaded, setSvgStateLoaded] = useState(false);
  var [envelopeOpened, setEnvelopeOpened] = useState(false);
  var [trueScale, setTrueScale] = useState(1);

  var sweetFillColor = "#E53A8F";
  var spicyFillColor = "#ef3737";
  var strokeColor = data.c == "sweet" ? sweetFillColor : spicyFillColor;

  useEffect(() => {
    var svg = setUpValentine();
    document.getElementById("show-valentine").appendChild(svg);

    var path = document.getElementById("path");
    var rect = path.getBoundingClientRect();
    var newScale = window.innerHeight / 2 / rect.height;

    if (isMobile) {
      var newScaleW = (window.innerWidth * 0.8) / rect.width;
      var newScaleH = (window.innerHeight * 0.4) / rect.height;
      newScale = Math.min(newScaleW, newScaleH);
    }

    var svg = document.getElementById("svg");
    setTrueScale(newScale);
    svg.style.scale = 0;
    var offFromCenterX = rect.x + rect.width / 2 - window.innerWidth / 2;
    var offFromCenterY = rect.y + rect.height / 2 - window.innerHeight / 2;
    svg.style.transform =
      "translate(" + -offFromCenterX + "px, " + -offFromCenterY + "px)";

    if (!firstView) {
      setTimeout(() => {
        setEnvelopeOpened(true);
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (envelopeOpened) {
      var svg = document.getElementById("svg");
      svg.style.scale = trueScale;
      svg.style.opacity = 1;
      setTimeout(() => {
        setSvgStateLoaded(true);
      }, 300);
    }
  }, [envelopeOpened]);

  const setUpValentine = () => {
    const svgns = "http://www.w3.org/2000/svg";

    // 1. Create the main SVG container element
    const svg = document.createElementNS(svgns, "svg");
    svg.id = "svg";
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    svg.style.opacity = 0;

    //svg.setAttribute("viewBox", "0 0 200 200"); // Define the coordinate system

    // 2. Create the path element
    const path = document.createElementNS(svgns, "path");
    path.id = "path";

    // 3. Define the path data using the "d" attribute
    // Commands: M=moveto, L=lineto, Z=closepath
    // This example draws a triangle: M(start at 100, 10), L(line to 10, 190), L(line to 190, 190), Z(close the path)
    const pathData = data.d;
    path.setAttributeNS(null, "d", pathData);
    path.setAttribute("style", "fill: " + strokeColor);
    svg.appendChild(path);

    return svg;
  };

  const getTextDivStyle = () => {
    var path = document.getElementById("path");
    if (!path) {
      return {};
    }
    console.log(path);
    var rect = path.getBoundingClientRect();
    return {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    };
  };

  const getFinalMessageStyle = () => {
    var path = document.getElementById("path");
    if (!path) {
      return {};
    }
    var rect = path.getBoundingClientRect();
    if (isMobile) {
      return {
        left: 0,
        top: rect.top + rect.height + 30 + "px",
      };
    }
    return {
      left: rect.left + rect.width + "px",
      top: rect.top + "px",
    };
  };

  const onCloseValentine = () => {
    closeValentine();
  };

  return (
    <div className="valentine-container" id="valentine-container">
      <div id="show-valentine">
        <div
          className="envelope-container"
          onClick={() => {
            if (firstView) setEnvelopeOpened(true);
          }}
        >
          {envelopeOpened ? (
            <img src={envelope_open} className="envelope envelope-open" />
          ) : (
            <img src={envelope_closed} className="envelope envelope-closed" />
          )}
        </div>
        {svgStateLoaded && (
          <div
            className="final-message-container"
            style={getFinalMessageStyle()}
          >
            <div className="message-text">From: {data.f}</div>
            <div className="message-text">To: {data.t}</div>
          </div>
        )}
        {svgStateLoaded && (
          <div className="message-result-div" style={getTextDivStyle()}>
            {LZString.decompressFromEncodedURIComponent(data.m)}
          </div>
        )}
        {svgStateLoaded && (
          <div className="share-container">
            <button className="close-button" onClick={onCloseValentine}>
              Slay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
