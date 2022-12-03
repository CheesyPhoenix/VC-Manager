import {
	ChannelType,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
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
	const guild = newState.guild;

	guild.channels.fetch();
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

	const parent = channels.at(0)?.parent;

	const vcs: GuildBasedChannel[] = [];

	Array.from(channels).forEach((channel, i) => {
		const vc = channel[1];

		const memberCount = Array.from(
			vc.members as Collection<string, GuildMember>
		).length;

		if (memberCount == 0 && i != Array.from(channels).length - 1) {
			vc.delete();
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
});

// Log in to Discord with your client's token

client.login(process.env.TOKEN);
