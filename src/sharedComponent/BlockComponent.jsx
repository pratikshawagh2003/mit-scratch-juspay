/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { Flag, GripHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

function BlockComponent({
  type,
  category,
  initialValue,
  onAction,
  onClickAction,
}) {
  const [values, setValues] = useState(initialValue);

  const handleInputChange = ({ target: { name, value } }) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (typeof onAction === "function")
      onAction({ type: type, values: values });
  }, [values]);

  const renderBlockContent = () => {
    switch (type) {
      case "move":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">move</span>
            <input
              type="number"
              name="x"
              value={values.x}
              onChange={handleInputChange}
              className="w-8 text-centern"
            />
            <span className="text-white font-semibold">steps</span>
          </div>
        );
      case "clockwise":
      case "anticlockwise":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">
              turn {type === "clockwise" ? "⟳" : "⟲"}
            </span>
            <input
              type="number"
              name="rotation"
              value={values.rotation}
              onChange={handleInputChange}
              className="w-8 text-center"
            />
            <span className="text-white font-semibold">degrees</span>
          </div>
        );
      case "go_to":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">go to x:</span>
            <input
              type="number"
              name="x"
              value={values.x}
              onChange={handleInputChange}
              className="w-8 text-center"
            />
            <span className="text-white font-semibold">y:</span>
            <input
              type="number"
              name="y"
              value={values.y}
              onChange={handleInputChange}
              className="w-8 text-center"
            />
          </div>
        );
      case "glide":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">glide</span>
            <input
              type="number"
              name="delay"
              value={values.delay}
              onChange={handleInputChange}
              className="w-12 text-center"
            />
            <span className="text-white font-semibold">secs to x:</span>
            <input
              type="number"
              name="x"
              value={values.x}
              onChange={handleInputChange}
              className="w-8 text-center"
            />
            <span className="text-white font-semibold">y:</span>
            <input
              type="number"
              name="y"
              value={values.y}
              onChange={handleInputChange}
              className="w-8 text-center"
            />
          </div>
        );
      case "random":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">
              go to random position
            </span>
          </div>
          //pratiksha wagh
        );
      case "mouse_pointer":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">
              points towards mouse
            </span>
          </div>
        );
      case "say_for_seconds":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">say</span>
            <input
              type="text"
              name="message"
              value={values.message}
              onChange={handleInputChange}
              className="w-16 text-center "
            />
            <span className="text-white font-semibold">for</span>
            <input
              type="number"
              name="delay"
              value={values.delay}
              onChange={handleInputChange}
              className="w-8 text-center "
            />
            <span className="text-white font-semibold">secs</span>
          </div>
        );
      case "say":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">say</span>
            <input
              type="text"
              name="message"
              value={values.message}
              onChange={handleInputChange}
              className="w-16 text-center "
            />
          </div>
        );
      case "change_size":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">change size by</span>
            <input
              type="number"
              name="size"
              value={values.size}
              onChange={handleInputChange}
              className="w-16 text-center"
            />
          </div>
        );
      case "flag_clicked":
        return (
          <div className="flex items-center space-x-2 font-semibold">
            when <Flag className="mx-2" fill="#00ff11" /> clicked
          </div>
        );
      case "space_clicked":
        return (
          <div className="flex items-center space-x-2 font-semibold">
            when space key clicked
          </div>
        );
      case "sprite_clicked":
        return (
          <div className="flex items-center space-x-2 font-semibold">
            when this sprite clicked
          </div>
        );

      default:
        return <div></div>;
    }
  };

  const returnColor = () => {
    const colors = {
      motion: "bg-[#4d97fe]",
      looks: "bg-[#9966ff]",
      events: "bg-[#ffbf00]",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div
      className={`p-2 mb-4 ${returnColor()} text-sm rounded-lg shadow-lg w-fit flex flex-row gap-1 active:outline ring-offset-2 active:ring ring-blue-500`}
      id={Date.now().toString(16)}
      onClick={() => onClickAction(type)}
    >
      <GripHorizontal
        size={20}
        color={category === "events" ? "black" : "white"}
        className="self-center"
      />
      {renderBlockContent()}
    </div>
  );
}

export default BlockComponent;
