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

				// Cập nhật parent của node
				node.setParent(this);

				// Di chuyển các link liên quan vào group
				// this.moveLinksToGroup(node);

				// Điều chỉnh kích thước của group
				this.adjustSize();
			}

			// Thêm node vào group hiện tại
		}
		return node;
	}

	removeNode(node: DefaultNodeModel) {
		this.nodesList = this.nodesList.filter((n) => n !== node);
		node.setParent(null);
		this.adjustSize();
	}

	// private moveLinksToGroup(node: DefaultNodeModel) {
	// 	const diagram = node.getParentCanvasModel();
	// 	diagram.getLinks().forEach((link) => {
	// 		if (
	// 			(link.getSourcePort().getParent() === node &&
	// 				this.nodesList.includes(link.getTargetPort().getParent() as DefaultNodeModel)) ||
	// 			(link.getTargetPort().getParent() === node &&
	// 				this.nodesList.includes(link.getSourcePort().getParent() as DefaultNodeModel))
	// 		) {
	// 			this.addLink(link);
	// 			diagram?.removeLink(link);
	// 		}
	// 	});
	// }

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

	adjustSize() {
		const nodes = this.getNodesList();
		if (nodes.length === 0) {
			return;
		}

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		nodes.forEach((node) => {
			const { x, y } = node.getPosition();
			const size = node.getSize();
			const width = size ? size.width : 0;
			const height = size ? size.height : 0;
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + width);
			maxY = Math.max(maxY, y + height);
		});
		console.log(minX, minY, maxX, maxY);

		const padding = 20;
		const newWidth = Math.max((maxX + minX) / 2 + padding, 100);
		const newHeight = Math.max((maxY + minY) / 2 + padding, 100);

		this.setPosition((minX + maxX) / 2, (minY + maxY) / 2);
		this.setSize({ width: newWidth, height: newHeight });
		this.fireEvent({ width: newWidth, height: newHeight }, 'sizeChanged');
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.nodesList = Object.values(event.data.nodes) as DefaultNodeModel[];
		this.width = event.data.width;
		this.height = event.data.height;
		this.adjustSize();
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
