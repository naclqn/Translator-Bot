// 環境変数を最初に読み込む（PrismaClient初期化前に必要）
import * as dotenv from 'dotenv';
dotenv.config();

// DATABASE_URLを確実に設定（Prisma 7.0用）
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:prisma/data/translator.db';
}

import { Client, GatewayIntentBits, Interaction, MessageReaction, User, PartialMessageReaction, PartialUser, Partials } from 'discord.js';
import { DISCORD_BOT_TOKEN, GEMINI_API_KEY, models, MODEL_STRATEGY } from './config';
import { Translator } from './services/translator';
import * as readyEvent from './events/ready';
import * as interactionCreateEvent from './events/interactionCreate';
import * as messageReactionAddEvent from './events/messageReactionAdd';

// Discordクライアントの初期化
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions, // リアクションイベント用
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
});

// 翻訳機の初期化
const translator = new Translator(GEMINI_API_KEY!, models, MODEL_STRATEGY);

// イベントハンドラーの登録
// Discord.js v14.25.0以降では 'clientReady' が推奨されています
client.once('clientReady', () => readyEvent.execute(client));
client.on('interactionCreate', (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        interactionCreateEvent.execute(interaction);
    }
});
// リアクション追加イベント（✅リアクションで翻訳）
client.on('messageReactionAdd', async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    await messageReactionAddEvent.execute(reaction, user, translator);
});

// エラーハンドリング
client.on('error', (error) => {
    console.error('Discordクライアントエラー:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('未処理のPromise拒否:', error);
});

// Botをログイン
client.login(DISCORD_BOT_TOKEN).catch((error) => {
    console.error('ログインエラー:', error);
    process.exit(1);
});
