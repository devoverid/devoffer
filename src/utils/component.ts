import { ALPHABETS, CUSTOM_ID_SEPARATOR, SNOWFLAKE_MARKER } from "@constants";
import { DiscordCustomIdMetadata } from "../types/discord-component";
import { getModuleName } from "./io";

const isOnlyDigitSnowflake = (id: string): boolean => /^\d+$/.test(id)

const trimSnowflakeMarker = (chars: string): string => chars.split(SNOWFLAKE_MARKER.toLowerCase()).pop()!

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

export const encodeSnowflake = (numbers: string): string => `${SNOWFLAKE_MARKER}${BigInt(numbers).toString(36)}`

export const decodeSnowflakes = (customId: string): string[] => customId
  .split(CUSTOM_ID_SEPARATOR)
  .map((item: string): string => {
    const text = item.toLowerCase()
    if (!item.includes(SNOWFLAKE_MARKER)) return item

    const id = decodeSnowflake(text)
    const encodedText = encodeSnowflake(id).toLocaleLowerCase()
    if (isOnlyDigitSnowflake(id) && encodedText === text) return id

    return item
  })

export const decodeSnowflake = (data: string): string => {
  const chars = trimSnowflakeMarker(data)

  let result = 0n
  for (const char of chars) {
    result = result * 36n + BigInt(ALPHABETS.indexOf(char))
  }
  return result.toString()
}