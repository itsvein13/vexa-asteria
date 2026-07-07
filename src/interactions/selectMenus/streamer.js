import roles from "../../config/roles.js";

export default {

    customId: "streamer-role-menu",

    async execute(interaction) {

        const member = interaction.member;

        // Hapus dua role dulu
        await member.roles.remove([
            roles.STREAMER,
            roles.HUMAN_BEING
        ]);

        const selected = interaction.values[0];

        if (selected === "streamer") {
            await member.roles.add(roles.STREAMER);
        }

        if (selected === "human") {
            await member.roles.add(roles.HUMAN_BEING);
        }

        await interaction.reply({
            content: "🎥 Your streamer status has been updated!",
            ephemeral: true
        });

    }

}