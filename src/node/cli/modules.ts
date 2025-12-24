import 'reflect-metadata';
import { ContainerModule, Factory } from 'inversify';
import { Epub } from './epub';

const cliModules = new ContainerModule(({ bind }) => {
    bind<Factory<Epub, [string, string]>>('EpubFactory').toFactory(() => {
        return (input: string, output: string) => {
            return new Epub(input, output);
        };
    });
});

export { cliModules };
