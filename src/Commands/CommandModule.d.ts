export type CommandModule = {
  name: string,
  permissions: number[],
  aliases: string | string[],
  main: () => void,
  isHidden?: boolean
}