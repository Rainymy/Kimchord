type GuildData = import("./Components/startup/guildData").GuildData;

export type BasicInfo = {
  prefix: string,
  guilds_settings: GuildData,
  server: {
    host: string,
    port: number,
    URL: string,
  },
  isDev: boolean,
  cb: () => void
}