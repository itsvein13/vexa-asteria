import { SlashCommandBuilder } from "discord.js";
import { generateProfile, generateAnimatedProfile } from "../../utils/profile/card.js";

export default {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your Synd1cate profile.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("View another member.")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("static")
                .setDescription("Send a fast static image instead of the animated version.")
                .setRequired(false)
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const member =
            interaction.options.getMember("member") ??
            interaction.member;

        const wantsStatic = interaction.options.getBoolean("static") ?? false;

        let image;

        try {

            image = wantsStatic
                ? await generateProfile(member)
                : await generateAnimatedProfile(member);

        } catch (err) {

            // Kalau GIF gagal dibuat (encoder error, dsb), tetap kasih hasil
            // statis daripada bikin command ini gagal total.
            console.error("Animated profile failed, falling back to static:", err);
            image = await generateProfile(member);

        }

        await interaction.editReply({
            files: [image]
        });

    }

};