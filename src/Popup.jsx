import Markdown from "react-markdown";
export default function Popup(props) {
  var {
    title,
    body,
    buttonOneText,
    buttonTwoText,
    buttonOneFn,
    buttonTwoFn,
    setPopupState,
  } = props;
  return (
    <div className="popup-container" onClick={() => setPopupState(null)}>
      <div className="popup">
        <div className="popup-text">{title}</div>
        {body &&
          body.map((p, i) => {
            return (
              <div key={"p-" + i} className="popup-body">
                <Markdown>{p}</Markdown>
              </div>
            );
          })}

        <div className="popup-button-container">
          <button
            className="popup-button"
            id="popup-button-1"
            onClick={buttonOneFn}
          >
            {buttonOneText}
          </button>

          {buttonTwoText && (
            <button
              className="popup-button red"
              id="popup-button-2"
              onClick={buttonTwoFn}
            >
              {buttonTwoText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
