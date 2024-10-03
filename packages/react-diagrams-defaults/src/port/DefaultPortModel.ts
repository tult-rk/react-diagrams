import {
	LinkModel,
	PortModel,
	PortModelAlignment,
	PortModelGenerics,
	PortModelOptions
} from '@projectstorm/react-diagrams-core';
import { DefaultLinkModel } from '../link/DefaultLinkModel';
import { AbstractModelFactory, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { ReactNode } from 'react';

export interface DefaultPortModelOptions extends PortModelOptions {
	label?: string;
	icon?: ReactNode;
	in?: boolean;
	type?: string;
}

export interface DefaultPortModelGenerics extends PortModelGenerics {
	OPTIONS: DefaultPortModelOptions;
}

export class DefaultPortModel extends PortModel<DefaultPortModelGenerics> {
	constructor(isIn: boolean, name?: string, label?: string, icon?: ReactNode);
	constructor(options: DefaultPortModelOptions);
	constructor(options: DefaultPortModelOptions | boolean, name?: string, label?: string, icon?: ReactNode) {
		if (!!name) {
			options = {
				in: !!options,
				name: name,
				label: label,
				icon: icon
			};
		}
		options = options as DefaultPortModelOptions;
		super({
			label: options.label || options.name,
			alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			type: 'default',
			...options
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.in = event.data.in;
		this.options.label = event.data.label;
	}

	serialize() {
		return {
			...super.serialize(),
			in: this.options.in,
			label: this.options.label
		};
	}

	link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
		let link = this.createLinkModel(factory);
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link as T;
	}

	canLinkToPort(port: PortModel): boolean {
		const links = Object.values(port.getLinks());
		let canConnect = true;

		if (this.getID() !== port.getID()) {
			canConnect = true;
		}

		if (links.length === 0) {
			canConnect = true;
		} else {
			links.forEach((link) => {
				const targetPort = link.getTargetPort();
				const sourcePort = link.getSourcePort();
				if (
					(targetPort?.getID() === port?.getID() && sourcePort?.getID() === this?.getID()) ||
					(sourcePort?.getID() === port?.getID() && targetPort?.getID() === this?.getID())
				) {
					canConnect = false;
				}
				if (!targetPort) {
					canConnect = false;
				}
			});
		}
		return canConnect;
	}

	setLabel(value: string): void {
		this.options.label = value;
	}

	createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
		let link = super.createLinkModel();
		if (!link && factory) {
			return factory.generateModel({});
		}
		return link || new DefaultLinkModel();
	}
}
