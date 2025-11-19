import * as translateEnable from './translateEnable';
import * as translateDisable from './translateDisable';
import * as translateStatus from './translateStatus';

export const commands = [
    translateEnable,
    translateDisable,
    translateStatus
];

export function getAllSlashCommands() {
    return commands.map(cmd => cmd.data.toJSON());
}

