import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const server_url = "http://localhost:8000";

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

let connections = {};

export default function VideoMeetComponent() {

  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoRef = useRef();

  const [askForUsername, setAskForUsername] =
    useState(true);

  const [username, setUsername] = useState("");

  const [videos, setVideos] = useState([]);

  // ================= SIGNAL =================

  const gotMessageFromServer = async (
    fromId,
    message
  ) => {

    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    // SDP

    if (signal.sdp) {

      await connections[fromId]
        .setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );

      if (signal.sdp.type === "offer") {

        const description =
          await connections[
            fromId
          ].createAnswer();

        await connections[
          fromId
        ].setLocalDescription(description);

        socketRef.current.emit(
          "signal",
          fromId,
          JSON.stringify({
            sdp: connections[fromId]
              .localDescription,
          })
        );

      }
    }

    // ICE

    if (signal.ice) {

      try {

        await connections[
          fromId
        ].addIceCandidate(
          new RTCIceCandidate(signal.ice)
        );

      } catch (e) {

        console.log(e);

      }
    }
  };

  // ================= SOCKET =================

  const connectToSocketServer = () => {

    socketRef.current = io(server_url);

    socketRef.current.on(
      "signal",
      gotMessageFromServer
    );

    socketRef.current.on(
      "connect",
      () => {

        socketIdRef.current =
          socketRef.current.id;

        console.log("CONNECTED");

        socketRef.current.emit(
          "join-call",
          window.location.href
        );

        // USER JOINED

        socketRef.current.on(
          "user-joined",
          async (id, clients) => {

            clients.forEach(
              async (socketListId) => {

                if (
                  connections[
                    socketListId
                  ]
                ) {
                  return;
                }

                // CREATE PEER

                connections[
                  socketListId
                ] =
                  new RTCPeerConnection(
                    peerConfigConnections
                  );

                // SEND ICE

                connections[
                  socketListId
                ].onicecandidate = (
                  event
                ) => {

                  if (
                    event.candidate
                  ) {

                    socketRef.current.emit(
                      "signal",
                      socketListId,
                      JSON.stringify({
                        ice: event.candidate,
                      })
                    );

                  }
                };

                // RECEIVE REMOTE STREAM

                connections[
                  socketListId
                ].ontrack = (
                  event
                ) => {

                  const remoteStream =
                    event.streams[0];

                  setVideos(
                    (prevVideos) => {

                      const found =
                        prevVideos.find(
                          (
                            video
                          ) =>
                            video.socketId ===
                            socketListId
                        );

                      if (found)
                        return prevVideos;

                      return [
                        ...prevVideos,
                        {
                          socketId:
                            socketListId,
                          stream:
                            remoteStream,
                        },
                      ];
                    }
                  );
                };

                // ADD LOCAL TRACKS

                if (
                  window.localStream
                ) {

                  window.localStream
                    .getTracks()
                    .forEach(
                      (track) => {

                        connections[
                          socketListId
                        ].addTrack(
                          track,
                          window.localStream
                        );

                      }
                    );
                }
              }
            );

            // CREATE OFFER

            if (
              id ===
              socketIdRef.current
            ) {

              for (let id2 in connections) {

                if (
                  id2 ===
                  socketIdRef.current
                )
                  continue;

                const description =
                  await connections[
                    id2
                  ].createOffer();

                await connections[
                  id2
                ].setLocalDescription(
                  description
                );

                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({
                    sdp: connections[id2]
                      .localDescription,
                  })
                );
              }
            }
          }
        );

        // USER LEFT

        socketRef.current.on(
          "user-left",
          (id) => {

            setVideos(
              (prevVideos) =>
                prevVideos.filter(
                  (video) =>
                    video.socketId !== id
                )
            );

          }
        );
      }
    );
  };

  // ================= CONNECT =================

  const connect = async () => {

    try {

      // GET CAMERA + MIC

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          }
        );

      // SAVE STREAM

      window.localStream = stream;

      // SHOW LOCAL VIDEO

      if (localVideoRef.current) {

        localVideoRef.current.srcObject =
          stream;

        await localVideoRef.current.play();

      }

      // START SOCKET

      connectToSocketServer();

      // HIDE LOGIN

      setAskForUsername(false);

    } catch (err) {

      console.log(
        "Camera Error:",
        err
      );

      alert(
        "Cannot access camera or microphone"
      );

    }
  };

  // ================= CLEANUP =================

  useEffect(() => {

    return () => {

      if (window.localStream) {

        window.localStream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

      }

      if (socketRef.current) {

        socketRef.current.disconnect();

      }

    };

  }, []);

  // ================= UI =================

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "40px",
        gap: "20px",
      }}
    >

      {askForUsername ? (

        <>
          <h2>
            Enter Into Meet
          </h2>

          <TextField
            label="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
          />

          <Button
            variant="contained"
            onClick={connect}
          >
            Connect
          </Button>
        </>

      ) : (

        <>
          <h2>
            Connected
          </h2>

          {/* LOCAL VIDEO */}

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "500px",
              height: "350px",
              backgroundColor:
                "black",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />

          {/* REMOTE VIDEOS */}

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent:
                "center",
            }}
          >

            {videos.map(
              (video) => (

                <video
                  key={
                    video.socketId
                  }
                  autoPlay
                  playsInline
                  ref={(ref) => {

                    if (
                      ref &&
                      video.stream
                    ) {

                      ref.srcObject =
                        video.stream;

                    }

                  }}
                  style={{
                    width: "300px",
                    height:
                      "220px",
                    backgroundColor:
                      "black",
                    borderRadius:
                      "10px",
                    objectFit:
                      "cover",
                  }}
                />

              )
            )}

          </div>
        </>

      )}

    </div>
  );
}