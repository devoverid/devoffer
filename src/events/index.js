const fs = require("fs")
const path = require("path");

const loadEvents = client => {
  const eventFolders = fs.readdirSync(__dirname).filter(file => file !== "index.js")

  for (const folder of eventFolders) {
    const folderPath = path.join(__dirname, folder)
    if (fs.statSync(folderPath).isDirectory()) {
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"))
      for (const file of files) {
        const filePath = path.join(folderPath, file)
        const event = require(filePath)
        if (event.once) {
          client.once(event.name, (...args) => event.exec(client, ...args))
        } else {
          client.on(event.name, (...args) => {
            event.exec(client, ...args)
          })
        }
      }
    }
  }
}

module.exports = { loadEvents };