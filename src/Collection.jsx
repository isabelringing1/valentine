import MiniValentine from "./MiniValentine";

export default function Collection(props) {
  var { collection, onMiniValentineClicked } = props;
  return (
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
    </div>
  );
}
