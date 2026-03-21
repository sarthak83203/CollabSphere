import {Server} from "socket.io"
const intializeSocket=(server)=>{
    const io=new Server(server);
    return io;
}

export default intializeSocket;