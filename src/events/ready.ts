import { Client, REST, Routes } from 'discord.js';
import { DISCORD_BOT_TOKEN, DEFAULT_TARGET_LANGUAGE, models, MODEL_STRATEGY } from '../config';
import { getAllSlashCommands } from '../commands/slash';

export async function execute(client: Client): Promise<void> {
    if (client.user) {
        console.log(`✅ Botがログインしました: ${client.user.tag}`);
        console.log(`デフォルト翻訳先言語: ${DEFAULT_TARGET_LANGUAGE}`);
        
        // スラッシュコマンドを登録
        try {
            const rest = new REST().setToken(DISCORD_BOT_TOKEN!);
            const commands = getAllSlashCommands();
            
            console.log('📝 スラッシュコマンドを登録中...');
            
            // グローバルコマンドとして登録
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            
            console.log('✅ スラッシュコマンドの登録が完了しました');
        } catch (error) {
            console.error('❌ スラッシュコマンドの登録に失敗しました:', error);
        }
        
        // 起動時に設定を表示
        console.log('📋 翻訳Bot設定:');
        console.log(`   モデル: ${models.join(', ')}`);
        console.log(`   戦略: ${MODEL_STRATEGY === 'fallback' ? 'フォールバック' : 'ローテーション'}`);
    }
}

