import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import {
	BaseEntityEvent,
	BaseModelListener,
	BasePositionModel,
	BasePositionModelGenerics,
	DeserializeEvent
} from '@fjdr/react-canvas-core';
import { DiagramModel } from '../../models/DiagramModel';
import { NodeModel } from '../node/NodeModel';
import { boundingBoxFromPolygons, Point, Rectangle } from '@fjdr/geometry';
import { DiagramEngine } from '../../DiagramEngine';

export interface GroupModelListener extends BaseModelListener {
	positionChanged?(event: BaseEntityEvent<GroupModel>): void;
}

export interface GroupModelGenerics extends BasePositionModelGenerics {
	LISTENER: GroupModelListener;
	PARENT: DiagramModel;
}

export class GroupModel<G extends GroupModelGenerics = GroupModelGenerics> extends BasePositionModel<G> {
	protected nodes: { [s: string]: NodeModel };

	width: number;
	height: number;

	constructor(options: G['OPTIONS']) {
		super(options);
		this.nodes = {};
		this.width = 0;
		this.height = 0;
	}

	calculateBoundingBox = (rectangles) => {
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

	adjustSize = () => {
		const nodes = this.getNodes();
		if (Object.keys(nodes).length === 0) {
			return;
		}

		const rectangles = _map(nodes, (node) => node.getBoundingBox().getPoints());
		const boundingBox = this.calculateBoundingBox(rectangles);

		const padding = 50;
		const currentPosition = this.getPosition();
		const currentSize = this.getSize();

		// Tính toán kích thước và vị trí mới
		const newLeft = Math.min(currentPosition.x - currentSize.width / 2, boundingBox.minX - padding);
		const newRight = Math.max(
			currentPosition.x + currentSize.width / 2,
			boundingBox.minX + boundingBox.width + padding
		);
		const newTop = Math.min(currentPosition.y - currentSize.height / 2, boundingBox.minY - padding);
		const newBottom = Math.max(
			currentPosition.y + currentSize.height / 2,
			boundingBox.minY + boundingBox.height + padding
		);

		const newWidth = newRight - newLeft;
		const newHeight = newBottom - newTop;
		const newCenterX = (newLeft + newRight) / 2;
		const newCenterY = (newTop + newBottom) / 2;

		// Cập nhật vị trí và kích thước
		this.setPosition(newCenterX, newCenterY);
		this.setSize({ width: newWidth, height: newHeight });
		this.fireEvent({ width: newWidth, height: newHeight }, 'sizeChanged');
	};

	isPointInside = (point: Point): boolean => {
		const boundingBox = this.getBoundingBox();
		return boundingBox.containsPoint(point);
	};

	getBoundingBox(): Rectangle {
		return Rectangle.fromPointAndSize(this.getPosition(), this.width, this.height);
	}

	setPosition(point: Point): void;
	setPosition(x: number, y: number): void;
	setPosition(x: number | Point, y?: number, isUpdateNodePosition?: boolean): void {
		const old = this.position;

		if (x instanceof Point) {
			super.setPosition(x);
		} else {
			super.setPosition(x, y);
		}

		if (!(old.x === 0 && old.y === 0)) {
			_forEach(this.nodes, (node) => {
				node.setPosition(node.getX() + this.position.x - old.x, node.getY() + this.position.y - old.y);
			});
		}
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);

		//deserialize nodes
		_forEach(event.data.nodes, (node: any) => {
			let nodeOb = (event.engine as DiagramEngine).getFactoryForNode(node.type).generateModel({});
			nodeOb.deserialize({
				...event,
				data: node
			});
			// the links need these
			event.registerModel(nodeOb);
			this.addNode(nodeOb);
		});
	}

	serialize() {
		return {
			...super.serialize(),
			nodes: _map(this.nodes, (node) => {
				return node.serialize();
			})
		};
	}

	remove() {
		super.remove();
		_forEach(this.nodes, (node) => {
			node.remove();
		});
	}

	getBoundingNodesRect() {
		return boundingBoxFromPolygons(Object.values(this.getNodes()).map((node) => node.getBoundingBox()));
	}

	getNode(id: string): NodeModel | null {
		// change with id
		return this.nodes[id];
	}

	getNodes(): { [s: string]: NodeModel } {
		return this.nodes;
	}

	unGroup() {
		// Remove parent references and group association from nodes
		_forEach(this.nodes, (node) => {
			node.setParent(null);
			node.group = null;
		});

		// Clear the nodes list
		this.nodes = {};
		this.remove();
	}

	doClone(lookupTable = {}, clone) {
		// also clone the nodes
		clone.nodes = {};
		_forEach(this.nodes, (node) => {
			clone.addNode(node.clone(lookupTable));
		});
	}

	removeNodeFromGroup(nodeID: string): void {
		if (this.nodes[nodeID]) {
			this.nodes[nodeID].setParent(null); // remove parents of node
			delete this.nodes[nodeID]; // remove from nodes list
		}
		this.nodes[nodeID].group = null;
	}

	addNode(node: NodeModel) {
		node.setParent(this);
		node.group = this.getID();
		this.nodes[node.getID()] = node;
		return node;
	}

	getSize() {
		return { width: this.width, height: this.height };
	}

	setSize({ width, height }: { width: number; height: number }) {
		this.width = width;
		this.height = height;
	}
}
