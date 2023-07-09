require("dotenv").config();

const os = require("node:os");
const zmq = require("zeromq");
const cluster = require("cluster");

const Server = require("./server");

//globals
// const sub_socks = {};
// const client_connections = {};
// let serverInstanceInterConnection.PUB_SOCK_PORT;
// const client_socket_specific_sub_socket_message_handler_collection = {};

// async function start_server() {
//   //connect to redis server
//   const redis_client = redis.createClient({
//     url: process.env.REDIS_INTERNAL_CONNECTION_STRING,
//   });
//   try {
//     await redis_client.connect();
//     //server
//     const PORT = process.env.PORT || 5000;

//     const app = express();
//     const server = http.createServer(app);

//     //server static files
//     app.use(express.static("./public"));
//     app.use(cors());

//     app.get("/", (req, res) => {
//       res.end("hello");
//     });

//     server.listen(PORT, function () {
//       console.log(new Date() + " Server is listening on port 5000");
//     });

//     const wsServer = new WebSocketServer({
//       httpServer: server,
//       autoAcceptConnections: false,
//     });

//     function originIsAllowed(origin) {
//       return true;
//     }

//     wsServer.on("request", async function (request) {
//       if (!originIsAllowed(request.origin)) {
//         // Make sure we only accept requests from an allowed origin
//         request.reject();
//         // console.log(
//         //   new Date() +
//         //     " Connection from origin " +
//         //     request.origin +
//         //     " rejected."
//         // );
//         return;
//       }

//       var connection = request.accept();
//       // console.log(new Date() + " Connection accepted.");
//       const client_id = uuidv4();
//       //add client connecton to client_connections object
//       client_connections[client_id] = connection;
//       //check if any element in redis client_sockets
//       //get the lingth of the list
//       if (await redis_client.lLen("client_sockets")) {
//         // console.log("clients num greater than one.");
//         //if yes pop from front and send done to both the clients
//         const remote_client_socket = await redis_client.rPop("client_sockets");

//         if (remote_client_socket) {
//           const remote_client_socket_json = JSON.parse(remote_client_socket);
//           // console.log("got remote_client_socket");
//           // console.log(remote_client_socket_json);
//           if (
//             remote_client_socket_json["server_instance_port"] !==
//             serverInstanceInterConnection.PUB_SOCK_PORT
//           ) {
//             // console.log("remote client connected to another instance");
//             //handle client socket from different server instance
//             //check if remote client is in connected to server or not
//             if (
//               await serverInstanceInterConnection.is_client_socket_open(
//                 remote_client_socket_json["client_id"],
//                 remote_client_socket_json["server_instance_port"],
//                 serverInstanceInterConnection.PUB_SOCK_PORT,
//                 client_id
//               )
//             ) {
//               // console.log("client socket open");
//               //send done to both the client
//               //remote client
//               serverInstanceInterConnection.pub_sock.send([
//                 remote_client_socket_json["server_instance_port"],
//                 JSON.stringify({
//                   command: "pass_data",
//                   client_socket_id: remote_client_socket_json["client_id"],
//                   data: {
//                     type: "utf8",
//                     utf8Data: '{"info":"pipe_established"}',
//                   },
//                 }),
//               ]);
//               connection.sendUTF(
//                 JSON.stringify({
//                   type: "utf8",
//                   utf8Data: '{"info":"pipe_established"}',
//                 })
//               );

//               //send 'share_sdp_offer' command to one client
//               setTimeout(() => {
//                 connection.sendUTF(
//                   JSON.stringify({
//                     type: "utf8",
//                     utf8Data: '{"command":"share_sdp_offer"}',
//                   })
//                 );
//               }, 3000);
//               connection.on("message", (message) => {
//                 console.log(message);
//                 serverInstanceInterConnection.pub_sock.send([
//                   remote_client_socket_json["server_instance_port"],
//                   JSON.stringify({
//                     command: "pass_data",
//                     client_socket_id: remote_client_socket_json["client_id"],
//                     data: message,
//                   }),
//                 ]);
//               });
//             } else {
//               //ideally it should pop another redis client_socket_list
//               //but currently one simple solution is push the client to redis client_socket_list
//               await redis_client.lPush(
//                 "client_sockets",
//                 JSON.stringify({
//                   client_id: client_id,
//                   server_instance_port:
//                     serverInstanceInterConnection.PUB_SOCK_PORT,
//                 })
//               );
//             }
//           } else {
//             //handle client socket form same server instance
//             //check if remote client socket is open
//             if (client_connections[remote_client_socket_json["client_id"]]) {
//               client_connections[remote_client_socket_json["client_id"]].on(
//                 "message",
//                 (message) => {
//                   connection.sendUTF(JSON.stringify(message));
//                 }
//               );
//               connection.on("message", (message) => {
//                 client_connections[
//                   remote_client_socket_json["client_id"]
//                 ].sendUTF(JSON.stringify(message));
//               });
//               client_connections[
//                 remote_client_socket_json["client_id"]
//               ].sendUTF(
//                 JSON.stringify({
//                   type: "utf8",
//                   utf8Data: '{"info":"pipe_established"}',
//                 })
//               );
//               connection.sendUTF(
//                 JSON.stringify({
//                   type: "utf8",
//                   utf8Data: '{"info":"pipe_established"}',
//                 })
//               );

//               setTimeout(() => {
//                 connection.sendUTF(
//                   JSON.stringify({
//                     type: "utf8",
//                     utf8Data: '{"command":"share_sdp_offer"}',
//                   })
//                 );
//               }, 3000);
//             } else {
//               //ideally it should pop another redis client_socket_list
//               //but one simple solution is push the client to redis client_socket_list
//               await redis_client.lPush(
//                 "client_sockets",
//                 JSON.stringify({
//                   client_id: client_id,
//                   server_instance_port:
//                     serverInstanceInterConnection.PUB_SOCK_PORT,
//                 })
//               );
//             }
//           }
//         } else {
//           //this will only happen only there less number of client_sockets in redis or very high traffic
//           //just push te client in the redis client_sockets  and some other server instance will pop it quickly
//           await redis_client.lPush(
//             "client_sockets",
//             JSON.stringify({
//               client_id: client_id,
//               server_instance_port: serverInstanceInterConnection.PUB_SOCK_PORT,
//             })
//           );
//           connection.on("message", (data) => {
//             console.log(data);
//           });
//         }
//       } else {
//         //else psush the client in the redis client_sockets
//         await redis_client.lPush(
//           "client_sockets",
//           JSON.stringify({
//             client_id: client_id,
//             server_instance_port: serverInstanceInterConnection.PUB_SOCK_PORT,
//           })
//         );
//       }
//       connection.on("close", function (reasonCode, description) {
//         //remove client from client_connections and redis connections list
//         delete client_connections[client_id];
//         // console.log(
//         //   new Date() + " Peer " + connection.remoteAddress + " disconnected."
//         // );
//       });
//     });
//   } catch (error) {
//     reject(error);
//   } finally {
//     //await redis_client.disconnect();
//   }
// }

//new NodeInstanceInterConnection for inter server instance communication

true;
(async function () {
  try {
    if (cluster.isPrimary) {
      for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
        cluster.on("exit", (worker, code, signal) => {
          console.log(`sesrver instance ${worker.process.pid} died`);
          cluster.fork();
        });
      }
    } else {
      console.log(`server instance ${process.pid} starting....`);
      const server_instance = new Server();
      try {
        await server_instance.start();
      } catch (error) {
        server_instance.close_instance_interconnection();
      }
    }
  } catch (error) {
    console.log(error);
    // process.exit(1);
  }
})();
