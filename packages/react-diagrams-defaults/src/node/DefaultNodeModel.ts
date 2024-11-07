import _map from 'lodash/map';
import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@fjdr/react-diagrams-core';
import { DefaultPortModel } from '../port/DefaultPortModel';
import { BasePositionModelOptions, DeserializeEvent } from '@fjdr/react-canvas-core';
import { ReactNode } from 'react';

export interface DefaultNodeModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
	icon?: ReactNode;
	shape?: boolean;
	sub?: string;
}

export interface DefaultNodeModelGenerics extends NodeModelGenerics {
	OPTIONS: DefaultNodeModelOptions;
}

export class DefaultNodeModel extends NodeModel<DefaultNodeModelGenerics> {
	protected portsIn: DefaultPortModel[];
	protected portsOut: DefaultPortModel[];
	protected shape: boolean;
	protected sub?: string;
	groupId?: string;

	constructor(name: string, color: string);
	constructor(options?: DefaultNodeModelOptions);
	constructor(options: any = {}, color?: string) {
		if (typeof options === 'string') {
			options = {
				name: options,
				color: color
			};
		}
		super({
			type: 'default',
			name: 'Untitled',
			color: 'rgb(0,192,255)',
			sub: 'sub title',
			shape: false,
			...options
		});
		this.portsOut = [];
		this.portsIn = [];
		this.shape = typeof options !== 'string' && options.shape !== undefined ? Boolean(options.shape) : false;
		this.sub = this.options.sub;
	}

	doClone(lookupTable: {}, clone: any): void {
		clone.portsIn = [];
		clone.portsOut = [];
		super.doClone(lookupTable, clone);
	}

	removePort(port: DefaultPortModel): void {
		super.removePort(port);
		if (port.getOptions().in) {
			this.portsIn.splice(this.portsIn.indexOf(port), 1);
		} else {
			this.portsOut.splice(this.portsOut.indexOf(port), 1);
		}
	}

	addPort<T extends DefaultPortModel>(port: T): T {
		super.addPort(port);
		if (port.getOptions().in) {
			if (this.portsIn.indexOf(port) === -1) {
				this.portsIn.push(port);
			}
		} else {
			if (this.portsOut.indexOf(port) === -1) {
				this.portsOut.push(port);
			}
		}
		return port;
	}

	addInPort(label: string, after = true): DefaultPortModel {
		const p = new DefaultPortModel({
			in: true,
			name: label,
			label: label,
			alignment: PortModelAlignment.LEFT
		});
		if (!after) {
			this.portsIn.splice(0, 0, p);
		}
		return this.addPort(p);
	}

	addOutPort(label: string, after = true): DefaultPortModel {
		const p = new DefaultPortModel({
			in: false,
			name: label,
			label: label,
			alignment: PortModelAlignment.RIGHT
		});
		if (!after) {
			this.portsOut.splice(0, 0, p);
		}
		return this.addPort(p);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.options.sub = event.data.sub;
		this.shape = event.data.shape;
		this.portsIn = _map(event.data.portsInOrder, (id) => {
			return this.getPortFromID(id);
		}) as DefaultPortModel[];
		this.portsOut = _map(event.data.portsOutOrder, (id) => {
			return this.getPortFromID(id);
		}) as DefaultPortModel[];
		this.group = event.data.group;
	}

	serialize(): any {
		return {
			...super.serialize(),
			group: this.group,
			name: this.options.name,
			color: this.options.color,
			shape: this.shape,
			sub: this.options.sub,
			portsInOrder: _map(this.portsIn, (port) => {
				return port.getID();
			}),
			portsOutOrder: _map(this.portsOut, (port) => {
				return port.getID();
			})
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	changeShape(value: boolean) {
		this.shape = Boolean(value);
	}

	getShape(): boolean {
		return this.shape;
	}

	changeOptions(key, value) {
		this.options[key] = value;
	}

	setName(value: string) {
		this.options.name = value;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}

	getSize() {
		return {
			width: this.width,
			height: this.height
		};
	}

	setGroupId(groupId: string | null) {
		this.groupId = groupId;
	}

	getGroupId(): string | null | undefined {
		return this.groupId;
	}
}
