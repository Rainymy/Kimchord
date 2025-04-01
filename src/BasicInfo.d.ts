type GuildData = import("./Components/startup/guildData").GuildData;

export type BasicInfo = {
  guilds_settings: GuildData,
  server: {
    host: string,
    port: number,
    URL: string,
  },
  isDev: boolean
}