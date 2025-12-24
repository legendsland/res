import 'reflect-metadata';
import { Container } from 'inversify';
import { cliModules } from './modules';

export interface MojoContainer {
    container: Container;
    unload: () => void;
}

export const prodContainer = () => {
    const c = new Container();
    const allModules = [cliModules];

    c.load(...allModules);
    return {
        container: c,
        unload: () => c.unload(...allModules),
    };
};
