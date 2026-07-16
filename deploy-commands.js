const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Definiamo i comandi da registrare
const commands = [
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banna un utente Roblox dal server RP')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo del ban').setRequired(true))
        .addStringOption(opt => opt.setName('durata').setDescription('Durata (es. 7 Giorni, Permanente)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Ammonisci un utente Roblox')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo del warn').setRequired(true)),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Rimuovi il ban a un utente Roblox')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo della revoca').setRequired(true)),

    new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Rimuovi un warn a un utente Roblox')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo della revoca').setRequired(true)),

    new SlashCommandBuilder()
        .setName('permajail')
        .setDescription('Metti in Perma Jail un utente Roblox')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo della Perma Jail').setRequired(true)),

    new SlashCommandBuilder()
        .setName('permadeath')
        .setDescription('Dichiara la Perma Death di un personaggio Roblox')
        .addStringOption(opt => opt.setName('roblox_user').setDescription('Nome utente Roblox').setRequired(true))
        .addStringOption(opt => opt.setName('motivazione').setDescription('Motivo della morte permanente').setRequired(true))
].map(command => command.toJSON());

// Prepariamo il client REST di Discord
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Inizio aggiornamento dei comandi slash dell\'applicazione...');

        // Questo registra i comandi GLOBALMENTE (su tutti i server in cui si trova il bot)
        // Nota: la registrazione globale può impiegare qualche secondo per propagarsi.
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // USEREMO L'ID DEL BOT QUI
            { body: commands }
        );

        console.log('Comandi slash registrati con successo globalmente!');
    } catch (error) {
        console.error(error);
    }
})();