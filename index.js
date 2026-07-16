const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder 
} = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ID del ruolo autorizzato a usare i comandi di moderazione
const AUTHORIZED_ROLE_ID = "1516018145117212733";

// Funzione helper per ottenere l'ID e l'Avatar di Roblox dal Username
async function getRobloxUserDetails(username) {
    try {
        // 1. Ottieni l'ID utente dal Username
        const userRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [username],
            excludeBannedUsers: false
        });

        if (!userRes.data.data || userRes.data.data.length === 0) {
            return { error: "Utente Roblox non trovato." };
        }

        const userId = userRes.data.data[0].id;

        // 2. Ottieni l'avatar (bust/headshot)
        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=180x180&format=Png&isCircular=false`);
        const avatarUrl = avatarRes.data.data[0]?.imageUrl || "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-Png/180/180/AvatarHeadshot/Png/isCircular=false"; // fallback

        return { userId, avatarUrl };
    } catch (err) {
        console.error(err);
        return { error: "Errore nel recupero dei dati da Roblox." };
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot online ed eseguito come ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- CONTROLLO DEL RUOLO ---
    // Verifichiamo se l'utente che esegue il comando ha il ruolo abilitato
    if (!interaction.member.roles.cache.has(AUTHORIZED_ROLE_ID)) {
        return interaction.reply({ 
            content: `❌ Non hai i permessi necessari (Ruolo richiesto) per utilizzare i comandi dello staff.`, 
            ephemeral: true 
        });
    }

    // Se passa il controllo del ruolo, procediamo con l'esecuzione del comando
    await interaction.deferReply({ ephemeral: true });

    const robloxUser = interaction.options.getString('roblox_user');
    const motivazione = interaction.options.getString('motivazione');
    const staffMember = interaction.user; // Chi esegue il comando

    // Recupera i dati e l'avatar da Roblox
    const robloxData = await getRobloxUserDetails(robloxUser);
    if (robloxData.error) {
        return interaction.editReply({ content: `❌ Errore: ${robloxData.error}` });
    }

    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`; // Formato data Discord esteso

    try {
        if (interaction.commandName === 'ban') {
            const durata = interaction.options.getString('durata');
            const forumChannel = await client.channels.fetch(process.env.FORUM_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`🔴 UTENTE BANNATO: ${robloxUser}`)
                .setColor(0xFF0000)
                .setThumbnail(robloxData.avatarUrl)
                .addFields(
                    { name: '👤 Utente Roblox', value: `${robloxUser} (ID: ${robloxData.userId})`, inline: true },
                    { name: '⏳ Durata', value: durata, inline: true },
                    { name: '📆 Data e Ora', value: timestamp, inline: false },
                    { name: '📝 Motivazione', value: motivazione },
                    { name: '✍️ Firma Moderatore', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setFooter({ text: `Sistema Moderazione RP` })
                .setTimestamp();

            // Crea un post nel canale Forum
            await forumChannel.threads.create({
                name: `[BAN] ${robloxUser}`,
                message: { embeds: [embed] }
            });

            await interaction.editReply({ content: `✅ Ban registrato per **${robloxUser}** nel forum!` });
        }

        else if (interaction.commandName === 'warn') {
            const forumChannel = await client.channels.fetch(process.env.FORUM_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`🟡 UTENTE WARNATO: ${robloxUser}`)
                .setColor(0xFFAA00)
                .setThumbnail(robloxData.avatarUrl)
                .addFields(
                    { name: '👤 Utente Roblox', value: `${robloxUser} (ID: ${robloxData.userId})`, inline: true },
                    { name: '📆 Data e Ora', value: timestamp, inline: true },
                    { name: '📝 Motivazione', value: motivazione },
                    { name: '✍️ Firma Moderatore', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setFooter({ text: `Sistema Moderazione RP` })
                .setTimestamp();

            // Crea un post nel canale Forum
            await forumChannel.threads.create({
                name: `[WARN] ${robloxUser}`,
                message: { embeds: [embed] }
            });

            await interaction.editReply({ content: `✅ Warn registrato per **${robloxUser}** nel forum!` });
        }

        else if (interaction.commandName === 'unban') {
            const forumChannel = await client.channels.fetch(process.env.FORUM_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`🟢 BAN RIMOSSO: ${robloxUser}`)
                .setColor(0x00FF00)
                .setThumbnail(robloxData.avatarUrl)
                .addFields(
                    { name: '👤 Utente Roblox', value: `${robloxUser} (ID: ${robloxData.userId})`, inline: true },
                    { name: '📆 Data e Ora', value: timestamp, inline: true },
                    { name: '📝 Motivazione Revoca', value: motivazione },
                    { name: '✍️ Firma Moderatore', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setTimestamp();

            await forumChannel.threads.create({
                name: `[UNBAN] ${robloxUser}`,
                message: { embeds: [embed] }
            });

            await interaction.editReply({ content: `✅ Revoca Ban registrata per **${robloxUser}** nel forum!` });
        }

        else if (interaction.commandName === 'unwarn') {
            const forumChannel = await client.channels.fetch(process.env.FORUM_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`🟢 WARN RIMOSSO: ${robloxUser}`)
                .setColor(0x00FF00)
                .setThumbnail(robloxData.avatarUrl)
                .addFields(
                    { name: '👤 Utente Roblox', value: `${robloxUser} (ID: ${robloxData.userId})`, inline: true },
                    { name: '📆 Data e Ora', value: timestamp, inline: true },
                    { name: '📝 Motivazione Revoca', value: motivazione },
                    { name: '✍️ Firma Moderatore', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setTimestamp();

            await forumChannel.threads.create({
                name: `[UNWARN] ${robloxUser}`,
                message: { embeds: [embed] }
            });

            await interaction.editReply({ content: `✅ Revoca Warn registrata per **${robloxUser}** nel forum!` });
        }

        else if (interaction.commandName === 'permajail') {
            const jailChannel = await client.channels.fetch(process.env.PERMA_JAIL_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`⛓️ PERMA JAIL: ${robloxUser}`)
                .setColor(0x333333)
                .setThumbnail(robloxData.avatarUrl)
                .setDescription(`Il cittadino **${robloxUser}** è stato condannato alla prigione a vita.`)
                .addFields(
                    { name: '👤 Identificato come', value: `${robloxUser} (ID: ${robloxData.userId})` },
                    { name: '⚖️ Sentenza emessa il', value: timestamp },
                    { name: '📝 Capo d\'accusa / Motivo', value: motivazione },
                    { name: '✍️ Firma Autorità', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setTimestamp();

            await jailChannel.send({ embeds: [embed] });
            await interaction.editReply({ content: `⛓️ Perma Jail registrata nel canale dedicato!` });
        }

        else if (interaction.commandName === 'permadeath') {
            const deathChannel = await client.channels.fetch(process.env.PERMA_DEATH_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle(`💀 PERMA DEATH: ${robloxUser}`)
                .setColor(0x111111)
                .setThumbnail(robloxData.avatarUrl)
                .setDescription(`Annunciamo il decesso permanente del personaggio di **${robloxUser}**.`)
                .addFields(
                    { name: '👤 Identità deceduta', value: `${robloxUser} (ID: ${robloxData.userId})` },
                    { name: '📅 Data del decesso', value: timestamp },
                    { name: '📝 Dinamica / Causa', value: motivazione },
                    { name: '✍️ Firma Registratore', value: `${staffMember.tag} (${staffMember.toString()})` }
                )
                .setTimestamp();

            await deathChannel.send({ embeds: [embed] });
            await interaction.editReply({ content: `💀 Perma Death registrata nel canale dedicato!` });
        }

    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Si è verificato un errore durante l'invio del log." });
    }
});

client.login(process.env.DISCORD_TOKEN);