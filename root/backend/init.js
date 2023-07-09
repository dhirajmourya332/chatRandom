require("dotenv").config();
const os = require("os");
const redis = require("redis");

true;
(async function () {
  //connect to redis server
  const redis_client = redis.createClient({
    url: process.env.REDIS_INTERNAL_CONNECTION_STRING,
  });
  try {
    await redis_client.connect();
    //delete pub_sock_port list in case any garbage element exists in it
    // await redis_client.del("pub_sock_port");
    //clear client_sockets list
    await redis_client.del("client_sockets");
    //initialise the pub_sovk_port
    // for (let i = 0; i < os.cpus().length; i++) {
    //   await redis_client.lPush("pub_sock_port", `300${i}`);
    // }
  } catch (error) {
    console.log(error);
  } finally {
    redis_client.disconnect();
  }
})();
