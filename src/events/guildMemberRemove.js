import { recordLeave } from "../database/inviteTracking.js";

export default {

    name: "guildMemberRemove",

    async execute(member) {

        if (member.user.bot) return;

        recordLeave(member.guild.id, member.id);

    }

};
