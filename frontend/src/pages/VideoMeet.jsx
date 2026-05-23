import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import io from "socket.io-client";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {

  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState(true);

  const [screenAvailable, setScreenAvailable] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);

  const [username, setUsername] = useState("");

  const getPermissions = async () => {

    // CAMERA
    try {

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setVideoAvailable(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = videoStream;
      }

    } catch (err) {

      console.log("Camera Error:", err);

      setVideoAvailable(false);
    }

    // AUDIO
    try {

      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      setAudioAvailable(true);

    } catch (err) {

      console.log("Audio Error:", err);

      setAudioAvailable(false);
    }

    // SCREEN SHARE
    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    }
  };


  const getUserMediaSuccess = (stream) => {

    try {

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    } catch (e) {
      console.log(e);
    }
  };

  let gotMessageFromServer=(fromId,message)=>{

  }
  let addMessage=()=>{

  }
  let connectToSocketServer=()=>{
    socketRef.current=io.connect(server_url,{secure:false});
    socketRef.current.on('signal',gotMessageFromServer);

    socketRef.current.on("connect",()=>{
      socketRef.current.emit("join-call",window.location.href);
      socketIdRef.current=socketRef.current.id;
      socketRef.current.on("chat-message",addMessage);

      socketRef.current.on("user-left",(id)=>{
        setVideo((videos)=>videos.filter((video)=>video.socketId!==id))
      })
      socketRef.current.on("user-joined",(id,clients)=>{
        clients.forEach((socketListId)=>{
          connections[socketListId]=new RTCPeerConnection(peerConfigConnections);
          connections[socketListId].onicecandidate=(event)=>{
            if(event.candidate!=null){
              socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
            }
            //ICE=Interactive connectivity Establishment-this is basically the protocol
          }
          connections[socketListId].onaddstream=(event)=>{
            let videoExists=localVideoRef.current.find(video=>video.socketId===socketListId);
            if(videoExists){
              setVideo(videos=>{
                const updateVideos=videos.map(video=>{
                  video.socketId===socketListId?{...video,stream:event.stream}:video
                }

                )
                VideoRef.current=updateVideos;
                return updateVideos;
              })
            }else{
              let newVideo={
                socketId:socketListId,
                stream:event.stream,
                autoPlay:true,
                playsInline:true,

              }
              setVideos(videos=>{
                const updatedVideos=[...videos,newVideo];
                VideoRef.current=updatedVideos;
                return updatedVideos;
              })


            }


          }
          if(window.localStream!==undefined && window.localStream!==null){
            connections[socketListId].addStream(window.localStream);

          }else{
            //let blackSlience
          }



        })
        if(id===socketIdRef.current){
          for(let id2 in connections){
            if(id2===socketIdRef.current) continue

            try{
              connections[id2].addStream(window.localStream)

            }catch(err){

            }
            connections[id2].createOffer().then((description)=>{
              connections[id2].setLocalDescription(description)
              .then(()=>{
                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
              }).catch(e=>console.log(e));
            })
          }
        }
      })
    })
  }



  const getUserMedia = () => {

    // STOP OLD STREAM
    if (window.localStream) {

      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // GET NEW STREAM
    navigator.mediaDevices
      .getUserMedia({
        video: video,
        audio: audio,
      })
      .then((stream) => {

        getUserMediaSuccess(stream);

      })
      .catch((e) => {

        console.log("getUserMedia Error:", e);
      });
  };



const connect = () => {

  socketRef.current = io(server_url);

  socketRef.current.on("connect", () => {
    console.log("CONNECTED");
  });

  socketRef.current.on("connect_error", (err) => {
    console.log("ERROR:", err);
  });

  setAskForUsername(false);
};


  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {

    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }

  }, [video, audio]);

 

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        marginTop: "40px",
      }}
    >

      {askForUsername ? (
        <>

          <h2>Enter Into Meet</h2>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />

          <Button
            variant="contained"
            onClick={connect}
          >
            Connect
          </Button>

          {/* VIDEO */}

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "500px",
              height: "350px",
              backgroundColor: "black",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />

          {/* STATUS */}

          <div>

            <p>
              Video Available:
              {videoAvailable ? " Yes" : " No"}
            </p>

            <p>
              Audio Available:
              {audioAvailable ? " Yes" : " No"}
            </p>

            <p>
              Screen Share Available:
              {screenAvailable ? " Yes" : " No"}
            </p>

          </div>

        </>
      ) : null}

    </div>
  );
}