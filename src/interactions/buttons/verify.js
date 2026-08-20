import roles from "../../config/roles.js";

export default {

    customId: "verify",

    async execute(interaction) {

        const member = interaction.member;

        // Wajib klaim minimal 1 game role dulu sebelum verify.
        const GAME_ROLE_IDS = [
            roles.NFS, roles.DELTA, roles.VALORANT, roles.GTA, roles.PUBG,
            roles.ML, roles.ROBLOX, roles.CS2, roles.MINECRAFT, roles.RACING_MASTER
        ];
        const hasGameRole = GAME_ROLE_IDS.some(id => member.roles.cache.has(id));
        if (!hasGameRole) {
            return interaction.reply({
                content: "⚠️ Klaim role game kamu dulu di panel **Choose Your Roles** (pilih minimal 1 game) sebelum verify. Kalau sudah, klik Verify lagi.",
                ephemeral: true
            });
        }

        // Sudah verify?
        if (member.roles.cache.has(roles.WANDERER)) {

            return interaction.reply({
                content: "⚠️ You're already verified!",
                ephemeral: true
            });

        }

        await member.roles.remove(roles.INITIATE);
        await member.roles.add(roles.WANDERER);

        await interaction.reply({
            content: "✅ You have successfully verified! Welcome to Synd1cate ❤️",
            ephemeral: true
        });

    }

}