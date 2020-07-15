const http = require('http');
http.createServer(function(request,responce)
                  {
  responce.writeHead(200, {'Content-Type': 'text/plain'});
}).listen(3000);

const { Client, Util } = require('discord.js');
const { TOKEN, PREFIX, GOOGLE_API_KEY, LIEN1 } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const Discord = require("discord.js");

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map(); 

client.on('message', message => {
  if (message.content === `${PREFIX}support`) {
    message.reply('voici,le lien du serveur support: https://discord.gg/TjRwMGk [-1.15-]');
  }
});

client.on('message', message => {
  if (message.content === `${PREFIX}invite`) {
    message.reply('voici mon invitation : [ https://discordapp.com/oauth2/authorize?client_id=719847072873840720&scope=bot&permissions=2146958847 ]');
  }
});


client.on('message', message => {
  if (message.content === `${PREFIX}but`) {
    message.reply('mon but est de jouer de la musique ! ');
  }
});

client.on("guildMemberAdd", async member => { // Voici le nom de l'event
    
        let channeldebienvenue = member.guild.channels.get("720212420475355239"); // A la place de "ID DU SALON" vous pouvez mettre l'id du salon ou vous souhaitez que le bot envoie le message.
        channeldebienvenue.send(`Souhaitez la bienvenue à ${member} !`)

});

client.on("guildMemberRemove", async member => { // Voici le nom de l'event
    
        let channeldeadieu = member.guild.channels.get("720218241208942602"); // A la place de "ID DU SALON" vous pouvez mettre l'id du salon ou vous souhaitez que le bot envoie le message.
        channeldeadieu.send(`A la prochaine **${member}** !`)

});

client.on('message', message => {
  if (message.content === `${PREFIX}help`) {
    var embed = new Discord.RichEmbed()
    .setTitle('help [-`V1.15`-]')
    .setColor('#F72E1E')
    .setDescription(` \n${PREFIX}play,\n **Joue de la musique.** \n ${PREFIX}skip,\n**Skip la musique en cours (only admin).**  \n${PREFIX}np,\n**Donne la musique qui est en train de jouer.**  \n${PREFIX}volume, \n**Augemente le volume de le music.** \n${PREFIX}stop,\n**arrête la music **  \n${PREFIX}resume, \n**Met la music ou vous l'avez stopper.** \n${PREFIX}queue,\n**Donne la playlist.**  \n${PREFIX}pause,\n**Stop la music.** \n${PREFIX}support \n**Donne le serveur support du bot** \n${PREFIX}invite,\n**Donne l'invitation du bot.**  \n${PREFIX}but \n **Donne le but du bot sur Discord.** `)
    .setThumbnail(message.author.avatarURL) 
    .setTimestamp()
    .setFooter('By: Gravity - [-V 1.15-]','https://cdn.discordapp.com/icons/719836153905414194/a247c86f3eec01923587839baeda64de.png?size=2048');
    message.channel.send(embed);
  }
});


client.on('warn', console.warn);

client.on('error', console.error)

client.on('ready',() => {
    console.log('je suis en ligne (Bot: Hosting ' + `${client.users.size}` + ' users, in ' + `${client.channels.size}` + ' channels of ' + `${client.guilds.size}` + ' guilds.)')
    client.user.setActivity(`${PREFIX}help | ${client.guilds.size} Serveurs ! `, { type: "LISTENING"},);
/////////////////////////
//made Galaxigamer#1199//
/////////////////////////

});

client.on('disconnect', () => console.log('je me suis déconecter...'));

client.on('reconnecting', () => console.log('je me suis reconnecter'));

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)

	if (command === 'play') {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send('❌Je suis désolé mais vous devez être dans un canal vocal pour jouer de la musique!');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) {
            return msg.channel.send('Il semble que je ne peux pas me connecté');
        }
        if (!permissions.has('SPEAK')) {
            return msg.channel.send('je pas les permition requise pour produire de la musique !');
        }

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
                await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
            }
          var embed = new Discord.RichEmbed()
                .setTitle("Song Selection")
                .setDescription(`📃Playlist: **${playlist.title}** a été ajouté à la file d'attente!`)
                .setColor("RANDOM")
            return msg.channel.send(embed);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    var embed = new Discord.RichEmbed()
                        .setTitle("🎺 music Selection ✅  -  [`V 1.15`]")
                        .setDescription(`${videos.map(video2 => `**${++index}** \`${video2.title}\` `).join('\n')}`)
                        .setColor("#ff2052")
                        .setTimestamp()
                        .setFooter("Veuillez fournir une valeur pour sélectionner l'un des résultats de recherche allant de 1 à 10.")

                    msg.channel.send(embed);
                    // eslint-disable-next-line max-depth
                    try {
                        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        });
                    } catch (err) {
                        console.error(err);
                        return msg.channel.send('Aucune valeur ou valeur invalide entrée, annulation de la sélection vidéo.');
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return msg.channel.send('🆘 il y a aucun résultat de votre recherche.');
                }
            }
            return handleVideo(video, msg, voiceChannel);
        }
	} else if (command === 'skip') {
  
    
		if (!msg.member.voiceChannel) return msg.channel.send('vous êtes pas dans un canal vocal!');
		if (!serverQueue) return msg.channel.send('Il y a rien que je puisse skip pour toi.');
		serverQueue.connection.dispatcher.end('Skip commande à bien été effectuer');
    const embed = new Discord.RichEmbed()
    .setTitle('Music')
    .setColor('#ff2052')
    .setDescription('✅ Vous avez skip la chanson avec succès');
    msg.channel.send(embed);
    
		return undefined;
	} else if (command === 'stop') {
        if (!msg.member.voiceChannel) return msg.channel.send('Vous êtes pas dans un canal vocal!');
        if (!serverQueue) return msg.channel.send('Il y a rien à jouer ou que je puisse arrêter pour vous.');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Stop commande à bien été utiliser !');
        msg.reply("**bot a été arrêté!**");
        return undefined;
	} else if (command === 'volume') {
		if (!msg.member.voiceChannel) return msg.channel.send('Vous êtes pas dans un canal vocal!');
		if (!serverQueue) return msg.channel.send('voici ce que je vais jouer');
		if (!args[1]) return msg.channel.send(`le volume est à: **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 4);
		return msg.channel.send(`je mi le volume à **${args[1]}**`);
	} else if (command === 'np') {
    var embed = new Discord.RichEmbed()
    .setTitle("Song Detail")
    .setDescription(`🎶 \`voici ce que je joue:\` **${serverQueue.songs[0].title}**`)
    .setColor("#ff2052")
		if (!serverQueue) return msg.channel.send('voici ce que je vais jouer');
		return msg.channel.send(embed);

} else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('voici ce que je vais jouer');
		var embed = new Discord.RichEmbed()
                .setTitle("Playlist")
                .setDescription(`${serverQueue.songs.map(song => `**• ** ${song.title}`).join('\n')}

🎵 \`voici ce que je joue:\` **${serverQueue.songs[0].title}**`)
                .setColor("#ff2052")
    return msg.channel.send(embed);
	} else if (command === 'pause') {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            var embed = new Discord.RichEmbed()
                .setTitle("Song")
                .setDescription(`⏸pause `)
                .setColor("#ff2052")
            msg.channel.send(embed)
          
           }
          } else if (command === 'resume') {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            var embed = new Discord.RichEmbed()
                .setTitle("Song")
                .setDescription(`▶ j'ai résumer la music`)
                .setColor("#ff2052")
            msg.channel.send(embed)
        }
    } 

});


async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 10,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`❌je ne peux pas rejoindre votre vocal ! [ ${error} ]`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`❌je ne peux pas rejoindre votre vocal ! [ ${error} ]`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
    var embed = new Discord.RichEmbed()
                .setTitle("Song Selection")
                .setDescription(`✅ Playlist: **${playlist.title}** à bien été ajouter dans la playlist !`)
                .setColor("#ff2052")
		 return msg.channel.send(embed);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Le flux ne se génère pas assez rapidement.') 
      console.log('Song ended');
       else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
             
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 10);

	var embed = new Discord.RichEmbed()
        .setTitle("music Selection")
        .setDescription(`🎵 \`Début de cette music :\` **${song.title}**`)
        .setColor("#ff2052")
    serverQueue.textChannel.send(embed);
}


client.login(TOKEN);
       
