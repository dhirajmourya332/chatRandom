import { useEffect, useRef } from "react";

export default function VideoContainer(props) {
  const video_ref = useRef(null);
  useEffect(() => {
    if (props["srcObject"]) {
      video_ref.current.srcObject = props["srcObject"];
      //   video_ref.current.onLoadMetadata = (e) => {
      //     video_ref.current.play();
      //   };
    }
  });
  return (
    <div className="relative flex items-center justify-center h-full w-full ">
      <video
        controls={false}
        className="w-full"
        ref={video_ref}
        autoPlay
      ></video>
    </div>
  );
}
