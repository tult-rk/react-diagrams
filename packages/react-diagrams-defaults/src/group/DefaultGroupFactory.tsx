import * as React from 'react';
import { DefaultGroupModel } from './DefaultGroupModel';
import { DefaultGroupWidget } from './DefaultGroupWidget';
import { AbstractReactFactory } from '@fjdr/react-canvas-core';
import { DiagramEngine } from '@fjdr/react-diagrams-core';

export class DefaultGroupFactory extends AbstractReactFactory<DefaultGroupModel, DiagramEngine> {
	constructor() {
		super('default');
	}

	generateReactWidget = (event): JSX.Element => {
		return <DefaultGroupWidget engine={event.engine} group={event.model} />;
	};

	generateModel = (event): DefaultGroupModel => {
		return new DefaultGroupModel({});
	};
}
