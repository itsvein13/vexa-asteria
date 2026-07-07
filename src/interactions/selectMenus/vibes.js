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

        // Hapus semua role vibe
        await member.roles.remove(Object.values(VIBE_ROLES));

        // Tambahkan role yang dipilih
        const selected = interaction.values[0];

        if (VIBE_ROLES[selected]) {
            await member.roles.add(VIBE_ROLES[selected]);
        }

        await interaction.reply({
            content: "✨ Your vibe has been updated!",
            ephemeral: true
        });

    }

}