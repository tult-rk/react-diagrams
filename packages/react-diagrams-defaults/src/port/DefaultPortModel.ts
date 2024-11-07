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
	note?: string;
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
				icon_color: icon_color || '#000000',
				note: ''
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
		this.options.note = event.data.note;
	}

	serialize() {
		return {
			...super.serialize(),
			in: this.options.in,
			label: this.options.label,
			icon: this.options.icon || 'round',
			icon_color: this.options.icon_color || '#000000',
			note: this.options.note || ''
		};
	}

	link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
		let link = this.createLinkModel(factory);
		link.setSourcePort(this);
		link.setTargetPort(port);
		return link as T;
	}

	canLinkToPort(port: PortModel): boolean {
		// Không thể link với chính nó
		if (port === this) {
			return false;
		}

		// Không thể link với port cùng node
		if (this.getNode() === port.getNode()) {
			return false;
		}

		// Kiểm tra xem đã có link giữa 2 port này chưa
		const existingLinks = Object.values(this.getLinks());
		const hasExistingLink = existingLinks.some((link) => {
			const sourcePort = link.getSourcePort();
			const targetPort = link.getTargetPort();
			return (sourcePort === this && targetPort === port) || (sourcePort === port && targetPort === this);
		});

		if (hasExistingLink) {
			return false;
		}

		return true;
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

	changeOption(key: keyof DefaultPortModelOptions, value: any): void {
		// Xử lý các trường hợp đặc biệt
		if (key === 'in') {
			this.options.alignment = value ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT;
		}

		// Set giá trị mặc định nếu value là undefined
		let finalValue = value;
		switch (key) {
			case 'icon':
				finalValue = value || 'round';
				break;
			case 'icon_color':
				finalValue = value || '#000000';
				break;
			case 'note':
				finalValue = value || '';
				break;
			default:
				finalValue = value;
		}

		// Cập nhật option
		this.options = {
			...this.options,
			[key]: finalValue
		};

		// Emit event để thông báo có sự thay đổi
		this.fireEvent({}, 'optionsUpdated');
	}
}
