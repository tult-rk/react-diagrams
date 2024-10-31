import { LayerModel, LayerModelGenerics } from '@fjdr/react-canvas-core';

import { DiagramEngine } from '../../DiagramEngine';
import { DiagramModel } from '../../models/DiagramModel';
import { GroupModel } from '../group/GroupModel';

export interface GroupLayerModelGenerics extends LayerModelGenerics {
	CHILDREN: GroupModel;
	ENGINE: DiagramEngine;
}

export class GroupLayerModel<G extends GroupLayerModelGenerics = GroupLayerModelGenerics> extends LayerModel<G> {
	constructor() {
		super({
			type: 'diagram-groups',
			isSvg: true,
			transformed: true
		});
	}

	addModel(model: G['CHILDREN']): void {
		if (!(model instanceof GroupModel)) {
			throw new Error('Can only add nodes to this layer');
		}
		model.registerListener({
			entityRemoved: () => {
				(this.getParent() as DiagramModel).removeGroup(model);
			}
		});
		super.addModel(model);
	}

	getChildModelFactoryBank(engine: G['ENGINE']) {
		return engine.getGroupFactories();
	}

	getGroups() {
		return this.getModels();
	}
}
