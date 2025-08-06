module.exports = {
  name: "ready",
  desc: "Say こんにちは for the first load",
  exec(client, message) {
    console.log("OK", message);
    if (message.content === "!ping") message.reply("Pong!")
  }
}