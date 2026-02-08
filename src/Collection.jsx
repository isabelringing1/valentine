import MiniValentine from "./MiniValentine";

export default function Collection(props) {
  var { collection, onMiniValentineClicked, setLastPage, setPage } = props;
  return (
    <div className="collection-container-container">
      <div id="collection-container">
        {Object.values(collection).map((v, i) => {
          return (
            <MiniValentine
              data={v}
              key={"mini-valentine-" + i}
              index={i}
              onMiniValentineClicked={onMiniValentineClicked}
            />
          );
        })}
        <div className="share-container">
          <button
            className="close-button"
            onClick={() => {
              setLastPage("collection");
              setPage("main");
            }}
          >
            Make one?
          </button>
        </div>
      </div>
    </div>
  );
}
