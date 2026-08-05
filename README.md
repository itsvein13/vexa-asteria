# Vexa Asteria

Discord bot for SYND1CATE — part gaming community, part freelance studio (design, web/app development, FiveM & NFS cinematic work). Vexa runs the community side of things (leveling, economy, role menus) and the business side (tickets, order tracking, pricing, client testimonials) from one bot.

Built with discord.js v14, backed by a single SQLite file through better-sqlite3 — no external database to manage.

## Features

**Progression & economy**
Animated profile cards rendered with `canvas`, chat-based leveling with a podium-style leaderboard, a daily claim with streaks, and a Shards-based shop with unlockable card themes. Level-based role rewards sync automatically as members level up.

**Onboarding**
Button-based verification, a role menu for games/vibes/creator status, and FAQ and rules panels — all posted in Indonesian and English side by side.

**Services & tickets**
The part that makes this more than a gaming bot. Tickets are split into categories (Design & Video, Web/App Dev, FiveM/NFS Cinematic, Complaints, General), each trackable through an order status (In Progress, Awaiting Payment, Completed). Clients can check their own order history with `/my-orders`, browse service pricing with `/services` (prices are spoiler-tagged until clicked), and finished service tickets automatically ask the client for a star rating that gets posted to a testimonial channel.

**Moderation**
Warn/mute/kick/ban with case numbers logged to a mod channel, automatic cross-post spam detection, and an anti-raid system that watches join rates and auto-kicks new accounts if a raid is detected.

**Community**
A suggestion box with a staff approve/reject/implement flow, invite tracking with a leaderboard, and referral rewards that pay out Shards automatically once someone's invites cross a milestone.

**Admin tools**
`/setup-status` checks every `-setup` command in the bot and shows what's configured and what isn't. `/stats` pulls activity, economy, and ticket analytics into one embed.

## Stack

- discord.js v14
- better-sqlite3 (WAL mode)
- canvas + gifenc for profile/leaderboard card rendering
- Node.js, ESM

## Setup

```bash
git clone https://github.com/itsvein13/vexa-asteria.git
cd vexa-asteria
npm install
```

Create a `.env` file in the project root:

```
TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-server-id
```

Register the slash commands and start the bot:

```bash
node src/deploy.js
npm start
```

`npm run dev` runs it with nodemon instead, if you're actively changing command files.

## Project structure

```
src/
  commands/       slash commands — admin, community, utility
  interactions/   buttons, select menus, modals
  events/         Discord gateway event handlers
  database/       SQLite schema plus one query module per feature
  utils/          shared helpers — mod log, invite cache, card rendering
  config/         static config — colors, ticket categories, constants
```

Every feature that needs its own settings (tickets, suggestions, testimonials, referral rewards, and so on) gets its own table and its own module under `src/database/`, so one feature's schema changes don't touch another's.

## License

MIT

---

Maintained by [Rizki Dwi Setyanto](https://github.com/itsvein13).
