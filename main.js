const { ShardingManager } = require('discord.js');
const config = require("./config.json");

const sm = new ShardingManager('./bot.js', {
    token: process.env.token,
    totalShards: "auto",
    respawn: true,
});

sm.spawn(this.totalShards).catch(console.error);
sm.on('launch', s => console.log(`[SHARD] Launched shard ${s.id}/${sm.totalShards - 1}`));

function getPartOfString(string, beginIndex, endIndex)
{
    return string.substring(beginIndex, endIndex).toLowerCase();
}

sm.on("message", (s, m) => {
    console.log(`[SM] Message Received: ${m} , Type: ${typeof(m)}`);
    if (typeof(m) === "string")
    {
        if (getPartOfString(m, 0, 7) === "restart")
        {
            const devid = getPartOfString(m, 7).replace(`(`, ``).replace(`)`, ``).trim();

            console.log(`[SM] Restart command executed by ${devid}`);

            if (devid === config.devid)
            {
                sm.respawnAll(1000, 100, true, s.id).catch(console.error);
            }
        }
    }
});