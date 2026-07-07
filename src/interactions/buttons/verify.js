import roles from "../../config/roles.js";

export default {

    customId: "verify",

    async execute(interaction) {

        const member = interaction.member;

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