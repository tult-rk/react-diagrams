import {
	DiagramEngine,
	LabelModel,
	LinkModel,
	LinkModelGenerics,
	LinkModelListener,
	PointModel,
	PortModel,
	PortModelAlignment
} from '@fjdr/react-diagrams-core';
import { DefaultLabelModel } from '../label/DefaultLabelModel';
import { BezierCurve } from '@fjdr/geometry';
import { BaseEntityEvent, BaseModelOptions, DeserializeEvent } from '@fjdr/react-canvas-core';

export interface DefaultLinkModelListener extends LinkModelListener {
	colorChanged?(event: BaseEntityEvent<DefaultLinkModel> & { color: null | string }): void;

	widthChanged?(event: BaseEntityEvent<DefaultLinkModel> & { width: 0 | number }): void;
}

export interface DefaultLinkModelOptions extends BaseModelOptions {
	width?: number;
	color?: string;
	selectedColor?: string;
	curvyness?: number;
	type?: string;
	testName?: string;
}

export interface DefaultLinkModelGenerics extends LinkModelGenerics {
	LISTENER: DefaultLinkModelListener;
	OPTIONS: DefaultLinkModelOptions;
}

export class DefaultLinkModel extends LinkModel<DefaultLinkModelGenerics> {
	constructor(options: DefaultLinkModelOptions = {}) {
		super({
			type: 'default',
			width: options.width || 3,
			color: options.color || 'black',
			selectedColor: options.selectedColor || 'rgb(0,192,255)',
			curvyness: 50,
			...options
		});
		this.options.color =
			this.targetPort?.getOptions().icon_color || this.sourcePort?.getOptions().icon_color || options.color || 'black';
	}

	calculateControlOffset(port: PortModel): [number, number] {
		if (port.getOptions().alignment === PortModelAlignment.RIGHT) {
			return [this.options.curvyness, 0];
		} else if (port.getOptions().alignment === PortModelAlignment.LEFT) {
			return [-this.options.curvyness, 0];
		} else if (port.getOptions().alignment === PortModelAlignment.TOP) {
			return [0, -this.options.curvyness];
		}
		return [0, this.options.curvyness];
	}

	getSVGPath(): string {
		if (this.points.length === 2) {
			const curve = new BezierCurve();
			const padding = 0; // Khoảng cách 2px, có thể điều chỉnh từ 1 đến 2

			let sourcePosition = this.getFirstPoint().getPosition().clone();
			let targetPosition = this.getLastPoint().getPosition().clone();

			if (this.sourcePort) {
				const adjustedSource = this.adjustPositionForPadding(this.getSourcePort(), this.getFirstPoint(), padding);
				sourcePosition.x = adjustedSource.x;
				sourcePosition.y = adjustedSource.y;
			}
			if (this.targetPort) {
				const adjustedTarget = this.adjustPositionForPadding(this.getTargetPort(), this.getLastPoint(), padding);
				targetPosition.x = adjustedTarget.x;
				targetPosition.y = adjustedTarget.y;
			}

			curve.setSource(sourcePosition);
			curve.setTarget(targetPosition);
			curve.setSourceControl(sourcePosition.clone());
			curve.setTargetControl(targetPosition.clone());

			if (this.sourcePort) {
				curve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			}
			if (this.targetPort) {
				curve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
			}

			return curve.getSVGCurve();
		}
	}

	serialize() {
		return {
			...super.serialize(),
			width: this.options.width,
			color: this.options.color,
			curvyness: this.options.curvyness,
			selectedColor: this.options.selectedColor
		};
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.color = event.data.color;
		this.options.width = event.data.width;
		this.options.curvyness = event.data.curvyness;
		this.options.selectedColor = event.data.selectedColor;
	}

	addLabel(label: LabelModel | string) {
		if (label instanceof LabelModel) {
			return super.addLabel(label);
		}
		let labelOb = new DefaultLabelModel();
		labelOb.setLabel(label);
		return super.addLabel(labelOb);
	}

	setWidth(width: number) {
		this.options.width = width;
		this.fireEvent({ width }, 'widthChanged');
	}

	setColor(color: string) {
		this.options.color = color;
		this.fireEvent({ color }, 'colorChanged');
	}

	adjustPositionForPadding(port: PortModel, point: PointModel, padding: number): { x: number; y: number } {
		const position = point.getPosition();
		const alignment = port.getOptions().alignment;

		let x = position.x;
		let y = position.y;

		if (alignment === PortModelAlignment.RIGHT) {
			x -= padding;
		} else if (alignment === PortModelAlignment.LEFT) {
			x += padding;
		} else if (alignment === PortModelAlignment.TOP) {
			y += padding;
		} else if (alignment === PortModelAlignment.BOTTOM) {
			y -= padding;
		}

		return { x, y };
	}
}
