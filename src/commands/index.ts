import fs from "fs"
const commands = new Map()

const commandFiles = fs.readdirSync(__dirname).filter(file => file !== "index.ts")

for (const file of commandFiles) {
  const command = require(`./${file}`)
  commands.set(command.name, command)
}

export default commands