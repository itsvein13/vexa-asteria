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
                content:
                    "⚠️ **Tunggu dulu!** Kamu belum bisa verify karena belum pilih **role game**.\n" +
                    "Buka panel **Choose Your Roles** (dropdown 🎮 di channel **#role-menu**), pilih minimal 1 game, lalu balik ke sini dan klik **Verify** lagi ya.\n\n" +
                    "— — —\n\n" +
                    "⚠️ **Hold on!** You can't verify yet because you haven't picked a **game role**.\n" +
                    "Open the **Choose Your Roles** panel (🎮 dropdown in **#role-menu**), pick at least 1 game, then come back and click **Verify** again.",
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