import { useState, useEffect } from "react";
const isMobile = window.innerWidth <= 600;

export default function MiniValentine(props) {
  const { data, index, onMiniValentineClicked } = props;

  var [svgStateLoaded, setSvgStateLoaded] = useState(false);

  var sweetFillColor = "#E53A8F";
  var spicyFillColor = "#ef3737";
  var strokeColor = data.c == "sweet" ? sweetFillColor : spicyFillColor;

  useEffect(() => {
    var svg = setUpValentine();
    document
      .getElementById("mini-valentine-container-" + index)
      .appendChild(svg);
    var path = document.getElementById("path-" + index);
    var svgRect = svg.getBoundingClientRect();
    var pathRect = path.getBoundingClientRect();
    path.style.transform =
      "translate(" +
      -(pathRect.left - svgRect.left) +
      "px, " +
      (svgRect.top - pathRect.top) +
      "px)";

    var width = window.innerHeight / 5;
    var newScaleW = width / pathRect.width;
    var newScaleH = width / pathRect.height;

    path.style.scale = Math.min(newScaleW, newScaleH);
    console.log(svgRect, pathRect);

    setTimeout(() => {
      setSvgStateLoaded(true);
    }, 10);
  }, []);

  const setUpValentine = () => {
    const svgns = "http://www.w3.org/2000/svg";

    // 1. Create the main SVG container element
    const svg = document.createElementNS(svgns, "svg");
    svg.id = "svg-" + index;
    svg.setAttribute("width", window.innerHeight / 5);
    svg.setAttribute("height", window.innerHeight / 5);
    svg.setAttribute(
      "viewBox",
      "0 0 " + window.innerHeight / 5 + " " + window.innerHeight / 5,
    ); // Define the coordinate system
    svg.style.position = "absolute";

    // 2. Create the path element
    const path = document.createElementNS(svgns, "path");
    path.id = "path-" + index;

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
    var path = document.getElementById("path-" + index);
    if (!path) {
      return {};
    }
    var rect = path.getBoundingClientRect();
    return {
      width: rect.width + "px",
      height: rect.height + "px",
      display: "flex",
    };
  };

  return (
    <div
      className="mini-valentine-container"
      id={"mini-valentine-container-" + index}
      onClick={() => onMiniValentineClicked(data)}
    >
      {svgStateLoaded && (
        <div className="mini-message-result-div" style={getTextDivStyle()}>
          {LZString.decompressFromEncodedURIComponent(data.m)}
        </div>
      )}
      {svgStateLoaded && (
        <div className="mini-message-container">
          <div className="mini-message-text">To: {data.t}</div>
          <div className="mini-message-text">From: {data.f}</div>
        </div>
      )}
    </div>
  );
}
