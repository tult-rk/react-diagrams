import { DiamondNodeWidget } from './DiamondNodeWidget';
import { DiamondNodeModel } from './DiamondNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@fjdr/react-canvas-core';
import { DiagramEngine } from '@fjdr/react-diagrams-core';

export class DiamondNodeFactory extends AbstractReactFactory<DiamondNodeModel, DiagramEngine> {
	private nodeType: string;

	constructor(type: string) {
		super(type);
		this.nodeType = type;
	}

	generateReactWidget(event): JSX.Element {
		if (this.nodeType === 'ellipse' || this.nodeType === 'rectangle') {
			return <DiamondNodeWidget engine={this.engine} width={200} height={100} node={event.model} />;
		} else {
			return <DiamondNodeWidget engine={this.engine} node={event.model} size={150} />;
		}
	}

	generateModel(event) {
		return new DiamondNodeModel(this.nodeType);
	}
}
