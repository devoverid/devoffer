module.exports = {
  name: "ready",
  desc: "Say こんにちは for the first load",
  once: true,
  exec(client) {
    console.log(`こんにちは、${client.user.tag}`);
  }
}