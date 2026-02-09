export default function Popup(props) {
  var {
    title,
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

        <div className="popup-button-container">
          <button
            className="popup-button"
            id="popup-button-1"
            onClick={buttonOneFn}
          >
            {buttonOneText}
          </button>

          <button
            className="popup-button red"
            id="popup-button-2"
            onClick={buttonTwoFn}
          >
            {buttonTwoText}
          </button>
        </div>
      </div>
    </div>
  );
}
