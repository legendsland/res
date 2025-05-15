import { ContainerModule } from 'inversify';
import { KnowledgeGraphViewContainer } from './graph';

const kgModules = new ContainerModule(({ bind }) => {
    bind(KnowledgeGraphViewContainer).toSelf().inSingletonScope();
});

export {
    kgModules,
};
