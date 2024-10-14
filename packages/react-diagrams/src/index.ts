import {
	DefaultDiagramState,
	DiagramEngine,
	GroupLayerFactory,
	LinkLayerFactory,
	NodeLayerFactory
} from '@fjdr/react-diagrams-core';
import {
	DefaultLabelFactory,
	DefaultLinkFactory,
	DefaultNodeFactory,
	DefaultPortFactory,
	DefaultGroupFactory
} from '@fjdr/react-diagrams-defaults';
import { PathFindingLinkFactory } from '@fjdr/react-diagrams-routing';
import { SelectionBoxLayerFactory, CanvasEngineOptions } from '@fjdr/react-canvas-core';

export * from '@fjdr/react-canvas-core';
export * from '@fjdr/react-diagrams-core';
export * from '@fjdr/react-diagrams-defaults';
export * from '@fjdr/react-diagrams-routing';

/**
 * Construct an engine with the defaults installed
 */
export default (options: CanvasEngineOptions = {}): DiagramEngine => {
	const engine = new DiagramEngine(options);

	// register model factories
	engine.getLayerFactories().registerFactory(new NodeLayerFactory());
	engine.getLayerFactories().registerFactory(new LinkLayerFactory());
	engine.getLayerFactories().registerFactory(new GroupLayerFactory());
	engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());

	engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
	engine.getNodeFactories().registerFactory(new DefaultNodeFactory()); // i cant figure out why
	engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
	engine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
	engine.getPortFactories().registerFactory(new DefaultPortFactory());
	engine.getGroupFactories().registerFactory(new DefaultGroupFactory());

	// register the default interaction behaviours
	engine.getStateMachine().pushState(new DefaultDiagramState());
	return engine;
};
