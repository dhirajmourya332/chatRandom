//zmq socket if a process died
require("dotenv").config();
const http = require("http");
const redis = require("redis");
const { v4: uuidv4 } = require("uuid");
const WebSocketServer = require("websocket").server;
const express = require("express");
const os = require("node:os");
const cors = require("cors");

const NodeInstanceInterConnection = require("./instance_interconnection/main");

// //server
// const PORT = process.env.PORT || 5000;
// const WebSocketServer = require("websocket").server;
// const express = require("express");
// const app = express();
// const http = require("http");
// const server = http.createServer(app);

// //server static files
// app.use(express.static("./public"));

// app.get("/", (req, res) => {
//   res.end("hello");
// });

// server.listen(PORT, function () {
//   console.log(new Date() + " Server is listening on port 5000");
// });

// const wsServer = new WebSocketServer({
//   httpServer: server,
//   autoAcceptConnections: false,
// });

// function originIsAllowed(origin) {
//   return true;
// }

// wsServer.on("request", async function (request) {
//   if (!originIsAllowed(request.origin)) {
//     // Make sure we only accept requests from an allowed origin
//     request.reject();
//     console.log(
//       new Date() + " Connection from origin " + request.origin + " rejected."
//     );
//     return;
//   }

//   var connection = request.accept();
//   console.log(new Date() + " Connection accepted.");
//   const client_id = uuidv4();
//   //add client connecton to client_connections object
//   client_connections[client_id] = connection;
//   //add client to redis connections list

//   connection.on("message", function (message) {
//     if (message.type === "utf8") {
//       console.log("Received Message: " + message.utf8Data);
//       connection.sendUTF(message.utf8Data);
//     } else if (message.type === "binary") {
//       console.log(
//         "Received Binary Message of " + message.binaryData.length + " bytes"
//       );
//       connection.sendBytes(message.binaryData);
//     }
//   });
//   connection.on("close", function (reasonCode, description) {
//     //remove client from client_connections and redis connections list
//     console.log(
//       new Date() + " Peer " + connection.remoteAddress + " disconnected."
//     );
//   });
// });

// //interconnection****************************************************************
// const zmq = require("zeromq");
// const os = require("os");

// async function __init__pub_sock(PUB_SOCK_PORT) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const pub_sock = zmq.socket("pub");
//       pub_sock.bindSync(`tcp://127.0.0.1:${PUB_SOCK_PORT}`);
//       resolve(pub_sock);
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// async function sub_socket(socket_port, subscribe_to) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const sub_sock = zmq.socket("sub");
//       sub_sock.connect(`tcp://127.0.0.1:${socket_port}`);
//       sub_sock.subscribe(subscribe_to);
//       sub_sock.on("message", sub_socket_message_handler);
//       resolve(sub_sock);
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// async function sub_socket_message_handler(topic, message) {}

// true;
// (async function () {
//   //connect to redis server
//   const redis_client = redis.createClient({
//     url: process.env.REDIS_INTERNAL_CONNECTION_STRING,
//   });
//   try {
//     await redis_client.connect();
//     const PUB_SOCK_PORT = await redis_client.lPop("pub_sock_port");
//     const pub_sock = await __init__pub_sock(PUB_SOCK_PORT);
//     const sub_socks = {};
//     for (let i = 0; i < os.cpus().length - 1; i++) {
//       if (`300${i}` !== PUB_SOCK_PORT) {
//         const sub_sock = await sub_socket(`300${i}`, PUB_SOCK_PORT);
//         sub_socks[`300${i}`] = sub_sock;
//       }
//     }
//   } catch (error) {
//     console.log(new Error(error).stack);
//   } finally {
//     redis_client.disconnect();
//   }
// })();

//globals
let pub_sock;
const sub_socks = {};
const client_connections = {};
let PUB_SOCK_PORT;
const client_socket_specific_sub_socket_message_handler_collection = {};

// async function setup_node_instance_zmq_socket_socketinterconnection() {
//   return new Promise(async (resolve, reject) => {
//     // //connect to redis server
//     // const redis_client = redis.createClient({
//     //   url: process.env.REDIS_INTERNAL_CONNECTION_STRING,
//     // });

//     // async function __init__pub_sock(PUB_SOCK_PORT) {
//     //   return new Promise(async (resolve, reject) => {
//     //     try {
//     //       const pub_sock = zmq.socket("pub");
//     //       pub_sock.bindSync(`tcp://127.0.0.1:${PUB_SOCK_PORT}`);
//     //       resolve(pub_sock);
//     //     } catch (error) {
//     //       reject(error);
//     //     }
//     //   });
//     // }

//     function sub_socket_message_handler(port, msg) {
//       //const pub_server_instance_zmq_sock_port = port.toString();
//       const msg_json = JSON.parse(msg);
//       //console.log(`msg:` + JSON.stringify(msg_json));
//       switch (msg_json["command"]) {
//         case "ping":
//         case "PING":
//           pub_sock.send([
//             msg_json["pub_server_instance_zmq_sock_port"],
//             JSON.stringify({
//               command: "PONG",
//               pub_server_instance_zmq_sock_port: PUB_SOCK_PORT,
//             }),
//           ]);
//           break;
//         case "PONG":
//           // console.log(
//           //   `recived "PONG" form ${msg_json["pub_server_instance_zmq_sock_port"]}`
//           // );
//           break;
//         case "pass_data":
//           console.log(msg_json);
//           const client_socket =
//             client_connections[msg_json["client_socket_id"]];
//           if (client_socket) {
//             client_socket.sendUTF(JSON.stringify(msg_json["data"]));
//           }
//           break;
//         case "is_client_socket_open":
//           //console.log("gor is client socket open command");
//           const answer = client_connections[msg_json["client_id"]]
//             ? true
//             : false;
//           //console.log(answer);
//           if (answer) {
//             client_connections[msg_json["client_id"]].on(
//               "message",
//               (message) => {
//                 //pub_server_instance_zmq_sock_port
//                 //listner_socket_id
//                 console.log(message);
//                 pub_sock.send([
//                   msg_json["pub_server_instance_zmq_sock_port"],
//                   JSON.stringify({
//                     command: "pass_data",
//                     client_socket_id: msg_json["listner_socket_id"],
//                     data: message,
//                   }),
//                 ]);
//               }
//             );
//           }
//           pub_sock.send([
//             msg_json["pub_server_instance_zmq_sock_port"],
//             JSON.stringify({
//               command: "listner_socket_specific",
//               listner_socket_id: msg_json["listner_socket_id"],
//               answer: answer,
//             }),
//           ]);
//           break;
//         case "listner_socket_specific":
//           //console.log(`uaisdfiafa;lifu${msg_json["answer"]}`);
//           client_socket_specific_sub_socket_message_handler_collection[
//             msg_json["listner_socket_id"]
//           ]({ answer: msg_json["answer"] });
//           break;
//         default:
//           break;
//       }
//     }

//     async function sub_socket(socket_port, subscribe_to) {
//       return new Promise(async (resolve, reject) => {
//         try {
//           const sub_sock = zmq.socket("sub");
//           sub_sock.connect(`tcp://127.0.0.1:${socket_port}`);
//           sub_sock.subscribe(subscribe_to);
//           sub_sock.on("message", sub_socket_message_handler);
//           resolve(sub_sock);
//         } catch (error) {
//           reject(error);
//         }
//       });
//     }

//     /**
//      *
//      * @returns Array [socket_port, socket]
//      */
//     async function getZMQ_port_and_socket() {
//       return new Promise((resolve, reject) => {
//         for (let i = 0; i < os.cpus().length; i++) {
//           try {
//             let sock = zmq.socket("pub");
//             sock.bindSync(`tcp://127.0.0.1:300${i}`);
//             resolve([`300${i}`, sock]);
//             return;
//           } catch (error) {
//             if (!error.message.match(/Address already in use/gi).length)
//               reject(error);
//           }
//         }
//         reject(
//           "Error at function 'getZMQ_port_and_socket' can't get any open ports for socket"
//         );
//       });
//     }

//     try {
//       // await redis_client.connect();
//       // //const [commonSocket, closeCommonSocket] = await connectToCommonSocket();
//       // PUB_SOCK_PORT = await redis_client.lPop("pub_sock_port");
//       // pub_sock = await __init__pub_sock(PUB_SOCK_PORT);
//       [PUB_SOCK_PORT, pub_sock] = await getZMQ_port_and_socket();
//       for (let i = 0; i < os.cpus().length; i++) {
//         if (`300${i}` !== PUB_SOCK_PORT) {
//           const sub_sock = await sub_socket(`300${i}`, PUB_SOCK_PORT);
//           sub_socks[`300${i}`] = sub_sock;
//         }
//       }
//     } catch (error) {
//       reject(error);
//     } finally {
//       // redis_client.disconnect();
//       resolve(true);
//     }
//   });
// }

// async function is_client_socket_open(
//   remote_client_id,
//   sub_server_instance_port,
//   this_server_instance_port,
//   client_id
// ) {
//   return new Promise(async (resolve, reject) => {
//     const sub_server_instance_response_handler = (ans_obj) => {
//       // console.log(ans_obj);
//       ans_obj["answer"] ? resolve(true) : reject(false);
//       delete client_socket_specific_sub_socket_message_handler_collection[
//         client_id
//       ];
//     };
//     client_socket_specific_sub_socket_message_handler_collection[client_id] =
//       sub_server_instance_response_handler;
//     pub_sock.send([
//       sub_server_instance_port,
//       JSON.stringify({
//         command: "is_client_socket_open",
//         client_id: remote_client_id,
//         listner_socket_id: client_id,
//         pub_server_instance_zmq_sock_port: this_server_instance_port,
//       }),
//     ]);
//   });
// }

async function start_server() {
  //connect to redis server
  const redis_client = redis.createClient({
    url: process.env.REDIS_INTERNAL_CONNECTION_STRING,
  });
  try {
    await redis_client.connect();
    //server
    const PORT = process.env.PORT || 5000;

    const app = express();
    const server = http.createServer(app);

    //server static files
    app.use(express.static("./public"));
    app.use(cors());

    app.get("/", (req, res) => {
      res.end("hello");
    });

    server.listen(PORT, function () {
      console.log(new Date() + " Server is listening on port 5000");
    });

    const wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false,
    });

    function originIsAllowed(origin) {
      return true;
    }

    wsServer.on("request", async function (request) {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        // console.log(
        //   new Date() +
        //     " Connection from origin " +
        //     request.origin +
        //     " rejected."
        // );
        return;
      }

      var connection = request.accept();
      // console.log(new Date() + " Connection accepted.");
      const client_id = uuidv4();
      //add client connecton to client_connections object
      client_connections[client_id] = connection;
      //check if any element in redis client_sockets
      //get the lingth of the list
      if (await redis_client.lLen("client_sockets")) {
        // console.log("clients num greater than one.");
        //if yes pop from front and send done to both the clients
        const remote_client_socket = await redis_client.rPop("client_sockets");

        if (remote_client_socket) {
          const remote_client_socket_json = JSON.parse(remote_client_socket);
          // console.log("got remote_client_socket");
          // console.log(remote_client_socket_json);
          if (
            remote_client_socket_json["server_instance_port"] !== PUB_SOCK_PORT
          ) {
            // console.log("remote client connected to another instance");
            //handle client socket from different server instance
            //check if remote client is in connected to server or not
            if (
              await is_client_socket_open(
                remote_client_socket_json["client_id"],
                remote_client_socket_json["server_instance_port"],
                PUB_SOCK_PORT,
                client_id
              )
            ) {
              // console.log("client socket open");
              //send done to both the client
              //remote client
              pub_sock.send([
                remote_client_socket_json["server_instance_port"],
                JSON.stringify({
                  command: "pass_data",
                  client_socket_id: remote_client_socket_json["client_id"],
                  data: {
                    type: "utf8",
                    utf8Data: '{"info":"pipe_established"}',
                  },
                }),
              ]);
              connection.sendUTF(
                JSON.stringify({
                  type: "utf8",
                  utf8Data: '{"info":"pipe_established"}',
                })
              );

              //send 'share_sdp_offer' command to one client
              setTimeout(() => {
                connection.sendUTF(
                  JSON.stringify({
                    type: "utf8",
                    utf8Data: '{"command":"share_sdp_offer"}',
                  })
                );
              }, 3000);
              connection.on("message", (message) => {
                console.log(message);
                pub_sock.send([
                  remote_client_socket_json["server_instance_port"],
                  JSON.stringify({
                    command: "pass_data",
                    client_socket_id: remote_client_socket_json["client_id"],
                    data: message,
                  }),
                ]);
              });
            } else {
              //ideally it should pop another redis client_socket_list
              //but currently one simple solution is push the client to redis client_socket_list
              await redis_client.lPush(
                "client_sockets",
                JSON.stringify({
                  client_id: client_id,
                  server_instance_port: PUB_SOCK_PORT,
                })
              );
            }
          } else {
            //handle client socket form same server instance
            //check if remote client socket is open
            if (client_connections[remote_client_socket_json["client_id"]]) {
              client_connections[remote_client_socket_json["client_id"]].on(
                "message",
                (message) => {
                  connection.sendUTF(JSON.stringify(message));
                }
              );
              connection.on("message", (message) => {
                client_connections[
                  remote_client_socket_json["client_id"]
                ].sendUTF(JSON.stringify(message));
              });
              client_connections[
                remote_client_socket_json["client_id"]
              ].sendUTF(
                JSON.stringify({
                  type: "utf8",
                  utf8Data: '{"info":"pipe_established"}',
                })
              );
              connection.sendUTF(
                JSON.stringify({
                  type: "utf8",
                  utf8Data: '{"info":"pipe_established"}',
                })
              );

              setTimeout(() => {
                connection.sendUTF(
                  JSON.stringify({
                    type: "utf8",
                    utf8Data: '{"command":"share_sdp_offer"}',
                  })
                );
              }, 3000);
            } else {
              //ideally it should pop another redis client_socket_list
              //but one simple solution is push the client to redis client_socket_list
              await redis_client.lPush(
                "client_sockets",
                JSON.stringify({
                  client_id: client_id,
                  server_instance_port: PUB_SOCK_PORT,
                })
              );
            }
          }
        } else {
          //this will only happen only there less number of client_sockets in redis or very high traffic
          //just push te client in the redis client_sockets  and some other server instance will pop it quickly
          await redis_client.lPush(
            "client_sockets",
            JSON.stringify({
              client_id: client_id,
              server_instance_port: PUB_SOCK_PORT,
            })
          );
          connection.on("message", (data) => {
            console.log(data);
          });
        }
      } else {
        //else psush the client in the redis client_sockets
        await redis_client.lPush(
          "client_sockets",
          JSON.stringify({
            client_id: client_id,
            server_instance_port: PUB_SOCK_PORT,
          })
        );
      }
      connection.on("close", function (reasonCode, description) {
        //remove client from client_connections and redis connections list
        delete client_connections[client_id];
        // console.log(
        //   new Date() + " Peer " + connection.remoteAddress + " disconnected."
        // );
      });
    });
  } catch (error) {
    reject(error);
  } finally {
    //await redis_client.disconnect();
  }
}

// async function setup_node_instance_zmq_socket_socketinterconnection_test() {
//   // console.log("ZMQ sockets connectiontest start...");
//   for (let i = 0; i < Object.keys(sub_socks).length; i++) {
//     // console.log(`sent PING to ${Object.keys(sub_socks)[i]}`);
//     pub_sock.send([
//       Object.keys(sub_socks)[i],
//       JSON.stringify({
//         command: "PING",
//         pub_server_instance_zmq_sock_port: PUB_SOCK_PORT,
//       }),
//     ]);
//   }
// }

// async function sleep_for(ms) {
//   return new Promise(async (resolve, reject) => {
//     setTimeout(resolve, ms);
//   });
// }

//new NodeInstanceInterConnection for inter server instance communication
const serverInstanceInterConnection = new NodeInstanceInterConnection();

true;
(async function () {
  try {
    await serverInstanceInterConnection.setup_node_instance_zmq_socket_socketinterconnection();
    //await sleep_for(1000);
    //await setup_node_instance_zmq_socket_socketinterconnection_test();
    console.log("Server start");
    await start_server();
  } catch (error) {
    // console.log(error);
    process.exit(1);
  }
})();
