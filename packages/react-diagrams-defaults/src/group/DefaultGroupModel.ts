import _map from 'lodash/map';
import { DiagramEngine, DiagramModel, GroupModel, GroupModelGenerics, LinkModel } from '@fjdr/react-diagrams-core';
import { BasePositionModelOptions, DeserializeEvent } from '@fjdr/react-canvas-core';
import { DefaultNodeModel } from '../node/DefaultNodeModel';
import { DefaultLinkModel } from '../link/DefaultLinkModel';

export interface DefaultGroupModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
}

export interface DefaultGroupModelGenerics extends GroupModelGenerics {
	OPTIONS: DefaultGroupModelOptions;
}

export class DefaultGroupModel extends GroupModel<DefaultGroupModelGenerics> {
	protected nodesList: DefaultNodeModel[];
	protected links: DefaultLinkModel[];

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

	// TODO: remove node
	addNode<T extends DefaultNodeModel>(node: T): T {
		if (node.getParent() !== this) {
			// Nếu node đã thuộc về một group khác hoặc diagram, hãy xóa nó khỏi parent cũ
			const oldParent = node.getParent();
			if (oldParent instanceof DefaultGroupModel) {
				throw new Error('Can only add nodes to this layer');
			} else {
				super.addNode(node);
				this.nodesList.push(node);
			}

			// Thêm node vào group hiện tại
		}
		return node;
	}

	addNodes(nodes: DefaultNodeModel[]) {
		nodes.forEach((node) => {
			this.addNode(node);
		});
		this.adjustSize();
	}

	removeNode(node: DefaultNodeModel) {
		this.nodesList = this.nodesList.filter((n) => n !== node);
		node.setParent(null);
		this.adjustSize();
	}

	unGroup() {
		this.nodesList.forEach((node) => {
			node.setParent(null);
			node.group = null;
		});
		this.nodesList = [];
		super.unGroup();
	}

	addLink<T extends DefaultLinkModel>(link: T): T {
		if (!this.links.includes(link)) {
			this.links.push(link);
			link.setParent(this);
		}
		return link;
	}

	removeLink(link: DefaultLinkModel) {
		this.links = this.links.filter((l) => l !== link);
		link.setParent(null);
	}

	getLinks(): DefaultLinkModel[] {
		return this.links;
	}
	// TODO: remove node

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.nodesList = Object.values(event.data.nodes) as DefaultNodeModel[];
		this.width = event.data.width;
		this.height = event.data.height;
	}

	serialize(): any {
		return {
			...super.serialize(),
			name: this.options.name,
			color: this.options.color,
			width: this.width,
			height: this.height,
			nodes: _map(this.nodesList, (node) => {
				return node.serialize();
			})
		};
	}
}
