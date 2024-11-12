import _map from 'lodash/map';
import { DiagramEngine, DiagramModel, GroupModel, GroupModelGenerics, LinkModel } from '@fjdr/react-diagrams-core';
import { BasePositionModelOptions, DeserializeEvent } from '@fjdr/react-canvas-core';
import { DefaultNodeModel } from '../node/DefaultNodeModel';
import { DefaultLinkModel } from '../link/DefaultLinkModel';

export interface DefaultGroupModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
	fontSize?: string;
	fontFamily?: string;
	fontWeight?: string;
}

export interface DefaultGroupModelGenerics extends GroupModelGenerics {
	OPTIONS: DefaultGroupModelOptions;
}

export class DefaultGroupModel extends GroupModel<DefaultGroupModelGenerics> {
	protected nodesList: DefaultNodeModel[];
	protected links: DefaultLinkModel[];
	protected fontSize: string;
	protected fontFamily: string;
	protected fontWeight: string;

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
		this.fontSize = options.fontSize || '14px';
		this.fontFamily = options.fontFamily || 'Noto Sans, sans-serif';
		this.fontWeight = options.fontWeight || 'normal';
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
			if (oldParent instanceof GroupModel) {
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
		if (nodes.some((node) => node.group)) {
			throw new Error('Had node already has a group');
		}
		nodes.forEach((node) => {
			this.addNode(node);
		});
		this.adjustSize();
	}

	removeNode(node: DefaultNodeModel) {
		this.nodesList = this.nodesList.filter((n) => n !== node);

		// Kiểm tra nếu không còn node nào thì xóa group
		if (this.nodesList.length === 0) {
			this.remove();
		} else {
			this.adjustSize();
		}
	}

	unGroup() {
		this.nodesList.forEach((node) => {
			node.group = null;
		});
		this.nodesList = [];
		super.unGroup();
	}

	addLink<T extends DefaultLinkModel>(link: T): T {
		if (!this.links.includes(link)) {
			this.links.push(link);
		}
		return link;
	}

	removeLink(link: DefaultLinkModel) {
		this.links = this.links.filter((l) => l !== link);
	}

	getLinks(): DefaultLinkModel[] {
		return this.links;
	}
	// TODO: remove node

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.width = event.data.width;
		this.height = event.data.height;
		this.nodesList = Object.values(this.nodes) as DefaultNodeModel[];
		this.fontSize = event.data.fontSize || '14px';
		this.fontFamily = event.data.fontFamily || 'Noto Sans, sans-serif';
		this.fontWeight = event.data.fontWeight || 'normal';
	}

	serialize(): any {
		return {
			...super.serialize(),
			name: this.options.name,
			color: this.options.color,
			width: this.width,
			height: this.height,
			nodeIds: this.nodesList.map((node) => node.getID()),
			fontSize: this.fontSize,
			fontFamily: this.fontFamily,
			fontWeight: this.fontWeight
		};
	}

	removeNodeFromGroup(nodeID: string): void {
		super.removeNodeFromGroup(nodeID);

		// Cập nhật nodesList ở class con
		this.nodesList = this.nodesList.filter((n) => n.getID() !== nodeID);
	}

	getFontSize(): string {
		return this.fontSize;
	}

	setFontSize(size: string) {
		this.fontSize = size;
		this.fireEvent({}, 'propertyChanged');
	}

	getFontFamily(): string {
		return this.fontFamily;
	}

	setFontFamily(family: string) {
		this.fontFamily = family;
		this.fireEvent({}, 'propertyChanged');
	}

	getFontWeight(): string {
		return this.fontWeight;
	}

	setFontWeight(weight: string) {
		this.fontWeight = weight;
		this.fireEvent({}, 'propertyChanged');
	}
}
