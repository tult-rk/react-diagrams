import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _values from 'lodash/values';
import { DiagramModel } from '../../models/DiagramModel';
import { PortModel } from '../port/PortModel';
import { LinkModel } from '../link/LinkModel';
import { Point, Rectangle } from '@fjdr/geometry';
import {
	BaseEntityEvent,
	BaseModelListener,
	BasePositionModel,
	BasePositionModelGenerics,
	DeserializeEvent
} from '@fjdr/react-canvas-core';
import { DiagramEngine } from '../../DiagramEngine';
import { GroupModel } from '../group/GroupModel';

export interface NodeModelListener extends BaseModelListener {
	positionChanged?(event: BaseEntityEvent<NodeModel>): void;
}

export interface NodeModelGenerics extends BasePositionModelGenerics {
	LISTENER: NodeModelListener;
	PARENT: DiagramModel | GroupModel;
}

export class NodeModel<G extends NodeModelGenerics = NodeModelGenerics> extends BasePositionModel<G> {
	protected ports: { [s: string]: PortModel };

	// calculated post rendering so routing can be done correctly
	width: number;
	height: number;
	group: string | null;

	constructor(options: G['OPTIONS']) {
		super(options);
		this.ports = {};
		this.width = 0;
		this.height = 0;
		this.group = null;
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

		//also update the port co-ordinates (for make glorious speed)
		_forEach(this.ports, (port) => {
			port.setPosition(port.getX() + this.position.x - old.x, port.getY() + this.position.y - old.y);
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);

		// Restore ports
		_forEach(event.data.ports, (port: any) => {
			let portOb = (event.engine as DiagramEngine).getFactoryForPort(port.type).generateModel({});
			portOb.deserialize({
				...event,
				data: port
			});
			// the links need these
			event.registerModel(portOb);
			this.addPort(portOb);
		});

		// Restore group reference
		if (event.data.group) {
			this.group = event.data.group;
		}
	}

	serialize() {
		return {
			...super.serialize(),
			ports: _map(this.ports, (port) => {
				return port.serialize();
			}),
			group: this.group
		};
	}

	doClone(lookupTable = {}, clone) {
		// also clone the ports
		clone.ports = {};
		_forEach(this.ports, (port) => {
			clone.addPort(port.clone(lookupTable));
		});
	}

	remove() {
		super.remove();
		_forEach(this.ports, (port) => {
			_forEach(port.getLinks(), (link) => {
				link.remove();
			});
		});
	}

	getPortFromID(id): PortModel | null {
		for (var i in this.ports) {
			if (this.ports[i].getID() === id) {
				return this.ports[i];
			}
		}
		return null;
	}

	getLink(id: string): LinkModel {
		for (let portID in this.ports) {
			const links = this.ports[portID].getLinks();
			if (links[id]) {
				return links[id];
			}
		}
	}

	getPort(name: string): PortModel | null {
		return this.ports[name];
	}

	getPorts(): { [s: string]: PortModel } {
		return this.ports;
	}

	removePort(port: PortModel) {
		// clear the port from the links
		for (let link of _values(port.getLinks())) {
			link.clearPort(port);
		}
		//clear the parent node reference
		if (this.ports[port.getID()]) {
			this.ports[port.getID()].setParent(null);
			delete this.ports[port.getID()];
		}
	}

	addPort(port: PortModel): PortModel {
		port.setParent(this);
		this.ports[port.getID()] = port;
		return port;
	}

	updateDimensions({ width, height }: { width: number; height: number }) {
		this.width = width;
		this.height = height;
	}
}
