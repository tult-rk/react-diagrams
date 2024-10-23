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

		//also update the nodes co-ordinates (for make glorious speed)
		// _forEach(this.nodes, (node) => {
		// 	node.setPosition(node.getX() + this.position.x - old.x, node.getY() + this.position.y - old.y);
		// });
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
		this.nodes = {};
	}

	removeNodeFromGroup(nodeID: string): void {
		if (this.nodes[nodeID]) {
			this.nodes[nodeID].setParent(null); // remove parents of node
			delete this.nodes[nodeID]; // remove from nodes list
		}
	}

	group(selectedNodes: NodeModel[], engine: DiagramEngine): void {
		selectedNodes.forEach((node) => {
			// check if node is already selected
			if (!this.nodes[node.getID()]) {
				this.nodes[node.getID()] = node;
			}
		});
	}

	addNode(node: NodeModel) {
		node.setParent(this);
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
