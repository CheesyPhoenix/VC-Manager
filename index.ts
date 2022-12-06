import {
	ChannelType,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Guild,
	GuildBasedChannel,
	GuildMember,
} from "discord.js";

import dotenv from "dotenv";
dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
	],
});

client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
	if (oldState.guild != undefined) {
		await updateGuild(oldState.guild);
	}
	if (newState.guild != undefined && oldState.guild != newState.guild) {
		await updateGuild(newState.guild);
	}
});

async function updateGuild(guild: Guild) {
	await guild.channels.fetch();
	const channels = guild.channels.cache.filter((channel) => {
		if (channel.type == ChannelType.GuildVoice) {
			if (
				channel.parent &&
				channel.parent.name.toLowerCase() == "managed vcs"
			) {
				return true;
			}
		}
		return false;
	});

	let emptyChannel = false;

	let vcIndex = 0;

	//const parent = channels.at(0)?.parent;
	const parent = guild.channels.cache.find(
		(channel) => channel.name.toLowerCase() == "managed vcs"
	);

	if (!parent) {
		const newParent = await guild.channels.create({
			name: "Managed VCs",
			type: ChannelType.GuildCategory,
		});

		guild.channels.create({
			name: "vc 0",
			type: ChannelType.GuildVoice,
			parent: newParent.id,
		});

		return;
	}

	const vcs: GuildBasedChannel[] = [];

	Array.from(channels).forEach((channel, i) => {
		const vc = channel[1];

		const memberCount = Array.from(
			vc.members as Collection<string, GuildMember>
		).length;

		if (memberCount == 0 && i != Array.from(channels).length - 1) {
			try {
				vc.delete();
			} catch (error) {}
		} else {
			vcIndex++;
			vcs.push(vc);

			if (memberCount == 0 && i == Array.from(channels).length - 1) {
				emptyChannel = true;
			}
		}
	});

	if (!emptyChannel && parent) {
		vcs.push(
			await guild.channels.create({
				name: "vc " + vcIndex,
				type: ChannelType.GuildVoice,
				parent: parent.id,
			})
		);
	}

	vcs.forEach((vc, i) => {
		vc.setName("vc " + i);
	});
}

// Log in to Discord with your client's token

client.login(process.env.TOKEN);
