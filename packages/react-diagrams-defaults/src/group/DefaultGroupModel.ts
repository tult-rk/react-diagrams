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
				// node.setParent(this);

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

	adjustSize = () => {
		const nodes = this.getNodesList();
		if (nodes.length === 0) {
			return;
		}

		const rectangles = nodes.map((node) => node.getBoundingBox().getPoints());

		const calculateBoundingBox = (rectangles) => {
			let minX = Infinity;
			let minY = Infinity;
			let maxX = -Infinity;
			let maxY = -Infinity;

			rectangles.forEach((points) => {
				minX = Math.min(minX, points[0].x, points[2].x);
				minY = Math.min(minY, points[0].y, points[2].y);
				maxX = Math.max(maxX, points[0].x, points[2].x);
				maxY = Math.max(maxY, points[0].y, points[2].y);
			});

			const width = maxX - minX;
			const height = maxY - minY;

			return {
				minX,
				minY,
				width,
				height
			};
		};

		const boundingBox = calculateBoundingBox(rectangles);

		const padding = 50;
		const newWidth = boundingBox.width + 2 * padding;
		const newHeight = boundingBox.height + 2 * padding;

		const centerX = boundingBox.minX + boundingBox.width / 2;
		const centerY = boundingBox.minY + boundingBox.height / 2;

		this.setPosition(centerX, centerY);
		this.setSize({ width: newWidth, height: newHeight });
		this.fireEvent({ width: newWidth, height: newHeight }, 'sizeChanged');
	};

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
