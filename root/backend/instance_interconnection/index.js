const zmq = require("zeromq");
const os = require("os");

function NodeInstanceInterConnection(props) {
  this.pub_sock = null;
  this.PUB_SOCK_PORT = null;
  this.sub_socks = {};
  this.client_socket_specific_sub_socket_message_handler_collection = {};
  this.client_connections = props["client_connections"];

  this.close_pub_socket = async () => {
    if (this.pub_sock) {
      await this.sock.unbindSync(this.PUB_SOCK_PORT);
      await this.pub_sock.close();
    }
  };

  this.is_client_socket_open = (
    remote_client_id,
    sub_server_instance_port,
    this_server_instance_port,
    client_id
  ) => {
    return new Promise(async (resolve, reject) => {
      const sub_server_instance_response_handler = (ans_obj) => {
        // console.log(ans_obj);
        ans_obj["answer"] ? resolve(true) : reject(false);
        delete this
          .client_socket_specific_sub_socket_message_handler_collection[
          client_id
        ];
      };
      this.client_socket_specific_sub_socket_message_handler_collection[
        client_id
      ] = sub_server_instance_response_handler;
      this.pub_sock.send([
        sub_server_instance_port,
        JSON.stringify({
          command: "is_client_socket_open",
          client_id: remote_client_id,
          listner_socket_id: client_id,
          pub_server_instance_zmq_sock_port: this_server_instance_port,
        }),
      ]);
    });
  };

  const sub_socket = (socket_port, subscribe_to) => {
    return new Promise(async (resolve, reject) => {
      try {
        const sub_sock = zmq.socket("sub");
        sub_sock.connect(`tcp://127.0.0.1:${socket_port}`);
        sub_sock.subscribe(subscribe_to);
        sub_sock.on("message", sub_socket_message_handler);
        resolve(sub_sock);
      } catch (error) {
        reject(error);
      }
    });
  };
  /**
   *
   * @returns Array [socket_port, socket]
   */
  const getZMQ_port_and_socket = () => {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < os.cpus().length; i++) {
        try {
          let sock = zmq.socket("pub");
          sock.bindSync(`tcp://127.0.0.1:300${i}`);
          resolve([`300${i}`, sock]);
          return;
        } catch (error) {
          if (!error.message.match(/Address already in use/gi).length)
            reject(error);
        }
      }
      reject(
        "Error at function 'getZMQ_port_and_socket' can't get any open ports for socket"
      );
    });
  };
  const sub_socket_message_handler = (port, msg) => {
    try {
      //const pub_server_instance_zmq_sock_port = port.toString();
      const msg_json = JSON.parse(msg);
      //console.log(`msg:` + JSON.stringify(msg_json));
      switch (msg_json["command"]) {
        case "ping":
        case "PING":
          this.pub_sock.send([
            msg_json["pub_server_instance_zmq_sock_port"],
            JSON.stringify({
              command: "PONG",
              pub_server_instance_zmq_sock_port: this.PUB_SOCK_PORT,
            }),
          ]);
          break;
        case "PONG":
          // console.log(
          //   `recived "PONG" form ${msg_json["pub_server_instance_zmq_sock_port"]}`
          // );
          break;
        case "pass_data":
          // console.log(msg_json["data"]);
          const client_socket =
            this.client_connections[msg_json["client_socket_id"]];
          if (client_socket) {
            client_socket.sendUTF(JSON.stringify(msg_json["data"]));
          }
          break;
        case "is_client_socket_open":
          //console.log("gor is client socket open command");
          const answer = this.client_connections[msg_json["client_id"]]
            ? true
            : false;
          //console.log(answer);
          if (answer) {
            this.client_connections[msg_json["client_id"]].on(
              "message",
              (message) => {
                //pub_server_instance_zmq_sock_port
                //listner_socket_id
                // console.log(message);
                this.pub_sock.send([
                  msg_json["pub_server_instance_zmq_sock_port"],
                  JSON.stringify({
                    command: "pass_data",
                    client_socket_id: msg_json["listner_socket_id"],
                    data: message,
                  }),
                ]);
              }
            );
          }
          this.pub_sock.send([
            msg_json["pub_server_instance_zmq_sock_port"],
            JSON.stringify({
              command: "listner_socket_specific",
              listner_socket_id: msg_json["listner_socket_id"],
              answer: answer,
            }),
          ]);
          break;
        case "listner_socket_specific":
          //console.log(`uaisdfiafa;lifu${msg_json["answer"]}`);
          this.client_socket_specific_sub_socket_message_handler_collection[
            msg_json["listner_socket_id"]
          ]({ answer: msg_json["answer"] });
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  };
  this.setup_node_instance_zmq_socket_socketinterconnection = () => {
    return new Promise(async (resolve, reject) => {
      try {
        [this.PUB_SOCK_PORT, this.pub_sock] = await getZMQ_port_and_socket();
        for (let i = 0; i < os.cpus().length; i++) {
          if (`300${i}` !== this.PUB_SOCK_PORT) {
            const sub_sock = await sub_socket(`300${i}`, this.PUB_SOCK_PORT);
            this.sub_socks[`300${i}`] = sub_sock;
          }
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };
}

module.exports = NodeInstanceInterConnection;
