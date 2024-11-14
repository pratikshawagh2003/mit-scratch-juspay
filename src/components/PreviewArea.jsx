import { useState, useContext, useEffect, useCallback, useRef } from "react";
import CatSprite from "./CatSprite";
import Draggable from "react-draggable";
import { Flag, Github, RotateCcw, Undo2Icon } from "lucide-react";
import { GlobalContext } from "../App";
import { throttle } from "lodash";

export default function PreviewArea() {
  const { data } = useContext(GlobalContext);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [animation, setAnimation] = useState(null);
  const [text, setText] = useState({
    message: "",
    duration: 0,
    animation: false,
  });
  const [size, setSize] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHeroFeature, setShowHeroFeature] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState(false);
  // const [catPositions, setCatPositions] = useState({ cat1: 0, cat2: 200 });
  // const [catDirection, setCatDirection] = useState({ cat1: 1, cat2: -1 }); // 1 means towards each other, -1 means away from each other
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  const pointTowardsMouse = () => {
    const rect = document.getElementById("sprite").getBoundingClientRect();
    const svgCenterX = rect.left + rect.width / 2;
    const svgCenterY = rect.top + rect.height / 2;

    const deltaX = mousePositionRef.current.x - svgCenterX;
    const deltaY = mousePositionRef.current.y - svgCenterY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  };

  const filterByEventType = (data, event_type) => {
    return data.filter((item) =>
      item.items.some((action) => action.type === event_type)
    );
  };

  const startAnimation = useCallback(
    (event_type = "flag_clicked") => {
      let _data = data.groups;
      if (_data && _data.length > 0) {
        const actions = filterByEventType(_data, event_type);
        if (actions.length > 0) {
          setHistory((prev) => [...prev, { position, rotation, size, text }]);
          actions.forEach((action) => executeAction(action.items, 1));
        }
      }
    },
    [data, position, rotation, size, text, animation]
  );

  useEffect(() => {
    if (data?.clicked?.type)
      handleAction(data?.clicked?.type, data?.clicked?.initialValue);
  }, [data.clicked]);

  const handleAction = (type, value) => {
    switch (type) {
      case "move":
        setPosition({ x: position.x + parseInt(value.x) });
        break;
      case "go_to":
        setPosition({ x: parseInt(value.x), y: parseInt(value.y) });
        break;
      case "random":
        setPosition({ x: Math.random() * 400, y: Math.random() * 400 });
        break;
      case "clockwise":
        setRotation(rotation + parseInt(value.rotation));
        break;
      case "anticlockwise":
        setRotation(rotation - parseInt(value.rotation));
        break;
      case "glide":
        setAnimation({ type: "glide", duration: parseInt(value.delay) * 1000 });
        setPosition({ x: parseInt(value.x), y: parseInt(value.y) });
        setTimeout(() => {
          setAnimation(null);
        }, parseInt(value.delay) * 1000);
        break;
      case "custom_action":
        setAnimation({ type: "glide", duration: parseInt(value.delay) * 1000 });
        setPosition({
          x: position.x + value.x,
          y: position.y + parseInt(value.y),
        });
        setTimeout(() => {
          setAnimation(null);
        }, parseInt(value.delay) * 1000);
        break;
      case "glide_random":
        setAnimation({ type: "glide", duration: parseInt(value.delay) * 1000 });
        setPosition({ x: Math.random() * 400, y: Math.random() * 400 });
        setTimeout(() => {
          setAnimation(null);
        }, parseInt(value.seconds) * 1000);
        break;
      case "point_in_direction":
        setRotation(parseInt(value.direction));
        break;
      case "mouse_pointer":
        setRotation(pointTowardsMouse());
        setAnimation(null);
        break;
      case "change_x_by":
        setPosition((prev) => ({ ...prev, x: prev.x + parseInt(value.x) }));
        break;
      case "set_x":
        setPosition((prev) => ({ ...prev, x: parseInt(value.x) }));
        break;
      case "change_y_by":
        setPosition((prev) => ({ ...prev, y: prev.y + parseInt(value.y) }));
        break;
      case "set_y":
        setPosition((prev) => ({ ...prev, y: value.y }));
        break;
      case "say_for_seconds":
        setText({
          message: value.message,
          duration: parseInt(value.delay) * 1000,
          animation: false,
        });
        setTimeout(
          () => setText({ message: "", duration: 0, animation: false }),
          parseInt(value.delay) * 1000
        );
        break;
      case "say":
        setText({ message: value.message, duration: 100, animation: false });
        break;
      case "think_for_seconds":
        setText({
          message: value.message,
          duration: parseInt(value.delay) * 1000,
          animation: true,
        });
        setTimeout(
          () => setText({ message: "", duration: 0, animation: false }),
          parseInt(value.delay) * 1000
        );
        break;
      case "think":
        setText({ message: value.message, duration: 100, animation: true });
        break;
      case "change_size":
        setSize(size + value.size);
        break;
      default:
        break;
    }
  };

  const executeAction = (action_list, index) => {
    const { type, initialValue } = action_list[index];
    setPlaying(true);
    handleAction(type, initialValue);
    if (action_list && index < action_list.length - 1) {
      setTimeout(() => executeAction(action_list, index + 1), 10);
    } else {
      setPlaying(false);
    }
  };

  const undoAction = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setPosition(lastState.position);
      setRotation(lastState.rotation);
      setSize(lastState.size);
      setText(lastState.text);
      setHistory(history.slice(0, -1));
    }
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setSize(0);
    setText({ message: "", duration: 0, animation: false });
    setHistory([]);
    setPlaying(false);
    setAnimation(null);
  };

  const addSprite = () => {
    // Trigger file input click to open file upload dialog
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Perform further actions with the uploaded file (e.g., adding a new sprite)
      console.log("File selected:", file);
      // Reset file input value to allow re-uploading the same file
      event.target.value = "";
    }
  };

  const openHeroFeature = () => {
    setShowHeroFeature(true);
  };

  const closeHeroFeature = () => {
    setShowHeroFeature(false);
  };
  const [isColliding, setIsColliding] = useState(false);
  const [catPositions, setCatPositions] = useState({ cat1: 0, cat2: 200 });
  const [catDirection, setCatDirection] = useState({ cat1: 1, cat2: -1 });
  const [originalCat2Position] = useState(200); // Store initial position of cat2

  // Adjusted code to make the cats face the direction they are moving in
  const moveCats = () => {
    setCatPositions((prevPositions) => {
      let { cat1, cat2 } = prevPositions;

      // Move the cats based on direction
      cat1 += catDirection.cat1 * 2;
      if (cat2 !== originalCat2Position || catDirection.cat2 === -1) {
        // Allow cat2 to move until it reaches its original position
        cat2 += catDirection.cat2 * 2;
      }

      // Prevent cats from going out of bounds
      const windowWidth = window.innerWidth;
      if (cat1 < 0) cat1 = 0;
      if (cat1 > windowWidth) cat1 = windowWidth;
      if (cat2 < 0) cat2 = 0;
      if (cat2 > windowWidth) cat2 = windowWidth;

      // Check for collision
      if (Math.abs(cat1 - cat2) < 30) {
        if (!isColliding) {
          // Toggle collision state
          setIsColliding(true);

          // Reverse the direction after collision and adjust their facing direction
          setCatDirection((prevDirection) => ({
            cat1: -prevDirection.cat1,
            cat2: -prevDirection.cat2,
          }));
        }

        // After collision, reverse positions to simulate the mirror image effect
        return {
          cat1,
          cat2,
        };
      } else {
        // Reset collision when cats are apart
        setIsColliding(false);
      }

      // If no collision, maintain the current positions
      return { cat1, cat2 };
    });
  };

  useEffect(() => {
    if (heroAnimation) {
      const interval = setInterval(moveCats, 50); // Adjust interval for smoothness

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [heroAnimation, moveCats]);

  // Start Animation Handler
  const startHeroAnimation = () => {
    setHeroAnimation(true);
  };

  const runAllActions = () => {
    let _data = data.groups;
    if (_data && _data.length > 0) {
      const actions = _data.flatMap((group) => group.items);
      setHistory((prev) => [...prev, { position, rotation, size, text }]);
      actions.forEach((action) => executeAction([action], 0, true));
    }
  };

  useEffect(() => {
    const handleMouseMove = throttle((event) => {
      mousePositionRef.current = { x: event.clientX, y: event.clientY };
    }, 200);

    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        startAnimation("space_clicked");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [startAnimation]);

  return (
    <div className="flex-none w-full">
      <div className="flex flex-row p-4 gap-4 justify-end pr-6 z-10">
        {history.length > 0 && (
          <div
            onClick={undoAction}
            title="Undo"
            className="cursor-pointer self-center flex flex-row gap-2"
          >
            <p className="font-semibold text-black">{history.length}</p>
            <Undo2Icon color="black" />
          </div>
        )}
        <div
          onClick={() => startAnimation("flag_clicked")}
          title={"Run"}
          className={`cursor-pointer self-center ${
            playing ? "pointer-events-none" : ""
          }`}
        >
          <Flag fill={playing ? "gray" : "#00ff11"} color="#00ff11" />
        </div>

        <div>
          <button
            className="bg-green-500 text-white text-sm px-4 py-2 rounded-md"
            onClick={runAllActions}
          >
            Run All
          </button>
        </div>

        <div
          onClick={openHeroFeature} // Only open the Hero Feature when this button is clicked
          title={"Hero Feature"}
          className="cursor-pointer self-center"
        >
          <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md">
            Hero Feature
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*" // Accept only image files
        />
        <button className="addSpriteButton" onClick={addSprite}>
          Add Sprite
        </button>

        <div
          onClick={reset}
          title="Reset"
          className="cursor-pointer self-center"
        >
          <RotateCcw color="black" />
        </div>
        <div
          onClick={() =>
            window.open("https://github.com/pratikshawagh2003", "_blank")
          }
          title="Pratiksha Wagh"
          className="cursor-pointer ml-1 bg-gray-400 rounded-xl p-1"
        >
          <Github />
        </div>
      </div>

      {showHeroFeature && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-1/3">
            <h2 className="text-2xl font-bold mb-4">HERO FEATURE</h2>
            <div className="flex justify-between mb-4">
              <div className="relative">
                <div className="flex justify-between mb-4">
                  <div className="relative" style={{ left: catPositions.cat1 }}>
                    <CatSprite
                      style={{
                        transform: `scaleX(${
                          catDirection.cat1 === 1 ? 1 : -1
                        })`,
                      }}
                      size={size}
                    />
                  </div>
                  <div className="relative" style={{ left: catPositions.cat2 }}>
                    <CatSprite
                      style={{
                        transform: `scaleX(${
                          catDirection.cat2 === 1 ? 1 : -1
                        })`,
                      }}
                      size={size}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={startHeroAnimation}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Start Animation
            </button>
            <button
              onClick={closeHeroFeature}
              className="bg-red-500 text-white px-4 py-2 rounded-md mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      <Draggable className="h-[calc(100vh_-_4rem)] overflow-y-auto p-2 relative border">
        <div
          className="relative"
          style={{
            left: position.x,
            top: position.y,
            transition: animation ? `${animation.duration || 0}ms` : "none",
          }}
          onClick={() => startAnimation("sprite_clicked")}
        >
          <CatSprite
            style={{ transform: `rotate(${rotation}deg)` }}
            size={size}
            tooltipText={text.message}
            showTooltip={text.duration > 0}
            animation={text?.animation}
          />
        </div>
      </Draggable>
    </div>
  );
}
