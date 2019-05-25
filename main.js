const discord = require("discord.js");

const c = new discord.Client();

const config = require("./config.json");

c.on("ready", () => {
    console.log(`Bot is now ready...`);
    c.user.setActivity("the Holy Grail War", {type: "WATCHING"});
});

c.on("guildCreate", g => {
    console.log(`New Guild Joined: ${g.name} (ID: ${g.id}). This guild has ${g.memberCount} members!`);
});

c.on("guildDelete", g => {
    console.log(`Left A Guild: ${g.name} (ID: ${g.id})`);
});

c.on("message", async m => {
    if (m.author.bot) return;
    if (m.content.indexOf(config.prefix) !== 0) return;

    const args = m.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd === "ping")
    {
        const m1 = await m.channel.send("Ping...");

        m1.edit(`Pong! Latency is ${m1.createdTimestamp - m.createdTimestamp} ms. API Latency is ${Math.round(c.ping)}ms.`);
    }

    if (cmd === "shutdown")
    {
        if (m.author.id === config.devid)
        {
            c.destroy();
            process.exit(0);
        }
    }

    if (cmd === "kick")
    {
        if (!m.member.permissions.hasPermissions("KICK_MEMBERS", false))
        {
            return m.reply("Sorry but you do not have the permissions to use this command...");
        }

        let target = m.mentions.members.first() || m.guild.members.get(args[0]);

        if (!target)
        {
            return m.reply("Please mention a valid member of this server!");
        }

        if (!target.kickable)
        {
            return m.reply("I lack the ability to kick this user! Do they have a role higher than mine or do I not have kick permissions?");
        }

        let reason = args.slice(1).join(' ');
        
        if (!reason)
        {
            reason = "No Reason Provided";
        }

        await target.kick(reason).catch(e => m.reply(`Sorry ${m.author}, I couldn't kick because of ${e}`));
        m.reply(`${target.user.tag} has been kicked by ${m.author.tag} due to ${reason}`);
    }

    if (cmd === "ban")
    {
        if (!m.member.permissions.hasPermissions("BAN_MEMBERS", false))
        {
            return m.reply("Sorry, you do not have permissions to use this!");
        }

        let me = m.mentions.members.first() || m.guild.members.get(args[0]);

        if (!me)
        {
            return m.reply("Please mention a valid member of this server!");
        }

        if (!me.bannable)
        {
            return m.reply("I lack the ability to ban this user! Do they have a role higher than mine or do I not have kick permissions?");
        }

        let r = args.slice(1).join(' ');
        
        if (!r)
        {
            r = "No Reason Provided";
        }

        await me.ban(r).catch(e => m.reply(`Sorry ${m.author}, I could not ban because of: ${e}`));
        m.reply(`${me.user.tag} has been banned by ${m.author.tag} due to: ${r}`);
    }

    if (cmd === "purge")
    {
        if (m.member.permissions.hasPermissions("MANAGE_MESSAGES", false) && m.member.permissions.hasPermissions("VIEW_AUDIT_LOG", false))
        {
            const delCount = parseInt(args[0], 10);

            if (!delCount || delCount < 2 || delCount > 100)
            {
                return m.reply("Please provide a number between 2 and 100 for the number of messages to delete!");
            }

            const fetched = await m.channel.fetchMessages({limit: delCount});
            m.channel.bulkDelete(fetched).catch(e => m.reply(`Could not delete messages due to: ${e}`));
        }
    }

    if (cmd === "help")
    {
        const devCmds = "**__Developer Commands:__**\n**rin!shutdown** - Shuts down the bot if the bot is being runned locally.";
        const modCmds = "**__Server Management Commands:__**\n**rin!kick __@user__ __reason__** - Kicks the mentioned user for the reason specified.\n**rin!ban __@user__ __reason__** - Bans the mentioned user for the reason specified.\n**rin!purge __(no of msgs to be deleted)__** - Deletes the number of messages specified in the channel.";
        const cmds = "**__General Commands:__**\n**rin!help** - Shows all available commands for the bot.\n**rin!ping** - Pong.";
        const embed = {
            "description": "**Tohsaka Rin commands:**\n\n" + devCmds + "\n\n" + modCmds + "\n\n" + cmds,
            "color": 6308886,
            "timestamp": new Date(),
            "footer": {
              //"icon_url": `${c.user.avatarURL}`,
              "text": "Emiya Shirou is my servant"
            },
            "thumbnail": {
              "url": `${c.user.avatarURL}`
            },
            "author": {
              "name": "Tohsaka Rin - Help"
              //"icon_url": `${c.user.avatarURL}`
            }
        };

        m.reply({embed});
    }
});

c.login(process.env.token);