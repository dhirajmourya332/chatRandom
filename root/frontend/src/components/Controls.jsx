import { useEffect, useState, useRef } from "react";

export default function Controls(props) {
  const audioActionButton = useRef(null);
  const videoActionButton = useRef(null);
  const videoChatActionButton = useRef(null);

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const handleControlsMouseOver = () => {
    if (!isControlsVisible) setIsControlsVisible(true);
  };
  const handleControlsMouseOut = () => {
    setIsControlsVisible(false);
  };
  const handleControlsClick = () => {
    setIsControlsVisible(true);
    setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  };

  const debounceTimer = useRef(null);
  function keyDebounce(fun, delay) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fun ? fun() : null;
    }, delay);
  }
  // class KeyUpDebounce {
  //   constructor(props) {
  //     this.timer = null;
  //     this.delay = props.delay;
  //   }
  //   exec = (func) => {
  //     if (this.timer) clearTimeout(this.timer);
  //     setTimeout(func, this.delay);
  //   };
  // }
  useEffect(() => {
    // const keyUpDebounce = new KeyUpDebounce({delay:500})
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape" && videoChatActionButton.current) {
        keyDebounce(props["onActionButtonClick"], 300);
      }
      if (e.key === "a" && videoActionButton.current) {
        keyDebounce(props["onAudioButtonClick"], 300);
      }
      if (e.key === "v" && audioActionButton.current) {
        keyDebounce(props["onVideoButtonclick"], 300);
      }
    });
    return () => {
      window.removeEventListener("keyup", keyDebounce);
    };
  }, [props]);

  useEffect(() => {
    setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  }, []);
  return (
    <div
      className={`flex flex-row p-3 px-5 items-center gap-7 justify-evenly bg-gray-600 rounded-t-md ${
        isControlsVisible
          ? " delay-0 opacity-100"
          : " delay-[3s] transition-opacity opacity-0"
      }`}
      onMouseOver={handleControlsMouseOver}
      onMouseLeave={handleControlsMouseOut}
      onClick={handleControlsClick}
    >
      <button
        ref={audioActionButton}
        className="lg:h-16 lg:w-16 md:h-14 md:w-14 w-12 h-12 bg-gray-100 rounded-full lg:p-4 md:p-3 p-2"
        onClick={props["onAudioButtonClick"]}
        disabled={isControlsVisible ? false : true}
      >
        {props["audioIcon"]}
      </button>
      <button
        ref={videoActionButton}
        className="lg:h-16 lg:w-16 md:h-14 md:w-14 w-12 h-12 bg-gray-100 rounded-full lg:p-4 md:p-3 p-2"
        onClick={props["onVideoButtonclick"]}
        disabled={isControlsVisible ? false : true}
      >
        {props["videoIcon"]}
      </button>
      <button
        ref={videoChatActionButton}
        className="lg:h-16 lg:w-16 md:h-14 md:w-14 w-12 h-12 bg-gray-100 rounded-full lg:p-4 md:p-3 p-2"
        onClick={props["onActionButtonClick"]}
        disabled={isControlsVisible ? false : true}
      >
        {props["actionIcon"]}
      </button>
    </div>
  );
}
