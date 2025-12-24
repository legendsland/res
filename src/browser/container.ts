import 'reflect-metadata';
import { Container } from 'inversify';
import { kgModules } from './res/modules';

export interface MojoContainer {
    container: Container;
    unload: () => void;
}

export const prodContainer = () => {
    const c = new Container();
    const allModules = [kgModules];

    c.load(...allModules);
    return {
        container: c,
        unload: () => c.unload(...allModules),
    };
};
