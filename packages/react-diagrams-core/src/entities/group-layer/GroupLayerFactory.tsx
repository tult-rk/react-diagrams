import * as React from 'react';
import { AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent } from '@fjdr/react-canvas-core';
import { DiagramEngine } from '../../DiagramEngine';
import { GroupLayerModel } from './GroupLayerModel';
import { GroupLayerWidget } from './GroupLayerWidget';

export class GroupLayerFactory extends AbstractReactFactory<GroupLayerModel, DiagramEngine> {
	constructor() {
		super('diagram-groups');
	}

	generateModel(event: GenerateModelEvent): GroupLayerModel {
		return new GroupLayerModel();
	}

	generateReactWidget(event: GenerateWidgetEvent<GroupLayerModel>): JSX.Element {
		return <GroupLayerWidget layer={event.model} engine={this.engine} />;
	}
}
