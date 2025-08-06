export default {
  name: "ping",
  desc: "Ping command",
  exec(msg) {
    msg.reply("Pong!")
  }
}