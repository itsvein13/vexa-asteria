import { MessageFlags } from "discord.js";

/**
 * Balas interaction yang gagal dengan pesan error generik (ephemeral).
 * Aman dipanggil kapan pun — otomatis pilih reply/followUp/skip
 * tergantung state interaction-nya.
 */
async function replyError(interaction) {

    const payload = {
        content: "⚠️ Terjadi kesalahan saat memproses permintaanmu. Coba lagi ya.",
        flags: MessageFlags.Ephemeral
    };

    try {

        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }

    } catch {
        // Interaction sudah expired / ga bisa dibalas — cukup diamkan.
    }

}

export default {

    name: "interactionCreate",

    async execute(interaction, client) {

        // Resolve handler sesuai jenis interaction
        let handler = null;

        if (interaction.isChatInputCommand()) {
            handler = client.commands.get(interaction.commandName);
        } else if (interaction.isButton()) {
            handler = client.buttons.get(interaction.customId);
        } else if (interaction.isStringSelectMenu()) {
            handler = client.selectMenus.get(interaction.customId);
        }

        if (!handler) return;

        // Try/catch terpusat: satu handler error ga boleh bikin bot crash,
        // dan user tetap dapat feedback (bukan "application did not respond").
        try {
            await handler.execute(interaction, client);
        } catch (error) {

            const label = interaction.commandName ?? interaction.customId;
            console.error(`❌ Error di interaction "${label}":`, error);

            await replyError(interaction);

        }

    }

};
