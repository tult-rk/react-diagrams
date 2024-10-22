import {
	LinkModel,
	PortModel,
	PortModelAlignment,
	PortModelGenerics,
	PortModelOptions
} from '@fjdr/react-diagrams-core';
import { DefaultLinkModel } from '../link/DefaultLinkModel';
import { AbstractModelFactory, DeserializeEvent } from '@fjdr/react-canvas-core';

export interface DefaultPortModelOptions extends PortModelOptions {
	label?: string;
	icon?: string;
	in?: boolean;
	type?: string;
	icon_color?: string;
}

export interface DefaultPortModelGenerics extends PortModelGenerics {
	OPTIONS: DefaultPortModelOptions;
}

export class DefaultPortModel extends PortModel<DefaultPortModelGenerics> {
	constructor(isIn: boolean, name?: string, label?: string, icon?: string, icon_color?: string);
	constructor(options: DefaultPortModelOptions);
	constructor(
		options: DefaultPortModelOptions | boolean,
		name?: string,
		label?: string,
		icon?: string,
		icon_color?: string
	) {
		if (typeof options === 'boolean') {
			options = {
				in: options,
				name: name,
				label: label,
				icon: icon || 'round',
				icon_color: icon_color || '#000000'
			};
		}
		options = options as DefaultPortModelOptions;
		super({
			label: options.label || options.name,
			alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			type: 'default',
			icon: options.icon || 'round',
			icon_color: options.icon_color || '#000000',
			...options
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.in = event.data.in;
		this.options.label = event.data.label;
		this.options.icon = event.data.icon;
		this.options.icon_color = event.data.icon_color;
	}

	serialize() {
		return {
			...super.serialize(),
			in: this.options.in,
			label: this.options.label,
			icon: this.options.icon || 'round',
			icon_color: this.options.icon_color || '#000000'
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

		let canConnect = this.getID() !== port.getID() && this.getParent().getID() !== port.getParent().getID();

		if (canConnect) {
			if (links.length === 0) {
				canConnect = true;
			} else {
				links.forEach((link) => {
					const targetPort = link.getTargetPort();
					const sourcePort = link.getSourcePort();
					// check if the port is already linked to the target port
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
		}

		// if (canConnect) {
		// 	canConnect =
		// 		this.getOptions().icon === port.getOptions().icon &&
		// 		this.getOptions().icon_color === port.getOptions().icon_color;
		// }

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
