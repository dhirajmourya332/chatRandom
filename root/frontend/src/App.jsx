import { useEffect, useState, useRef } from "react";
import Controls from "./components/Controls";
import VideoContainer from "./components/VideoContainer";

//audio controls icons
import AudioTrackActiveIcon from "./components/AudioTrackActiveIcon";
import AudioTrackDisabledIcon from "./components/AudioTrackDisabledIcon";
//video controls icons
import VideoTrackEnabledIcon from "./components/VideoTrackEnabledIcon";
import VideoTrackDisabledIcon from "./components/VideoTrackDisabledIcon";
import HangupCallSessionIcon from "./components/HangupCallSessionIcon";
import LoadingIcon from "./components/LoadingIcon";

function App() {
  const [mediaConstraint, setMediaConstraint] = useState({
    audio: true,
    video: true,
  });
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const localVideoStreamRef = useRef(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState(null);
  // const remoteVideoStream = useRef(null);
  const rtcPeerConnection = useRef(null);
  const signallingSocket = useRef(null);
  const [_, reRenderPage] = useState(null);
  const [callSessionState, setCallSessionState] = useState("somethinf Random");
  const [mediaPermission, setMediaPermission] = useState(null);

  // function toggleAudioMediaConstraint() {
  //   setMediaConstraint((prevMediaConstraint) => {
  //     const newMediaConstraint = { ...prevMediaConstraint };
  //     newMediaConstraint["audio"] = mediaConstraint["audio"] ? false : true;
  //     return newMediaConstraint;
  //   });
  // }
  // // useEffect(() => {
  // //   //Core
  // //   window.navigator.mediaDevices
  // //     .getUserMedia(mediaConstraint)
  // //     .then((stream) => {
  // //       setLocalVideoStream(stream);
  // //       if (rtcPeerConnection) {
  // //         stream.getTracks().forEach((track) => {
  // //           rtcPeerConnection.addTrack(track, stream);
  // //         });
  // //       }
  // //     })
  // //     .catch(() => {
  // //       alert(
  // //         "You have to give browser the permission to run Webcam and mic ;( "
  // //       );
  // //     });
  // // }, [mediaConstraint, rtcPeerConnection]);

  // // function createNewRtcConnection() {
  // //   const pc = new RTCPeerConnection();
  // //   setRTCPeerConnection(pc);
  // //   pc.onicecandidate = (e) => {
  // //     const message = {
  // //       type: "candidate",
  // //       candidate: null,
  // //     };
  // //     if (e.candidate) {
  // //       message.candidate = e.candidate.candidate;
  // //       message.sdpMid = e.candidate.sdpMid;
  // //       message.sdpMLineIndex = e.candidate.sdpMLineIndex;
  // //     }
  // //     wsRef.current.send(JSON.stringify(message));
  // //   };
  // //   pc.ontrack = (e) => {
  // //     setRemoteVideoStream(e.streams[0]);
  // //   };
  // // }

  // async function createOffer() {
  //   rtcPeerConnectionRef.current
  //     .createOffer()
  //     .then(async (offer) => {
  //       wsRef.current.send(
  //         JSON.stringify({ type: "offer", sdp: offer["sdp"] })
  //       );
  //       rtcPeerConnectionRef.current.setLocalDescription(offer);
  //     })
  //     .catch((error) => console.log(error));
  // }

  // async function handleOffer(offer) {
  //   console.log("handle offer called!");
  //   await rtcPeerConnectionRef.current.setRemoteDescription(offer);
  //   const sdp_answer = await rtcPeerConnectionRef.current.createAnswer();

  //   wsRef.current.send(JSON.stringify({ type: "answer", sdp: sdp_answer.sdp }));
  //   await rtcPeerConnectionRef.current.setLocalDescription(sdp_answer);
  // }
  // async function handleAnswer(answer) {
  //   // console.log(answer);
  //   await rtcPeerConnectionRef.current.setRemoteDescription(answer);
  // }
  // async function handleIceCandidates(candidate) {
  //   console.log("gotIce candidate");
  //   if (!candidate.candidate) {
  //     await rtcPeerConnectionRef.current.addIceCandidate(null);
  //   } else {
  //     await rtcPeerConnectionRef.current.addIceCandidate(candidate);
  //   }
  // }
  // // async function wsMessageHandler(message) {
  // //   const data = JSON.parse(JSON.parse(message)["utf8Data"]);
  // //   console.log(data);
  // //   if (data["info"] && data["info"] === "pipe_established") {
  // //     createNewRtcConnection();
  // //   }
  // //   if (data["command"] && data["command"] === "share_sdp_offer") {
  // //     await createOffer();
  // //   }
  // //   if (data["type"] && data["type"] === "offer") {
  // //     await handleOffer(data);
  // //   }
  // //   if (data["type"] && data["type"] === "answer") {
  // //     console.log("got answer");
  // //     await handleAnswer(data);
  // //   }
  // //   if (data["type"] && data["type"] === "candidate") {
  // //     await handleIceCandidates(data);
  // //   }
  // // }

  // //   async function establishWebSocketWithSignallingServer() {
  // //     return new Promise((resolve, reject) => {
  // //       const socket = new WebSocket("ws://192.168.0.109:5000");
  // //       // Connection opened
  // //       socket.addEventListener("open", (event) => {
  // //         resolve(socket);
  // //       });

  // //       // Listen for messages
  // //       socket.addEventListener("message", (event) => {
  // //         wsMessageHandler(event.data);
  // //       });
  // //       socket.addEventListener("close", () => {
  // //         console.log("ws connection closed!");
  // //         setTimeout(async () => {
  // //           await establishWebSocketWithSignallingServer();
  // //         }, 1000);
  // //       });
  // //     });
  // //   }

  function toggleAudioMediaConstraint(e) {
    e ? e.stopPropagation() : null;

    localVideoStreamRef.current.getAudioTracks()[0].enabled =
      !localVideoStreamRef.current.getAudioTracks()[0].enabled;
    setLocalVideoStream(() => {
      return localVideoStreamRef.current;
    });
    reRenderPage({});
  }

  function toggleVideoMediaConstraint(e) {
    e ? e.stopPropagation() : null;

    localVideoStreamRef.current.getVideoTracks()[0].enabled =
      !localVideoStreamRef.current.getVideoTracks()[0].enabled;
    setLocalVideoStream(() => {
      return localVideoStreamRef.current;
    });
    reRenderPage({});
  }

  function hangUpVideoChatSession(e) {
    e ? e.stopPropagation() : null;

    if (callSessionState === "connected") {
      setCallSessionState("closed");
      if (rtcPeerConnection.current) {
        rtcPeerConnection.current.close();
      }
    }
    if (signallingSocket) {
      signallingSocket.current.close();
    }
  }

  async function handleIceCandidates(candidate) {
    console.log("gotIce candidate");
    if (!candidate.candidate) {
      await rtcPeerConnection.current.addIceCandidate(null);
    } else {
      await rtcPeerConnection.current.addIceCandidate(candidate);
    }
  }

  async function handleAnswer(answer) {
    // console.log(answer);
    await rtcPeerConnection.current.setRemoteDescription(answer);
  }

  async function handleOffer(offer) {
    console.log("handle offer called!");
    await rtcPeerConnection.current.setRemoteDescription(offer);
    const sdp_answer = await rtcPeerConnection.current.createAnswer();

    signallingSocket.current.send(
      JSON.stringify({ type: "answer", sdp: sdp_answer.sdp })
    );
    await rtcPeerConnection.current.setLocalDescription(sdp_answer);
  }

  async function createOffer() {
    console.log("second");
    rtcPeerConnection.current
      .createOffer()
      .then(async (offer) => {
        signallingSocket.current.send(
          JSON.stringify({ type: "offer", sdp: offer["sdp"] })
        );
        await rtcPeerConnection.current.setLocalDescription(offer);
      })
      .catch((error) => console.log(error));
  }

  async function createNewRtcConnection() {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        mediaConstraint
      );
      setLocalVideoStream(stream);
      localVideoStreamRef.current = stream;
      rtcPeerConnection.current = new RTCPeerConnection();

      rtcPeerConnection.current.oniceconnectionstatechange = () => {
        switch (rtcPeerConnection.current.iceConnectionState) {
          case "new":
          case "checking":
            setCallSessionState("connecting");
            break;
          case "connected":
            setCallSessionState("connected");
            break;
          case "disconnected":
          case "closed":
          case "failed":
            console.log("peer connection ended!");
            setCallSessionState("closed");
            hangUpVideoChatSession();
            break;
          default:
            setCallSessionState("undefined");
            break;
        }
      };
      rtcPeerConnection.current.onicecandidate = (e) => {
        const iceCandidate = {
          type: "candidate",
          candidate: null,
        };
        if (e.candidate) {
          iceCandidate.candidate = e.candidate.candidate;
          iceCandidate.sdpMid = e.candidate.sdpMid;
          iceCandidate.sdpMLineIndex = e.candidate.sdpMLineIndex;
        }
        signallingSocket.current.send(JSON.stringify(iceCandidate));
      };
      rtcPeerConnection.current.ontrack = (e) => {
        setRemoteVideoStream(e.streams[0]);
      };
      if (rtcPeerConnection.current) {
        stream.getTracks().forEach(async (track) => {
          await rtcPeerConnection.current.addTrack(track, stream);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function wsMessageHandler(message) {
    console.log(message);
    const data = JSON.parse(JSON.parse(message)["utf8Data"]);
    console.log(data);
    if (data["info"] && data["info"] === "pipe_established") {
      await createNewRtcConnection();
    }
    if (data["command"] && data["command"] === "share_sdp_offer") {
      await createOffer();
    }
    if (data["type"] && data["type"] === "offer") {
      await handleOffer(data);
    }
    if (data["type"] && data["type"] === "answer") {
      console.log("got answer");
      await handleAnswer(data);
    }
    if (data["type"] && data["type"] === "candidate") {
      await handleIceCandidates(data);
    }
  }

  function establishWebsocketWithSignallingServer() {
    const ws_url =
      (window.location.protocol === "https:" ? "wss:" : "ws:") +
      "//" +
      "chat-random-back.onrender.com" +
      "/";
    signallingSocket.current = new WebSocket(ws_url);
    // Connection opened
    signallingSocket.current.addEventListener("open", () => {});

    // Listen for messages
    signallingSocket.current.addEventListener("message", async (event) => {
      await wsMessageHandler(event.data);
    });
    signallingSocket.current.addEventListener("close", () => {
      console.log("ws connection closed!");
      setTimeout(() => {
        establishWebsocketWithSignallingServer();
      }, 1000);
    });
  }

  useEffect(() => {
    if (!mediaPermission) {
      window.navigator.mediaDevices
        .getUserMedia(mediaConstraint)
        .then((stream) => {
          setLocalVideoStream(stream);
          localVideoStreamRef.current = stream;
          setMediaPermission(true);
        })
        .catch((error) => {
          console.log("cam blocked");
          setMediaPermission(null);
        });
    }
  }, [mediaPermission]);

  useEffect(() => {
    //

    //
    if (mediaPermission) {
      console.log("kkkkkkk--------------------");
      signallingSocket.current
        ? null
        : establishWebsocketWithSignallingServer();
      return () => {
        if (rtcPeerConnection.current) {
          rtcPeerConnection.current.close();
          signallingSocket.current.close();
        }
      };
    }
  }, [mediaPermission]);

  // useEffect(() => {
  //   (async function () {
  //     const stream = await window.navigator.mediaDevices.getUserMedia(
  //       mediaConstraint
  //     );
  //     setLocalVideoStream(stream);
  //     if (rtcPeerConnection.current) {
  //       stream.getTracks().forEach(async (track) => {
  //         console.log("first");
  //         await rtcPeerConnection.current.addTrack(track, stream);
  //       });
  //     }
  //   })();
  //   //Core
  //   // window.navigator.mediaDevices
  //   //   .getUserMedia(mediaConstraint)
  //   //   .then((stream) => {
  //   //     setLocalVideoStream(stream);
  //   //     if (rtcPeerConnection.current) {
  //   //       stream.getTracks().forEach(async (track) => {
  //   //         console.log("first");
  //   //         await rtcPeerConnection.current.addTrack(track, stream);
  //   //       });
  //   //     }
  //   //   })
  //   //   .catch(() => {
  //   //     alert(
  //   //       "You have to give browser the permission to run Webcam and mic ;( "
  //   //     );
  //   //   });
  // }, [mediaConstraint]);
  return mediaPermission ? (
    <>
      <div className="flex flex-col md:flex-row w-full h-screen gap-3 p-2 bg-gray-600">
        <div className="w-full h-1/2 md:w-1/2 md:h-full bg-black rounded-md overflow-hidden">
          <VideoContainer srcObject={remoteVideoStream} />
        </div>
        <div className="w-full h-1/2 md:w-1/2 md:h-full bg-black rounded-md overflow-hidden">
          <VideoContainer srcObject={localVideoStream} />
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 p-2">
        <Controls
          audioIcon={
            localVideoStream && localVideoStream.getAudioTracks()[0].enabled ? (
              <AudioTrackDisabledIcon />
            ) : (
              <AudioTrackActiveIcon />
            )
          }
          videoIcon={
            localVideoStream && localVideoStream.getVideoTracks()[0].enabled ? (
              <VideoTrackDisabledIcon />
            ) : (
              <VideoTrackEnabledIcon />
            )
          }
          actionIcon={
            callSessionState === "connected" ? (
              <HangupCallSessionIcon />
            ) : (
              <LoadingIcon />
            )
          }
          onAudioButtonClick={toggleAudioMediaConstraint}
          onVideoButtonclick={toggleVideoMediaConstraint}
          onActionButtonClick={hangUpVideoChatSession}
        />
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col gap-5">
        <div className="flex mx-auto w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36">
          <svg
            height="100%"
            width="100%"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 512 512"
            xmlSpace="preserve"
          >
            <g>
              <g>
                <path
                  style={{ fill: "#231F20" }}
                  d="M388.227,0H123.774C76.606,0,38.232,38.374,38.232,85.541v215.935
			c0,47.167,38.374,85.541,85.541,85.541h44.258l-8.727,103.571c-1.454,17.269,18.376,27.681,31.795,17.235l155.206-120.805h41.92
			c47.167,0,85.541-38.374,85.541-85.541V85.541C473.768,38.374,435.394,0,388.227,0z M326.159,210.604l-120.578,69.615
			c-13.122,7.578-29.61-1.911-29.61-17.095v-139.23c0-15.19,16.48-24.678,29.61-17.095l120.578,69.615
			C339.311,184.007,339.292,203.022,326.159,210.604z"
                />
              </g>
            </g>
          </svg>
        </div>
        <h2 className="flex items-center justify-center font-semibold sm:text-lg md:text-xl">
          chatRandom
        </h2>
      </div>
    </div>
  );
}

export default App;
