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

            // customId bisa "namaBase" (statis) atau "namaBase:data" (dinamis,
            // mis. "creator-approve:1234567890" untuk tombol per-user).
            // Split aman untuk keduanya — tombol statis lama tetap cocok
            // karena split(":")[0] pada string tanpa ":" balikin string itu sendiri.
            const baseId = interaction.customId.split(":")[0];
            handler = client.buttons.get(baseId);

        } else if (interaction.isStringSelectMenu()) {
            handler = client.selectMenus.get(interaction.customId);
        } else if (interaction.isModalSubmit()) {
            handler = client.modals.get(interaction.customId.split(":")[0]);
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
