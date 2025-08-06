module.exports = {
  name: "messageCreate",
  desc: "Replying to a user when the user's chat contains 'fine' word",
  exec(client, msg) {
    if (msg.content.includes("fine")) msg.reply("gua i'm fine😅")
  }
}