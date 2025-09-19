import { ALPHABETS, CUSTOM_ID_SEPARATOR } from "../constants";
import { DiscordCustomIdMetadata } from "../types/discord-component";
import { getModuleName } from "./io";

export const generateCustomId = (rootName: string, file: string): string => 
  getModuleName(rootName, file)
  .split("/")
  .filter(Boolean)
  .map(item =>
    item
      .split("-")
      .map(word => word[0]?.toUpperCase() ?? "")
      .join("")
  )
  .join("-")

export const getCustomId = (obj: DiscordCustomIdMetadata) => Object.values(obj).join(CUSTOM_ID_SEPARATOR)

export const encodeSnowflake = (numbers: string): string => BigInt(numbers).toString(36)

export const decodeSnowflake = (chars: string): string => {
  let result = 0n
  for (const char of chars) {
    result = result * 36n + BigInt(ALPHABETS.indexOf(char))
  }
  return result.toString()
}