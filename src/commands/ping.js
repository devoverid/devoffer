module.exports = {
  name: "ping",
  desc: "Ping command",
  exec(msg) {
    msg.reply("Pong!")
  }
}