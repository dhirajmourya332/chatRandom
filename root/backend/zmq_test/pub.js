// // pubber.js
// var zmq = require("zeromq"),
//   sock = zmq.socket("pub");

// sock.bindSync("tcp://127.0.0.1:3000");
// console.log("Publisher bound to port 3000");

// const interval = setInterval(function () {
//   console.log("sending a multipart message envelope");
//   !sock.closed ? sock.send(["kitty cats", "meow!"]) : clearInterval(interval);
// }, 1000);

// setTimeout(() => {
//   sock.unbindSync("tcp://127.0.0.1:3000");
//   sock.close();
// }, 7600);

// async function getCommonPort() {
//   return new Promise((resolve, reject) => {
//     try {
//       let sock2 = zmq.socket("pub");
//       sock2.bindSync("tcp://127.0.0.1:3000");
//       resolve(sock2);
//     } catch (error) {
//       console.log("failed!");
//       if (new Error(error).message.match(/Address already in use/gi).length) {
//         setTimeout(() => {
//           resolve(getCommonPort());
//         }, Math.random() * 500);
//       } else reject(error);
//     }
//   });
// }

// (async function () {
//   console.log(await getCommonPort());
// })();
