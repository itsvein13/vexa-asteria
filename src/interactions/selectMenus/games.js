import roles from "../../config/roles.js";

const GAME_ROLES = {
    nfs: roles.NFS,
    delta: roles.DELTA,
    valorant: roles.VALORANT,
    gta: roles.GTA,
    pubg: roles.PUBG,
    ml: roles.ML,
    roblox: roles.ROBLOX,
    cs2: roles.CS2,
    minecraft: roles.MINECRAFT
};

export default {

    customId: "games-role-menu",

    async execute(interaction) {

        const member = interaction.member;

        // Hapus semua role game dulu
        await member.roles.remove(Object.values(GAME_ROLES));

        // Tambahkan role yang dipilih
        for (const value of interaction.values) {

            const roleId = GAME_ROLES[value];

            if (roleId) {
                await member.roles.add(roleId);
            }

        }

        await interaction.reply({
            content: "✅ Your game roles have been updated!",
            ephemeral: true
        });

    }

}