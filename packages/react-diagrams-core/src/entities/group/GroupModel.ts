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
	setPosition(x: number | Point, y?: number): void {
		const old = this.position;

		if (x instanceof Point) {
			super.setPosition(x);
		} else {
			super.setPosition(x, y);
		}

		// Tính offset di chuyển chính xác
		const offsetX = this.position.x - old.x;
		const offsetY = this.position.y - old.y;

		// Giữ điều kiện kiểm tra vị trí cũ
		if (!(old.x === 0 && old.y === 0) && (offsetX !== 0 || offsetY !== 0)) {
			_forEach(this.nodes, (node) => {
				// Di chuyển node theo offset
				node.setPosition(node.getX() + offsetX, node.getY() + offsetY);

				// Lấy tất cả ports của node
				const ports = Object.values(node.getPorts());

				// Lấy tất cả links từ các ports
				const links = ports.reduce((acc, port) => {
					return [...acc, ...Object.values(port.getLinks())];
				}, []);

				// Cập nhật vị trí các points của mỗi link
				links.forEach((link) => {
					const points = link.getPoints();

					// Chỉ di chuyển các point ở giữa theo đúng offset
					for (let i = 1; i < points.length - 1; i++) {
						const point = points[i];
						point.setPosition(point.getX() + offsetX / 2, point.getY() + offsetY / 2);
					}
				});
			});
		}
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);

		// Restore position
		if (event.data.position) {
			this.setPosition(event.data.position.x, event.data.position.y);
		}

		// Restore size
		if (event.data.size) {
			this.setSize(event.data.size);
		}

		// Deserialize nodes
		_forEach(event.data.nodes, (node: any) => {
			let nodeOb = (event.engine as DiagramEngine).getFactoryForNode(node.type).generateModel({});
			nodeOb.deserialize({
				...event,
				data: node
			});
			event.registerModel(nodeOb);
			this.addNode(nodeOb);
		});
	}

	serialize() {
		return {
			...super.serialize(),
			position: this.position,
			size: {
				width: this.width,
				height: this.height
			},
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
			delete this.nodes[nodeID]; // remove from nodes list
		}
		this.nodes[nodeID].group = null;
		// const node = this.nodes[nodeID];
		// if (node) {
		// 	// Xóa reference từ node đến group
		// 	node.setParent(null);
		// 	node.group = null;

		// 	// Xóa node khỏi danh sách nodes của group
		// 	delete this.nodes[nodeID];

		// 	// Kiểm tra và xóa group nếu rỗng
		// 	if (Object.keys(this.nodes).length === 0) {
		// 		this.remove();
		// 	} else {
		// 		this.adjustSize();
		// 	}
		// }
	}

	addNode(node: NodeModel) {
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
