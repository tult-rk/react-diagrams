import _map from 'lodash/map';
import { DiagramEngine, GroupModel, GroupModelGenerics } from '@fjdr/react-diagrams-core';
import { BasePositionModelOptions, DeserializeEvent } from '@fjdr/react-canvas-core';
import { DefaultNodeModel } from '../node/DefaultNodeModel';

export interface DefaultGroupModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
}

export interface DefaultGroupModelGenerics extends GroupModelGenerics {
	OPTIONS: DefaultGroupModelOptions;
}

export class DefaultGroupModel extends GroupModel<DefaultGroupModelGenerics> {
	protected nodesList: DefaultNodeModel[];

	constructor(name: string);
	constructor(options?: DefaultGroupModelOptions);
	constructor(options: any = {}) {
		if (typeof options === 'string') {
			options = {
				name: options
			};
		}
		super({
			type: 'default',
			name: 'Group',
			color: 'rgb(0,192,255)',
			...options
		});
		this.nodesList = [];
	}
	getName() {
		return this.options.name;
	}

	getNodesList(): DefaultNodeModel[] {
		return this.nodesList;
	}

	setName(name: string) {
		this.options.name = name;
	}

	setColor(color: string) {
		this.options.color = color;
		this.fireEvent({ color }, 'colorChanged');
	}

	getColor() {
		return this.options.color;
	}

	addNode(node: DefaultNodeModel) {
		const addedNode = super.addNode(node);
		this.adjustSize();
		return addedNode;
	}

	removeNode(node: DefaultNodeModel) {
		const nodes = this.getNodes();
		const nodeToRemove = Object.values(nodes).find((n) => n === node);
		if (nodeToRemove) {
			nodeToRemove.setParent(null);
			delete nodes[nodeToRemove.getID()];
			this.adjustSize();
		}
	}

	private adjustSize() {
		const nodes = this.getNodes();
		if (Object.keys(nodes).length === 0) {
			return;
		}

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		Object.values(nodes).forEach((node) => {
			const { x, y } = node.getPosition();
			const width = node.width || 0;
			const height = node.height || 0;
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + width);
			maxY = Math.max(maxY, y + height);
		});

		this.setPosition(minX - 20, minY - 40);
		this.setSize({ width: maxX - minX + 40, height: maxY - minY + 60 });
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.nodes = event.data.nodes;
	}

	serialize(): any {
		return {
			...super.serialize(),
			name: this.options.name,
			color: this.options.color,
			nodes: _map(this.nodes, (node) => {
				return node.serialize();
			})
		};
	}
}
