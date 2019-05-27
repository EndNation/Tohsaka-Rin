const { ShardingManager } = require('discord.js');
const config = require("./config.json");

const sm = new ShardingManager('./bot.js', {
    token: process.env.token,
    totalShards: "auto",
    respawn: false,
});

sm.spawn(this.totalShards).catch(console.error);
sm.on('launch', s => console.log(`[SHARD] Launched shard ${s.id}/${sm.totalShards - 1}`));

sm.on("message", (s, m) => {
    const yee = m.toLowerCase();

    if (yee.substring(1, 7)=== "restart")
    {
        const devid = yee.substring(7);

        if (devid === config.devid)
        {
            sm.broadcast("log_restart");
            sm.respawnAll(5000, 1000, true, s.id).catch(console.error);
            sm.broadcast("restart_success");
        }
    }
});