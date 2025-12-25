import 'reflect-metadata';
import { Container } from 'inversify';
import { commandsModule } from './modules/commands.module';

export interface MojoContainer {
    container: Container;
    unload: () => void;
}

export const prodContainer = () => {
    const c = new Container();
    const allModules = [commandsModule];

    c.load(...allModules);
    return {
        container: c,
        unload: () => c.unload(...allModules),
    };
};
