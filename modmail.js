const Discord = require("discord.js");
const moment = require("moment");
const fs = require("fs")
const config = require("./config.json")
module.exports = client => {

    // Server
    client.on("messageCreate", async (message) => {
        if(message.guild && !message.author.bot) {
            let serverauthor = message.author;
            client.modmailDb.ensure(message.guild.id, {
                enabled: false,
                category: null,
                message: "Start typing what you need and get Help!"
            })
            let data = client.modmailDb.get(message.guild.id)
            client.settings.ensure(message.guild.id, {
                prefix: config.prefix
            });
            let prefix = client.settings.get(message.guild.id, `prefix`);
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
            if(prefixRegex.test(message.content)) {
                const [, matchedPrefix] = message.content.match(prefixRegex);
                let args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
                let cmd = args.shift()?.toLowerCase(); //PinG --> ping;
                if(cmd.length == 0 && matchedPrefix.includes(client.user.id)){
                    return message.reply({embeds: [
                        new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **My Prefix is: \`${prefix}\`**`)
                    ]}).catch(console.error);
                }
                if(cmd && cmd.length > 0){
                    if(cmd == "invite" || cmd == "add"){
                        message.reply({
                            embeds: [new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Thanks for inviting me**`)
                            .setDescription(`[**Click here to invite me!**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)`)
                        ]})
                    } else if(cmd == "setup"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Only Admins are allowed to execute this Command!")
                                    ]
                            }).catch(console.error)
                        }
                        if(!args[0]){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Invalid Usage!")
                                        .setDescription(`Usage: \`${config.prefix}setup <CategoryId> [TICKETOPENING INFORMATIONMESSAGE]\`\n**CategoryId**... is the ID of the Category where the Support Channels should go!\n**TICKETOPENINGMESSAGE**... is the Message which should be sent into the DMS once the TICKET/MODMAIL got opened!!`)
                                ]
                            }).catch(console.error)
                        }
                        let category = message.guild.channels.cache.get(args[0]);
                        if(!category || category.type != "GUILD_CATEGORY"){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Invalid Category ID!")
                                        .setDescription(`${args[0]} is not a Category ID!`.substr(0, 2048))
                                ]
                            }).catch(console.error)
                        }
                        client.modmailDb.set(message.guild.id, {
                            enabled: true,
                            category: category.id,
                            message: args[1] ? args.slice(1).join(" ").substr(0, 2000) : "Start typing what you need and get Help!"
                        })
                        return message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("GREEN")
                                    .setTitle("✅ Successfully Enabled and configurated the Setup!")
                                ]
                        }).catch(console.error)
                    } 
                    else if(cmd == "deletesetup"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ Only Admins are allowed to execute this Command!")
                                    ]
                            }).catch(console.error)
                        }
                        if(!client.modmailDb.has(guild.id)){
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ You werend setup before!")
                                    ]
                            }).catch(console.error)
                        }
                        client.modmailDb.delete(message.guild.id)
                        return message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("GREEN")
                                    .setTitle("✅ Successfully Deleted the Setup!")
                                ]
                        }).catch(console.error)
                    }
                    else if(cmd == "forceclose"){
                        if(data.category == message.channel.parentId){
                            let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                            if(authorId) client.modmailDb.delete(authorId);
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Force Closed this Ticket")
                                        .setDescription(`U CAN NOW DELETE IT IF YOU WANT!`)
                                    ]
                            }).catch(console.error)
                        } else {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ This Channel is not a Ticket!")
                                    ]
                            }).catch(console.error)
                        }
                    }
                    else if(cmd == "close"){
                        if(data.category == message.channel.parentId){
                            let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                            if(!authorId) 
                            return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ This Channel is Closed / the user left!")
                                            .setDescription(`Close the Ticket with: \`${config.prefix}forceclose\`\nAfter that, you can delete the Channel!`)
                                        ]
                                }).catch(console.error);
                            let author = message.guild.members.cache.get(authorId);
                            if(!author)
                            author = await message.guild.members.fetch(authorId).catch(e=>{
                                console.log(e)
                                return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ The User left the Server")
                                            .setDescription(`Close the Ticket with: \`${config.prefix}close\``)
                                        ]
                                }).catch(console.error)
                            })
                            if(!author){
                                return message.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setTimestamp()
                                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                            .setColor("RED")
                                            .setTitle("❌ The User left the Server")
                                            .setDescription(`Close the Ticket with: \`${config.prefix}forceclose\``)
                                        ]
                                }).catch(console.error)
                            }
                            client.modmailDb.delete(authorId);
                            msglimit = 1000;
                            //The text content collection
                            let messageCollection = new Discord.Collection(); //make a new collection
                            let channelMessages = await message.channel.messages.fetch({ //fetch the last 100 messages
                                limit: 100
                            }).catch(err => console.log(err)); //catch any error
                            messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
                            let tomanymsgs = 1; //some calculation for the messagelimit
                            if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
                            let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
                            if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
                            while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                                if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
                                tomanymsgs += 1; //add 1 to the counter
                                let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                                channelMessages = await message.channel.messages.fetch({
                                    limit: 100,
                                    before: lastMessageId
                                }).catch(err => console.log(err)); //Fetch again, 100 messages above the already fetched messages
                                if (channelMessages) //if its true
                                    messageCollection = messageCollection.concat(channelMessages); //add them to the collection
                            }
                            //reverse the array to have it listed like the discord chat
                            let attachment = [];
                            try {
                                attachment = [await create_transcript_buffer([...messageCollection.values()], message.channel, message.guild)]
                                
                            } catch (e){
                                console.log(e)
                                attachment = []
                            }
                            await author.send({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Supporter Closed the Ticket")
                                    ]
                            }).catch(console.error)
                            await message.author.send({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Supporter Closed the Ticket")
                                    ]
                            }).catch(console.error)
                            await message.reply({
                                files: attachment,
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("GREEN")
                                        .setTitle("✅ Supporter Closed the Ticket")
                                        .setDescription(`U CAN NOW DELETE IT IF YOU WANT!`)
                                    ]
                            }).catch(console.error)
                            try{ fs.unlinkSync(`${process.cwd()}/${message.channel.name}.html`)}catch(e){ console.log(e) }
                        } else {
                            return message.reply({
                                embeds: [
                                    new Discord.MessageEmbed()
                                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setTimestamp()
                                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                        .setColor("RED")
                                        .setTitle("❌ This Channel is not a Ticket!")
                                    ]
                            }).catch(console.error)
                        }
                    } else if(cmd == "help") {
                        let { guild } = message
                        let embeds = []
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("BLURPLE")
                            .setTitle(`This is my Help Information!`)
                            .setDescription(`Hello I am ${guild.me.user.username} and i am a easy 2 setup and use Modmail-bot!\n> A Modmail Bot is a Bot similar to a Ticket Bot which allows you to DM with The Ticket User instead of Using a Ticket! It's easier for them and i have an advance Ticket Logger too!\n\n**These are my Commands:**\n\n\`Tomato#6966\` Coded me and here is the [Youtube Video](https://youtu.be/4oZb8-f1qYk) how he made me! [Github](https://github.com/Tomato6966/Multiguild-Modmail)`)
                            .addField("<:Discord:787321652345438228> **Support Server**", `> Join my [Support Server](https://discord.gg/milrato)`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .setAuthor(guild.name, guild.iconURL({dynamic: true})))
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("GREEN")
                            .setTitle(`💯 My Utility Commands!`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .addFields([
                                {name: "**ping**", value: `> *Shows the Ping of me.*`, inline: true},
                                {name: "**help**", value: `> *Gives you help!*`, inline: true},
                                {name: "**invite**", value: `> *Gives you an Invite link!*`, inline: true},
                            ]))
                        embeds.push(new Discord.MessageEmbed()
                            .setColor("RED")
                            .setTitle(`🚫 The Administration Commands!`)
                            .setThumbnail(guild.me.user.displayAvatarURL())
                            .addFields([
                                {name: "**setup**", value: `> *Creates the Setup for your Modmail Ticket*`, inline: true},
                                {name: "**deletesetup**", value: `> *Delets the Setup of it*`, inline: true},
                                {name: "**prefix**", value: `> *Changes the Prefix of me!*`, inline: true},
                                {name: "\u200b", value: `\u200b`, inline: false},
                                {name: "**close**", value: `> *Closes the Ticket (or use my Button)*`, inline: true},
                                {name: "**forceclose**", value: `> *Force Closes it so that you can delete the Channel and the User can create new one(s)*`, inline: true},
                            ])
                            .setFooter(guild.name, guild.iconURL({dynamic: true})))
                        message.reply({embeds})
                    } else if(cmd == "ping"){
                        message.reply({embeds: [
                            new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Pinging the API...**`)
                        ]}).then((msg)=>{
                            let botping = (Date.now() - msg.createdTimestamp) - (2 * client.ws.ping);
                            if(botping < 0) botping = 10;
                            msg.edit({embeds: [
                                    new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`> **API PING:** \`${client.ws.ping}\`\n\n> **BOT PING:** \`${botping}\``)
                                ]}).catch(console.error);
                        }).catch(console.error);
                    } else if(cmd == "prefix"){
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)){
                            return message.reply({embeds: [
                                new Discord.MessageEmbed().setColor("RED").setTitle(`:x: **You are not allowed to run this Command**`)
                            ]}).catch(console.error);
                        }
                        
                        if(!args[0]){
                            return message.reply({embeds: [
                                new Discord.MessageEmbed().setColor("RED").setTitle(`:x: **You need to tell me what the new prefix should be!**`)
                            ]}).catch(console.error);
                        }
                        //change the prefix settings
                        client.settings.set(message.guild.id, args[0], "prefix");
                        //Send success message
                        return message.reply({embeds: [
                            new Discord.MessageEmbed().setColor("BLURPLE").setTitle(`:white_check_mark: **Successfully changed the Prefix to: \`${args[0]}\`**`)
                        ]}).catch(console.error);
                    }
                }
            }
            if(data.category == message.channel.parentId){
                let authorId = client.modmailDb.findKey(d => d.id == message.guild.id && d.channel == message.channel.id);
                if(!authorId) 
                return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ This Channel is Closed / the user left!")
                                .setDescription(`Close the Ticket with: \`${config.prefix}forceclose\`\nAfter that, you can delete the Channel!`)
                            ]
                    }).catch(console.error);
                let author = message.guild.members.cache.get(authorId);
                if(!author)
                author = await message.guild.members.fetch(authorId).catch(e=>{
                    console.log(e)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ The User left the Server")
                                .setDescription(`Close the Ticket with: \`${config.prefix}close\``)
                            ]
                    }).catch(console.error)
                })
                if(!author){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ The User left the Server")
                                .setDescription(`Close the Ticket with: \`${config.prefix}close\``)
                            ]
                    }).catch(console.error)
                }
                
                let attachment = [];
                if(message.attachments.size > 0){
                    if(["png", "jpeg", "jpg", "gif"].some(i => message.attachments.first()?.url?.toLowerCase()?.includes(i))){
                        attachment = [new Discord.MessageAttachment(message.attachments.first()?.url)]
                    } else {
                        attachment = [];
                    }
                }
                let embed = new Discord.MessageEmbed()
                .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                .setTimestamp()
                .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                .setColor("GREEN")
                .setTitle("📨 Sent a new Message")
                .setDescription(`${message.content}`.substr(0, 2048))
                .addField(`Highest Role:`, `${message.member.roles.highest.name} | \`${message.member.roles.highest.id}\``);
                if(attachment.length > 0){
                    console.log(attachment)
                    embed.setImage('attachment://unknown.png');
                }
                author.send({
                    files: attachment,
                    embeds: [embed
                        ]
                }).catch(error=>{
                    console.log(error)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Failed to send a Message to the Channel")
                            .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                           ]
                    }).catch(console.error)
                })
                .then(success=>{
                    message.react("📨").catch(console.error)
                    message.react("✅").catch(console.error)
                });
            }
        
        }
    })

    client.on("ready", () => {
        client.user.setActivity({
            name: "Dm me for help | m!help | " + client.guilds.cache.size + " Guilds", type: "PLAYING", url: "https://twitch.tv/#"
        })
        setInterval(() => {
            client.user.setActivity({
                name: "Dm me for help | m!help | " + client.guilds.cache.size + " Guilds", type: "PLAYING", url: "https://twitch.tv/#"
            })
        }, (1000 * 60 * 5));
    })
    // DMS
    client.on("messageCreate", async (message) => {
        if(message.author.bot) return;
        if(!message.guild || message.channel.type == "DM") {
            let dmauthor = message.author;
            if(!client.modmailDb.has(dmauthor.id)){
                
                let guildsin = []

                for(let guild of [... client.guilds.cache.values()]) {
                    try{
                        await guild.members.fetch(dmauthor.id);
                        guildsin.push(guild.id);
                    }catch (e){
                       // console.log(e)
                    }
                }

                if(guildsin.length == 0){
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ You are not sharing any Guilds with me!")
                                .setDescription(`[**Click here to invite me!**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)`)
                        ]
                    }).catch(console.error)
                }
                else if(guildsin.length == 1){
                    let guild = client.guilds.cache.get(guildsin[0])
                    //he is already in a support mode!
                    client.modmailDb.set(dmauthor.id, {
                        id: guild.id
                    });
                    startSupportProcess(guild, message, dmauthor)
                } 
                else {
                    let selectedid = message.content;
                    let guild = client.guilds.cache.get(selectedid)
                    if(guild){
                        //he is already in a support mode!
                        client.modmailDb.set(dmauthor.id, {
                            id: guild.id
                        });
                        startSupportProcess(guild, message, dmauthor)
                        return;
                    } else {
                        message.reply({
                            embeds: [
                                new Discord.MessageEmbed()
                                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                    .setTimestamp()
                                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                    .setColor("RED")
                                    .setTitle("❌ Could not find the Guild under this ID!! (IF YOU TRY TO SEND ONE)")
                                    .setDescription(`[**Click here to invite me!**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)\n\n**Did you add a right ID?** <Check out my Example ID! \`${guildsin[0]}\`>`)
                            ]
                        }).catch(console.error)
                        
                    }
                    let embed = new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("BLURPLE")
                        .setTitle("✅ All Guilds we are in!")
                        .setDescription(String(guildsin.map(id => `${client.guilds.cache.get(id) ? `**${client.guilds.cache.get(id).name}** (\`${id}\`)`: `\`${id}\``}`).join("\n")).substr(0, 2048))
                        .setFooter("Information: If your Guild is not showing, then just send the ID of the Guild you want to get help with!")
                    message.reply({
                        embeds: [
                            embed,
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("GREEN")
                                .setTitle("👍 Select which Guild you wanna ask for Support!")
                                .setDescription(`**Please send the ID of the GUILD you wanna get Support with!**\n\n**Example:**\n> \`${guildsin[0]}\``)
                        ]
                    });
                }
            }
            //SUPPORT MESSAGES ETC.            
            else {
                let guild = client.guilds.cache.get(client.modmailDb.get(dmauthor.id, "id"));
                if(!guild) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Unable to find the Support GUILD, try again!")
                            ]
                    }).catch(console.error)
                }
                let channel = guild.channels.cache.get(client.modmailDb.get(dmauthor.id, "channel"));
                if(!channel) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                                .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                                .setTimestamp()
                                .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                                .setColor("RED")
                                .setTitle("❌ Unable to find the Support Channel, try again!")
                            ],
                            components: [
                                new Discord.MessageActionRow().addComponents(
                                    new Discord.MessageButton().setStyle("SECONDARY").setLabel("FORCE CLOSE IT").setCustomId("force_modmail_close").setEmoji("❎")
                                )
                            ]
                    }).catch(console.error)
                }
                let attachment = [];
                if(message.attachments.size > 0){
                    if(["png", "jpeg", "jpg", "gif"].some(i => message.attachments.first()?.url?.toLowerCase()?.includes(i))){
                        attachment = [new Discord.MessageAttachment(message.attachments.first()?.url)]
                    } else {
                        attachment = [];
                    }
                }
                let embed = new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("GREEN")
                    .setTitle("📨 Sent a new Message")
                    .setDescription(`${message.content}`.substr(0, 2048))
                if(attachment.length > 0){
                    console.log(attachment)
                    embed.setImage('attachment://unknown.png');
                }
                channel.send({
                    files: attachment,
                    embeds: [embed
                        ]
                }).catch(error=>{
                    console.log(error)
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Failed to send a Message to the Channel")
                            .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                           ]
                    }).catch(console.error)
                })
                .then(success=>{
                    message.react("📨").catch(console.error)
                    message.react("✅").catch(console.error)
                });
            }
        }
    })


    client.on("interactionCreate", async interaction => {
        if(interaction.isButton() && interaction.customId == "close_modmail_ticket" && !interaction.guildId){
            let dmauthor = interaction.user;
            if(!client.modmailDb.has(dmauthor.id))
                return interaction.reply({
                    content: "❌ **You are not having a Ticket anymore!**",
                    ephemeral: true
                })
            let guild = client.guilds.cache.get(client.modmailDb.get(dmauthor.id, "id"));
            if(!guild) {
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Unable to find the Support GUILD, try again!")
                        ],
                        ephemeral: true
                }).catch(console.error)
            }
            let channel = guild.channels.cache.get(client.modmailDb.get(dmauthor.id, "channel"));
            if(!channel) {
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ Unable to find the Support Channel, try again!")
                        ],
                        components: [
                            new Discord.MessageActionRow().addComponents(
                                new Discord.MessageButton().setStyle("SECONDARY").setLabel("FORCE CLOSE IT").setCustomId("force_modmail_close").setEmoji("❎")
                            )
                        ],
                        ephemeral: true
                }).catch(console.error)
            }
            interaction.reply({
                content: "**Closed the Ticket!**",
                ephemeral: true
            })
            client.modmailDb.delete(dmauthor.id);
            msglimit = 1000;
            //The text content collection
            let messageCollection = new Discord.Collection(); //make a new collection
            let channelMessages = await channel.messages.fetch({ //fetch the last 100 messages
                limit: 100
            }).catch(err => console.log(err)); //catch any error
            messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
            let tomanymsgs = 1; //some calculation for the messagelimit
            if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
            let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
            if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
            while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
                tomanymsgs += 1; //add 1 to the counter
                let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                channelMessages = await channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId
                }).catch(err => console.log(err)); //Fetch again, 100 messages above the already fetched messages
                if (channelMessages) //if its true
                    messageCollection = messageCollection.concat(channelMessages); //add them to the collection
            }
            //reverse the array to have it listed like the discord chat
            let attachment = [];
            try {
                attachment = [await create_transcript_buffer([...messageCollection.values()], channel, channel.guild)]
            } catch (e){
                console.log(e)
                attachment = []
            }
            await dmauthor.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ TicketUser Closed the Ticket")
                    ]
            }).catch(console.error)
            await channel.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ TicketUser Closed the Ticket")
                        .setDescription(`U CAN NOW DELETE IT IF YOU WANT!`)
                    ]
            }).catch(console.error)
            try{ fs.unlinkSync(`${process.cwd()}/${channel.name}.html`)}catch(e){ console.log(e) }
        }
        if(interaction.isButton() && interaction.customId == "force_modmail_close" && !interaction.guildId){
            if(client.modmailDb.has(interaction.user.id)) client.modmailDb.delete(interaction.user.id);
            interaction.reply({
                content: "**Force Closed the Ticket you can now create new ones!**",
                ephemeral: true
            })
        }
        if(interaction.isButton() && interaction.customId == "close_modmail_ticket" && interaction.guildId){
            let serverauthor = interaction.user;
            let authorId = client.modmailDb.findKey(d => d.id == interaction.message.guild.id && d.channel == interaction.message.channel.id);
            if(!authorId) 
            return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ This Channel is Closed / the user left!")
                            .setDescription(`Close the Ticket with: \`${config.prefix}forceclose\`\nAfter that, you can delete the Channel!`)
                        ]
                }).catch(console.error);
            let author = interaction.message.guild.members.cache.get(authorId);
            if(!author)
            author = await interaction.message.guild.members.fetch(authorId).catch(e=>{
                console.log(e)
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ The User left the Server")
                            .setDescription(`Close the Ticket with: \`${config.prefix}close\``)
                        ]
                }).catch(console.error)
            })
            if(!author){
                return interaction.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                            .setTimestamp()
                            .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                            .setColor("RED")
                            .setTitle("❌ The User left the Server")
                            .setDescription(`Close the Ticket with: \`${config.prefix}forceclose\``)
                        ]
                }).catch(console.error)
            }
            interaction.reply({
                content: "**Closed the Ticket!**",
                ephemeral: true
            })
            client.modmailDb.delete(authorId);
            msglimit = 1000;
            //The text content collection
            let messageCollection = new Discord.Collection(); //make a new collection
            let channelMessages = await interaction.message.channel.messages.fetch({ //fetch the last 100 messages
                limit: 100
            }).catch(err => console.log(err)); //catch any error
            messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
            let tomanymsgs = 1; //some calculation for the messagelimit
            if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
            let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
            if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
            while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
                tomanymsgs += 1; //add 1 to the counter
                let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                channelMessages = await interaction.message.channel.messages.fetch({
                    limit: 100,
                    before: lastMessageId
                }).catch(err => console.log(err)); //Fetch again, 100 messages above the already fetched messages
                if (channelMessages) //if its true
                    messageCollection = messageCollection.concat(channelMessages); //add them to the collection
            }
            //reverse the array to have it listed like the discord chat
            let attachment = [];
            try {
                attachment = [await create_transcript_buffer([...messageCollection.values()], interaction.message.channel, interaction.message.guild)]
                
            } catch (e){
                console.log(e)
                attachment = []
            }
            await author.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Supporter Closed the Ticket")
                    ]
            }).catch(console.error)
            await interaction.user.send({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Supporter Closed the Ticket")
                    ]
            }).catch(console.error)
            await interaction.message.reply({
                files: attachment,
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(serverauthor.tag, serverauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${serverauthor.id}`, serverauthor.displayAvatarURL({dynamic: true}))
                        .setColor("GREEN")
                        .setTitle("✅ Supporter Closed the Ticket")
                        .setDescription(`U CAN NOW DELETE IT IF YOU WANT!`)
                    ]
            }).catch(console.error)
            try{ fs.unlinkSync(`${process.cwd()}/${channel.name}.html`)}catch(e){  }
        }
    })

    //security
    client.on("channelDelete", channel => {
        if(channel.guild){
            let authorId = client.modmailDb.findKey(d => d.id == channel.guild.id && d.channel == channel.id);
            if(authorId) client.modmailDb.delete(authorId);
        }
    })
    
    function startSupportProcess(guild, message, dmauthor){
        client.modmailDb.ensure(guild.id, {
            enabled: false,
            category: null,
            message: "Start typing what you need and get Help!"
        })
        let data = client.modmailDb.get(guild.id)
        if(!data.enabled){
            client.modmailDb.delete(dmauthor.id);
            return message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                        .setTimestamp()
                        .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                        .setColor("RED")
                        .setTitle("❌ This Guild is not setupped yet!")
                        .setDescription(`an admin can do it with \`${config.prefix}setup\``)
                ]
            }).catch(console.error)
        }
        let category = guild.channels.cache.get(data.category);
        if(category && category.type == "GUILD_CATEGORY") {
            if(category.children.size >= 50){
                category == null;
            }
        }
        guild.channels.create(`${dmauthor.username}`.substr(0, 32) , {
            type: "GUILD_TEXT",
            topic: `Modmail Ticket for: ${dmauthor.tag} | ${dmauthor.id}`,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ["VIEW_CHANNEL"]
                }
            ]
        }).then(channel => {
            if(category) {
                channel.setParent(category.id);
            }
            client.modmailDb.set(dmauthor.id, channel.id, "channel");
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("BLURPLE")
                    .setTitle("✅ Succesfully Created your Support Ticket!")
                    .setDescription(`${data.message}`)
                    .addField("Visibility", `${!category ? "Only Admins can see it!" : "Using the Settings of it's Category"}`)
                   ],
                   components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                    .setStyle("DANGER").setEmoji("💥").setLabel("Close this Ticket").setCustomId("close_modmail_ticket"))]
            }).catch(console.error)
            channel.send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("GREEN")
                    .setTitle("✅ Created an Support Ticket!")
                    .addField("Visibility", `${!category ? "Only Admins can see it!" : "Using the Settings of it's Category"}`)
                   ],
                   components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                    .setStyle("DANGER").setEmoji("💥").setLabel("Close this Ticket").setCustomId("close_modmail_ticket"))]
            }).catch(console.error)
            //START THE SUPPORTING HELP!
        }).catch(error=>{
            console.log(error)
            client.modmailDb.delete(dmauthor.id);
            return message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setAuthor(dmauthor.tag, dmauthor.displayAvatarURL({dynamic: true}))
                    .setTimestamp()
                    .setFooter(`ID: ${dmauthor.id}`, dmauthor.displayAvatarURL({dynamic: true}))
                    .setColor("RED")
                    .setTitle("❌ Failed to create the Support Ticket! | CANCELLED")
                    .setDescription(`\`\`\`${error.message ? String(error.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
                   ]
            }).catch(console.error)
        })
    }
}

/**
 *  CREATEING A TRANSCRIPT
 * @param {*} Messages 
 * @param {*} Channel 
 * @param {*} Guild 
 * @returns ticketname.html FILE
 */

async function create_transcript_buffer(Messages, Channel, Guild){
    return new Promise(async (resolve, reject) => {
      try{
        let baseHTML = `<!DOCTYPE html>` + 
        `<html lang="en">` + 
        `<head>` + 
        `<title>${Channel.name}</title>` + 
        `<meta charset="utf-8" />` + 
        `<meta name="viewport" content="width=device-width" />` + 
        `<style>mark{background-color: #202225;color:#F3F3F3;}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-300.woff);font-weight:300}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-400.woff);font-weight:400}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-500.woff);font-weight:500}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-600.woff);font-weight:600}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-700.woff);font-weight:700}body{font-family:Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:17px}a{text-decoration:none}a:hover{text-decoration:underline}img{object-fit:contain}.markdown{max-width:100%;line-height:1.3;overflow-wrap:break-word}.preserve-whitespace{white-space:pre-wrap}.spoiler{display:inline-block}.spoiler--hidden{cursor:pointer}.spoiler-text{border-radius:3px}.spoiler--hidden .spoiler-text{color:transparent}.spoiler--hidden .spoiler-text::selection{color:transparent}.spoiler-image{position:relative;overflow:hidden;border-radius:3px}.spoiler--hidden .spoiler-image{box-shadow:0 0 1px 1px rgba(0,0,0,.1)}.spoiler--hidden .spoiler-image *{filter:blur(44px)}.spoiler--hidden .spoiler-image:after{content:"SPOILER";color:#dcddde;background-color:rgba(0,0,0,.6);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:600;padding:100%;border-radius:20px;letter-spacing:.05em;font-size:.9em}.spoiler--hidden:hover .spoiler-image:after{color:#fff;background-color:rgba(0,0,0,.9)}blockquote{margin:.1em 0;padding-left:.6em;border-left:4px solid;border-radius:3px}.pre{font-family:Consolas,"Courier New",Courier,monospace}.pre--multiline{margin-top:.25em;padding:.5em;border:2px solid;border-radius:5px}.pre--inline{padding:2px;border-radius:3px;font-size:.85em}.mention{border-radius:3px;padding:0 2px;color:#dee0fc;background:rgba(88,101,242,.3);font-weight:500}.mention:hover{background:rgba(88,101,242,.6)}.emoji{width:1.25em;height:1.25em;margin:0 .06em;vertical-align:-.4em}.emoji--small{width:1em;height:1em}.emoji--large{width:2.8em;height:2.8em}.chatlog{max-width:100%}.message-group{display:grid;margin:0 .6em;padding:.9em 0;border-top:1px solid;grid-template-columns:auto 1fr}.reference-symbol{grid-column:1;border-style:solid;border-width:2px 0 0 2px;border-radius:8px 0 0 0;margin-left:16px;margin-top:8px}.attachment-icon{float:left;height:100%;margin-right:10px}.reference{display:flex;grid-column:2;margin-left:1.2em;margin-bottom:.25em;font-size:.875em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-items:center}.reference-av{border-radius:50%;height:16px;width:16px;margin-right:.25em}.reference-name{margin-right:.25em;font-weight:600}.reference-link{flex-grow:1;overflow:hidden;text-overflow:ellipsis}.reference-link:hover{text-decoration:none}.reference-content>*{display:inline}.reference-edited-tst{margin-left:.25em;font-size:.8em}.ath-av-container{grid-column:1;width:40px;height:40px}.ath-av{border-radius:50%;height:40px;width:40px}.messages{grid-column:2;margin-left:1.2em;min-width:50%}.messages .bot-tag{top:-.2em}.ath-name{font-weight:500}.tst{margin-left:.3em;font-size:.75em}.message{padding:.1em .3em;margin:0 -.3em;background-color:transparent;transition:background-color 1s ease}.content{font-size:.95em;word-wrap:break-word}.edited-tst{margin-left:.15em;font-size:.8em}.attachment{margin-top:.3em}.attachment-thumbnail{vertical-align:top;max-width:45vw;max-height:225px;border-radius:3px}.attachment-container{height:40px;width:100%;max-width:520px;padding:10px;border:1px solid;border-radius:3px;overflow:hidden;background-color:#2f3136;border-color:#292b2f}.attachment-icon{float:left;height:100%;margin-right:10px}.attachment-filesize{color:#72767d;font-size:12px}.attachment-filename{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.embed{display:flex;margin-top:.3em;max-width:520px}.embed-color-pill{flex-shrink:0;width:.25em;border-top-left-radius:3px;border-bottom-left-radius:3px}.embed-content-container{display:flex;flex-direction:column;padding:.5em .6em;border:1px solid;border-top-right-radius:3px;border-bottom-right-radius:3px}.embed-content{display:flex;width:100%}.embed-text{flex:1}.embed-ath{display:flex;margin-bottom:.3em;align-items:center}.embed-ath-icon{margin-right:.5em;width:20px;height:20px;border-radius:50%}.embed-ath-name{font-size:.875em;font-weight:600}.embed-title{margin-bottom:.2em;font-size:.875em;font-weight:600}.embed-description{font-weight:500;font-size:.85em}.embed-fields{display:flex;flex-wrap:wrap}.embed-field{flex:0;min-width:100%;max-width:506px;padding-top:.6em;font-size:.875em}.embed-field--inline{flex:1;flex-basis:auto;min-width:150px}.embed-field-name{margin-bottom:.2em;font-weight:600}.embed-field-value{font-weight:500}.embed-thumbnail{flex:0;margin-left:1.2em;max-width:80px;max-height:80px;border-radius:3px}.embed-image-container{margin-top:.6em}.embed-image{max-width:500px;max-height:400px;border-radius:3px}.embed-footer{margin-top:.6em}.embed-footer-icon{margin-right:.2em;width:20px;height:20px;border-radius:50%;vertical-align:middle}.embed-footer-text{display:inline;font-size:.75em;font-weight:500}.reactions{display:flex}.reaction{display:flex;align-items:center;margin:.35em .1em .1em .1em;padding:.2em .35em;border-radius:8px}.reaction-count{min-width:9px;margin-left:.35em;font-size:.875em}.bot-tag{position:relative;margin-left:.3em;margin-right:.3em;padding:.05em .3em;border-radius:3px;vertical-align:middle;line-height:1.3;background:#7289da;color:#fff;font-size:.625em;font-weight:500}.postamble{margin:1.4em .3em .6em .3em;padding:1em;border-top:1px solid}body{background-color:#36393e;color:#dcddde}a{color:#0096cf}.spoiler-text{background-color:rgba(255,255,255,.1)}.spoiler--hidden .spoiler-text{background-color:#202225}.spoiler--hidden:hover .spoiler-text{background-color:rgba(32,34,37,.8)}.quote{border-color:#4f545c}.pre{background-color:#2f3136!important}.pre--multiline{border-color:#282b30!important;color:#b9bbbe!important}.preamble__entry{color:#fff}.message-group{border-color:rgba(255,255,255,.1)}.reference-symbol{border-color:#4f545c}.reference-icon{width:20px;display:inline-block;vertical-align:bottom}.reference{color:#b5b6b8}.reference-link{color:#b5b6b8}.reference-link:hover{color:#fff}.reference-edited-tst{color:rgba(255,255,255,.2)}.ath-name{color:#fff}.tst{color:rgba(255,255,255,.2)}.message--highlighted{background-color:rgba(114,137,218,.2)!important}.message--pinned{background-color:rgba(249,168,37,.05)}.edited-tst{color:rgba(255,255,255,.2)}.embed-color-pill--default{background-color:#4f545c}.embed-content-container{background-color:rgba(46,48,54,.3);border-color:rgba(46,48,54,.6)}.embed-ath-name{color:#fff}.embed-ath-name-link{color:#fff}.embed-title{color:#fff}.embed-description{color:rgba(255,255,255,.6)}.embed-field-name{color:#fff}.embed-field-value{color:rgba(255,255,255,.6)}.embed-footer{color:rgba(255,255,255,.6)}.reaction{background-color:rgba(255,255,255,.05)}.reaction-count{color:rgba(255,255,255,.3)}.info{display:flex;max-width:100%;margin:0 5px 10px 5px}.guild-icon-container{flex:0}.guild-icon{max-width:88px;max-height:88px}.metadata{flex:1;margin-left:10px}.guild-name{font-size:1.2em}.channel-name{font-size:1em}.channel-topic{margin-top:2px}.channel-message-count{margin-top:2px}.channel-timezone{margin-top:2px;font-size:.9em}.channel-date-range{margin-top:2px}</style>` +
        `<script>function scrollToMessage(e,t){var o=document.getElementById("message-"+t);null!=o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function scrollToMessage(e,t){var o=document.getElementById("message-"+t);o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function showSpoiler(e,t){t&&t.classList.contains("spoiler--hidden")&&(e.preventDefault(),t.classList.remove("spoiler--hidden"))}</script>` + 
        `<script>document.addEventListener('DOMContentLoaded', () => {document.querySelectorAll('.pre--multiline').forEach((block) => {hljs.highlightBlock(block);});});</script>` + 
        `</head>`;
        let messagesArray = []
        let messagescount = Messages.length;
        let msgs = Messages.reverse(); //reverse the array to have it listed like the discord chat
        //now for every message in the array make a new paragraph!
        await msgs.forEach(async msg => {
            //Aug 02, 2021 12:20 AM
            if(msg.type == "DEFAULT"){
              let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:MM:ss")
              let subcontent = `<div class="message-group">` + 
              `<div class="ath-av-container"><img class="ath-av"src="${msg.author.displayAvatarURL({dynamic: true})}" /></div>` + 
              `<div class="messages">` + 
              `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
              if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
              subcontent += `<span class="tst">ID: ${msg.author.id} | </span>` + 
              `<span class="tst">${time} ${msg.editedTimestamp ? `(edited)` : msg.editedAt ? `(edited)` : ""}</span>` + 
              `<div class="message">`;
              if (msg.content) {
                subcontent += `<div class="content"><div class="markdown"><span class="preserve-whitespace">${markdowntohtml(String(msg.cleanContent ? msg.cleanContent : msg.content).replace(/\n/ig, "<br/>"))}</div></div>` 
              } 
              if (msg.embeds[0]){
                  subcontent += `<div class="embed"><div class=embed-color-pill style=background-color:"${msg.embeds[0].color ? msg.embeds[0].color : "transparent"}"></div><div class=embed-content-container><div class=embed-content><div class=embed-text>` 
                  
                  if(msg.embeds[0].author){
                    subcontent += `<div class="embed-ath">`;
                    if(msg.embeds[0].author.iconURL){
                      subcontent += `<img class="embed-ath-icon" src="${msg.embeds[0].author.iconURL}">`
                    }
                    if(msg.embeds[0].author.name){
                      subcontent += `<div class="embed-ath-name"><span class="markdown">${markdowntohtml(String(msg.embeds[0].author.name).replace(/\n/ig, "<br/>"))}</span></div>`
                    }
                    subcontent += `</div>`
                  }if(msg.embeds[0].title){
                    subcontent += `<div class="embed-title"><span class="markdown">${markdowntohtml(String(msg.embeds[0].title).replace(/\n/ig, "<br/>"))}</span></div>`;
                  }
                  if(msg.embeds[0].description){
                    subcontent += `<div class="embed-description preserve-whitespace"><span class="markdown" style="color: rgba(255,255,255,.6) !important;">${markdowntohtml(String(msg.embeds[0].description).replace(/\n/ig, "<br/>"))}</span></div>`;
                  }
                  if(msg.embeds[0].image){
                    subcontent += `<div class="embed-image-container"><img class="embed-footer-image" src="${msg.embeds[0].image.url}"></div>`
                  }
                  if(msg.embeds[0].fields && msg.embeds[0].fields.length > 0){
                    subcontent += `<div class="embed-fields">`
                    for(let i = 0; i < msg.embeds[0].fields.length; i++){
                        subcontent += `<div class="embed-field ${msg.embeds[0].fields[i].inline ? `embed-field--inline` : ``}">`
                        const field = msg.embeds[0].fields[i]
                        if(field.key){
                          subcontent += `<div class="embed-field-name">${markdowntohtml(String(field.key).replace(/\n/ig, "<br/>"))}</div>`;
                        }
                        if(field.value){
                          subcontent += `<div class="embed-field-value">${markdowntohtml(String(field.value).replace(/\n/ig, "<br/>"))}</div>`;
                        }
                        subcontent += `</div>`
                    }
                    subcontent += `</div>`;
                  }
                  if(msg.embeds[0].footer){
                    subcontent += `<div class="embed-footer">`;
                    if(msg.embeds[0].footer.iconURL){
                      subcontent += `<img class="embed-footer-icon" src="${msg.embeds[0].footer.iconURL}">`
                    }
                    if(msg.embeds[0].footer.text){
                      subcontent += `<div class="embed-footer-text"><span class="markdown">${markdowntohtml(String(msg.embeds[0].footer.text).replace(/\n/ig, "<br/>"))}</span></div>`
                    }
                    subcontent += `</div>`
                  }
                  subcontent += `</div>`;
                  if(msg.embeds[0].thumbnail && msg.embeds[0].thumbnail.url){
                    subcontent += `<img class="embed-thumbnail" src="${msg.embeds[0].thumbnail.url}">`;
                  }
                  subcontent += `</div></div></div>`;
              }
              if (msg.reactions && msg.reactions.cache.size > 0){
                subcontent += `<div class="reactions">`
                for(const reaction of [...msg.reactions.cache.values()]){                      
                  subcontent += `<div class=reaction>${reaction.emoji.url ? `<img class="emoji emoji--small" src="${reaction.emoji.url}" alt="${"<" + reaction.emoji.animated ? "a" : "" + ":" + reaction.emoji.name + ":" + reaction.emoji.id + ">"}">` : reaction.emoji.name.toString()}<span class="reaction-count">${reaction.count}</span></div>`
                }
                subcontent += `</div>`
              }
              subcontent += `</div></div></div>`
              messagesArray.push(subcontent);
            }
            if(msg.type == "PINS_ADD"){
              let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:MM:ss")
              let subcontent = `<div class="message-group">` + 
              `<div class="ath-av-container"><img class="ath-av"src="https://cdn-0.emojis.wiki/emoji-pics/twitter/pushpin-twitter.png" style="background-color: #000;filter: alpha(opacity=40);opacity: 0.4;" /></div>` + 
              `<div class="messages">` + 
              `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
              if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
              subcontent += `<span class="tst" style="font-weight:500;color:#848484;font-size: 14px;">pinned a message to this channel.</span><span class="tst">${time}</span></div></div></div>`;
            messagesArray.push(subcontent);
            }
        });
        baseHTML += `<body><div class="info"><div class="guild-icon-container"> <img class="guild-icon" src="${Guild.iconURL({dynamic:true})}" />` +
          `</div><div class="metadata">` +
          `<div class="guild-name"><strong>Guild:</strong> ${Guild.name} (<mark>${Guild.id})</mark></div>` +
          `<div class="channel-name"><strong>Channel:</strong> ${Channel.name} (<mark>${Channel.id})</mark></div>` +
          `<div class="channel-message-count"><mark>${messagescount} Messages</mark></div>` +
          `<div class="channel-timezone"><strong>Timezone-Log-Created:</strong> <mark>${moment(Date.now()).format("MMM DD, YYYY HH:MM")}</mark> | <em>[MEZ] Europe/London</em></div>` +
          `</div></div>` +
          `<div class="chatlog">`;
          baseHTML += messagesArray.join("\n");
          baseHTML += `<div class="message-group"><div class="ath-av-container"><img class="ath-av"src="https://logosmarken.com/wp-content/uploads/2020/12/Discord-Logo.png" /></div><div class="messages"><span class="ath-name" style="color: #ff5151;">TICKET LOG INFORMATION</span><span class="bot-tag">✓ SYSTEM</span><span class="timestamp">Mind this Information</span><div class="message " ><div class="content"><div class="markdown"><span class="preserve-whitespace"><i><blockquote>If there are Files, Attachments, Vidoes or Images, they won't always be displayed cause they will be unknown and we don't want to spam an API like IMGUR!</blockquote></i></span></div></div></div></div></div></div></body></html>`;
        fs.writeFileSync(`${process.cwd()}/${Channel.name}.html`, baseHTML); //write everything in the docx file
        resolve(`${process.cwd()}/${Channel.name}.html`);
        return;
        function markdowntohtml(tomarkdown){
          mentionReplace(tomarkdown.split(" "));
          function mentionReplace(splitted){
            for(arg of splitted){
              const memberatches = arg.match(/<@!?(\d+)>/);
              const rolematches = arg.match(/<@&(\d+)>/);
              const channelmatches = arg.match(/<#(\d+)>/);
              if (rolematches) {
                let role = Guild.roles.cache.get(rolematches[1])
                if(role){
                  let torpleace = new RegExp(rolematches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span title="${role.id}" style="color: ${role.hexColor};">@${role.name}</span>`);
                }
              }
              if(memberatches){
                let member = Guild.members.cache.get(memberatches[1])
                if(member){
                  let torpleace = new RegExp(memberatches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${member.id}">@${member.user.username}</span>`);
                }
              }
              if(channelmatches){
                let channel = Guild.channels.cache.get(channelmatches[1])
                if(channel){
                  let torpleace = new RegExp(channelmatches[0], "g")
                  tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${channel.id}">@${channel.name}</span>`);
                }
              }
            }
          }
          var output = "";
          var BLOCK = "block";
          var INLINE = "inline";
          var parseMap = [
            {
              // <p>
              pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
              replace: "$1<br/>",
              type: BLOCK,
            },
            {
              // <blockquote>
              pattern: /\n(?:&gt;|\>)\W*(.*)/g,
              replace: "<blockquote><p>$1</p></blockquote>",
              type: BLOCK,
            },
            {
              // <ul>
              pattern: /\n\s?\*\s*(.*)/g,
              replace: "<ul>\n\t<li>$1</li>\n</ul>",
              type: BLOCK,
            },
            {
              // <ol>
              pattern: /\n\s?[0-9]+\.\s*(.*)/g,
              replace: "<ol>\n\t<li>$1</li>\n</ol>",
              type: BLOCK,
            },
            {
              // <strong>
              pattern: /(\*\*|__)(.*?)\1/g,
              replace: "<strong>$2</strong>",
              type: INLINE,
            },
            {
              // <em>
              pattern: /(\*)(.*?)\1/g,
              replace: "<em>$2</em>",
              type: INLINE,
            },
            {
              // <a>
              pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
              replace: "$1<a href=\"$3\">$2</a>",
              type: INLINE,
            },
            {
              // <img>
              pattern: /!\[([^\[]+)\]\(([^\)]+)\)/g,
              replace: "<img src=\"$2\" alt=\"$1\" />",
              type: INLINE,
            },
            {
              // <code>
              pattern: /`(.*?)`/g,
              replace: "<mark>$1</mark>",
              type: INLINE,
            },
          ];
          function parse(string) {
            output = "\n" + string + "\n";
            parseMap.forEach(function(p) {
              output = output.replace(p.pattern, function() {
                return replace.call(this, arguments, p.replace, p.type);
              });
            });
            output = clean(output);
            output = output.trim();
            output = output.replace(/[\n]{1,}/g, "\n");
            return output;
          }
          function replace(matchList, replacement, type) {
            var i, $$;
            for(i in matchList) {
              if(!matchList.hasOwnProperty(i)) {
                continue;
              }
              replacement = replacement.split("$" + i).join(matchList[i]);
              replacement = replacement.split("$L" + i).join(matchList[i].length);
            }
            if(type === BLOCK) {
              replacement = replacement.trim() + "\n";
            }
            return replacement;
          }
          function clean(string) {
            var cleaningRuleArray = [
              {
                match: /<\/([uo]l)>\s*<\1>/g,
                replacement: "",
              },
              {
                match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
                replacement: "$1",
              },
            ];
            cleaningRuleArray.forEach(function(rule) {
              string = string.replace(rule.match, rule.replacement);
            });
            return string;
          }
          
          let output__ = parse(tomarkdown);
          return output__;
        }
      }catch (e){
        reject(e);
        return;
      }
    })          
}

/**
 *  LEAVING THE PREFIX
 * @param {*} str 
 * @returns prefix/ping
 */
function escapeRegex(str){
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}