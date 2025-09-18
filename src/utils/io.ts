import fs from "fs"
import { resolve } from "path"

export const readFiles = (dirPath: string, files: string[] = []) => {
  const paths = fs.readdirSync(dirPath)

  for (const path of paths) {
    if (path !== "index.ts" && !path.endsWith(".d.ts")) {
      const basePath: string = resolve(dirPath, path)
      const pathStat = fs.statSync(basePath)
      pathStat.isDirectory()
        ? readFiles(basePath, files)
        : files.push(basePath)
    }
  }

  return files
}

export const getModuleName = (rootName: string, file: string): string => file.split(rootName).pop()!.split(".").shift() || file

export const generateCustomId = (root: string, file: string): string =>
  getModuleName(root, file)
    .split("/")
    .filter(Boolean)
    .join("-")