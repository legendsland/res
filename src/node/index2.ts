import { prodContainer } from './container';
import { CommandExecutor } from './core/executor';

async function start() {
    const { container } = prodContainer();

    const executor = container.get(CommandExecutor);

    await executor.run();
}

(async () => {
    await start();
})();
