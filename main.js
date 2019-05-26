const discord = require("discord.js");

const c = new discord.Client();

const config = require("./config.json");

const version = "1.2.0";

function clean(t)
{
    if (typeof(t) === "string")
    {
        return t.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    }
    else
    {
        return t;
    }
}

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

function changelogs(curPage)
{
    const embed = {
        "description": `**Current Version:** ${version}\nYou can also read the changes at the **README.md** file found in the github repository.`,
        "color": 3604232,
        "timestamp": new Date(),
        "footer": {
          "icon_url": c.user.avatarURL,
          "text": "Do we really need a footer?"
        },
        "thumbnail": {
          "url": c.user.avatarURL
        },
        "author": {
          "name": "Changelogs",
          "icon_url": c.user.avatarURL
        },
        "fields": [
          {
            "name": "Version 1.0.0",
            "value": "God knows what was added and changed here. Long lost in history"
          },
          {
            "name": "Version 1.1.0",
            "value": "- Added rin!changelogs\n- Added rin!about"
          },
          {
              "name":   "Version 1.1.1",
              "value":  "- Fixed rin!about"
          },
          {
              "name":   "Version 1.2.0",
              "vaue":   "- Made the bot log to <#581396935957676033> when Purge command executed."
          }
        ]
    };

    return embed;
}

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

    if (cmd === "about")
    {
        const gid = c.guilds.get(config.officialguildid).id;
        const guild = c.guilds.get(`${gid}`).name;

        const msg = `**Thank you for entertaining Tohsaka!**\n\n**Tohsaka Rin Version:** ${version}\n\n\nTohsaka Rin is a discord bot owned by **${c.users.get(config.devid).username}#${c.users.get(config.devid).discriminator}** and designed for **${guild}** guild **only**.Tohsaka Rin is currently operating in **${c.guilds.size}** guilds which has **${c.users.size}** users. You cannot invite Tohsaka Rin to your own server.\n\nTohsaka Rin is an open-source project. You can check our the GitHub repository at https://github.com/EndNation/Tohsaka-Rin and join the official server at https://discord.gg/hMnStJE`;
        m.channel.send(msg);
    }

    if (cmd === "changelogs")
    {
        /**const embed = {
            "description": `**Current Version:** ${version}`,
            "color": 3604232,
            "timestamp": new Date(),
            "footer": {
              "icon_url": c.user.avatarURL,
              "text": "Do we really need a footer?"
            },
            "thumbnail": {
              "url": c.user.avatarURL
            },
            "author": {
              "name": "Changelogs",
              "icon_url": c.user.avatarURL
            },
            "fields": [
              {
                "name": "Version 1.0.0",
                "value": "God knows what was added and changed here. Long lost in history"
              },
              {
                "name": "Version 1.1.0",
                "value": "- Added rin!changelogs\n- Added rin!about"
              }
            ]
        };

        m.channel.send({embed});*/
        const maxPages = 1;
        const minPages = 1;
        const curPage = 1;

        var embed = changelogs(curPage);
        var l = await m.channel.send({embed});

        l.react("◀").then(() => l.react("❌"))
                    .then(() => l.react("▶"))
                    .catch(() => console.error("One of the emojis failed to react."));

        const filter = (r, u) => {
            return ( r.emoji.name === "◀" || 
            r.emoji.name === "▶" || 
            r.emoji.name === "❌") && u.id === m.author.id;
        };

        const collector = l.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (r, rC) => {
            if (r.emoji.name === "◀")
            {
                if (curPage > minPages)
                {
                    curPage = curPage - 1;
                }
                else
                {
                    embed = changelogs(curPage);
                    l.edit({embed});
                }
            }
            else if (r.emoji.name === "▶")
            {
                if (curPage < maxPages)
                {
                    curPage = curPage + 1;
                }
                else
                {
                    embed = changelogs(curPage);
                    l.edit({embed});
                }
            }
            else
            {
                
            }
            collector.stop();
        });
    }

    if (cmd === "eval")
    {
        if (m.author.id === config.devid)
        {
            try
            {
                const code = args.join(" ");

                let evaled = eval(code);

                if (typeof evaled != "string")
                {
                    evaled = require("util").inspect(evaled);
                }

                m.channel.send(clean(evaled), {code: "xl"});
            }
            catch (e)
            {
                console.log(`[ERROR] ${clean(e)}`);
            }
        }
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

            const embed = {
                "color": 6122639,
                "timestamp": new Date(),
                "footer": {
                  "icon_url": c.user.avatarURL,
                  "text": "Just logging the purge..."
                },
                "thumbnail": {
                  "url": c.user.avatarURL
                },
                "author": {
                  "name": "Purge",
                  "icon_url": c.user.avatarURL
                },
                "fields": [
                  {
                    "name": "Amount Of Messages Deleted:",
                    "value": `${delCount}`
                  },
                  {
                    "name": "Channel Where Messages Were Deleted:",
                    "value": `<#${m.channel.id}>`
                  },
                  {
                    "name": "Command Executed By:",
                    "value": `<@${m.author.id}>`
                  }
                ]
            };

            const j = c.channels.get("581396935957676033");
            j.send(`${m.author.tag}`, {embed});
        }
    }

    if (cmd === "help")
    {
        const devCmds = "**__Developer Commands:__**\n**rin!shutdown** - Shuts down the bot if the bot is being runned locally.\n**rin!eval** - Evaluates the arguments given.";
        const modCmds = "**__Server Management Commands:__**\n**rin!kick __@user__ __reason__** - Kicks the mentioned user for the reason specified.\n**rin!ban __@user__ __reason__** - Bans the mentioned user for the reason specified.\n**rin!purge __(no of msgs to be deleted)__** - Deletes the number of messages specified in the channel.";
        const cmds = "**__General Commands:__**\n**rin!help** - Shows all available commands for the bot.\n**rin!ping** - Pong.\n**rin!changelogs** - Shows all the changes made to the bot.\n**rin!about** - The abouts of the bot";
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