const TeeworldsEcon = require('teeworlds-econ')
const { Client, GatewayIntentBits, Events, CategoryChannel, ChannelType} = require('discord.js');

require('dotenv').config();

const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,] });
const econ = new TeeworldsEcon(process.env.HOST, process.env.PORT, process.env.PASSWORD)
let discordChannel = null;
let discordReady = false, econReady = false;

discord.once(Events.ClientReady, c => {
    console.log('Discord bot logged in.');
    if(econReady) onReady();
    discordReady = true;
})

discord.on(Events.MessageCreate, msg => {
    if(msg.author.bot || msg.channel !== discordChannel || !msg.content) return;
    econ.say(`[D] ${msg.author.username}: ${msg.content}`);
})
econ.on('online', e => {
    console.log('Connected to econ');
    if(discordReady) onReady();
    econReady = true;
})

econ.on('chat', e => {
    console.log(`${e.player}: ${e.message}`)
    const sender = e.player ? e.player : "[Server]";
    if(discordChannel) {
        discordChannel.send(`${sender}: ${e.message}`);
    }
})

const onReady = async () => {
    const guild = discord.guilds.cache.find(c => c.id === process.env.GUILD_ID)
    const resp = await econ.exec("sv_name");
    const srvName = resp.split('Value: ')[1];
    const channelName = srvName.replaceAll(' ', '-').replaceAll("'", "").toLowerCase();
    let channel = guild.channels.cache.find(c => c.name === channelName);
    if(!channel) {
        let category = guild.channels.cache.find(c => c.name === "bridge" && c instanceof CategoryChannel);
        channel = await guild.channels.create({ name: channelName, type: ChannelType.GuildText, parent: category.id });
    }
    discordChannel = channel;
}

econ.connect();
discord.login(process.env.TOKEN);
