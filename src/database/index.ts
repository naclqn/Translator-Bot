import { PrismaClient } from '@prisma/client';

// PrismaClientを遅延初期化（シングルトンパターン）
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

/**
 * チャンネル設定を取得
 */
export async function getChannelSetting(channelId: string): Promise<boolean> {
    const setting = await getPrismaClient().channelSetting.findUnique({
        where: { channelId }
    });
    
    // レコードが存在しない場合はデフォルトで無効（false）
    return setting ? setting.enabled : false;
}

/**
 * チャンネル設定を更新
 */
export async function setChannelSetting(channelId: string, enabled: boolean): Promise<void> {
    await getPrismaClient().channelSetting.upsert({
        where: { channelId },
        update: { enabled },
        create: {
            channelId,
            enabled
        }
    });
}

/**
 * すべてのチャンネル設定を取得
 */
export async function getAllChannelSettings(): Promise<Array<{ channelId: string; enabled: boolean }>> {
    const settings = await getPrismaClient().channelSetting.findMany();
    return settings.map((s: { channelId: string; enabled: boolean }) => ({
        channelId: s.channelId,
        enabled: s.enabled
    }));
}

/**
 * データベース接続を閉じる
 */
export async function closeDatabase(): Promise<void> {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
}

// プロセス終了時にデータベースを閉じる
process.on('exit', async () => {
    await closeDatabase();
});

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
});
