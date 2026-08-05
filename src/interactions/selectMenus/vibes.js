import roles from "../../config/roles.js";

const VIBE_ROLES = {
    chill: roles.CHILL,
    yapper: roles.YAPPER,
    competitive: roles.COMPETITIVE,
    nocturnal: roles.NOCTURNAL,
    music: roles.MUSIC_LOVER,
    movie: roles.MOVIE_ENJOYER,
    tech: roles.TECH_ENTHUSIAST
};

export default {

    customId: "vibes-role-menu",

    async execute(interaction) {

        const member = interaction.member;

        // Hapus semua role vibe dulu
        await member.roles.remove(Object.values(VIBE_ROLES));

        // Tambahkan yang dipilih (maksimal 2, diatur oleh setMaxValues di roles-setup.js)
        const toAdd = interaction.values
            .map(value => VIBE_ROLES[value])
            .filter(Boolean);

        if (toAdd.length) {
            await member.roles.add(toAdd);
        }

        await interaction.reply({
            content: "✨ Your vibe has been updated!",
            ephemeral: true
        });

    }

}
