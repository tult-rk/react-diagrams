import { NodeModel } from '../node/NodeModel';
import { LinkModel } from '../link/LinkModel';
import _forEach from 'lodash/forEach';
import _isFinite from 'lodash/isFinite';
import _map from 'lodash/map';
import _size from 'lodash/size';
import _values from 'lodash/values';
import { Point, Rectangle } from '@fjdr/geometry';
import {
	BaseEntityEvent,
	BaseModelOptions,
	BasePositionModel,
	BasePositionModelGenerics,
	BasePositionModelListener,
	DeserializeEvent
} from '@fjdr/react-canvas-core';

export enum PortModelAlignment {
	TOP = 'top',
	LEFT = 'left',
	BOTTOM = 'bottom',
	RIGHT = 'right'
}

export interface PortModelListener extends BasePositionModelListener {
	/**
	 * fires when it first receives positional information
	 */
	reportInitialPosition?: (event: BaseEntityEvent<PortModel>) => void;
}

export interface PortModelOptions extends BaseModelOptions {
	alignment?: PortModelAlignment;
	maximumLinks?: number;
	name: string;
}

export interface PortModelGenerics extends BasePositionModelGenerics {
	OPTIONS: PortModelOptions;
	PARENT: NodeModel;
	LISTENER: PortModelListener;
}

export class PortModel<G extends PortModelGenerics = PortModelGenerics> extends BasePositionModel<G> {
	links: { [id: string]: LinkModel };

	// calculated post rendering so routing can be done correctly
	width: number;
	height: number;
	reportedPosition: boolean;

	constructor(options: G['OPTIONS']) {
		super(options);
		this.links = {};
		this.reportedPosition = false;
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.reportedPosition = false;
		this.options.name = event.data.name;
		this.options.alignment = event.data.alignment;
	}

	serialize() {
		return {
			...super.serialize(),
			name: this.options.name,
			alignment: this.options.alignment,
			parentNode: this.parent.getID(),
			links: _map(this.links, (link) => {
				return link.getID();
			})
		};
	}

	setPosition(point: Point);
	setPosition(x: number, y: number);
	setPosition(x, y?) {
		let old = this.position;
		super.setPosition(x, y);
		_forEach(this.getLinks(), (link) => {
			let point = link.getPointForPort(this);
			point.setPosition(point.getX() + x - old.x, point.getY() + y - old.y);
		});
	}

	doClone(lookupTable = {}, clone: PortModel) {
		clone.links = {};
		clone.parent = this.getParent().clone(lookupTable);
	}

	getNode(): NodeModel {
		return this.getParent();
	}

	getName(): string {
		return this.options.name;
	}

	getMaximumLinks(): number {
		return this.options.maximumLinks;
	}

	setMaximumLinks(maximumLinks: number) {
		this.options.maximumLinks = maximumLinks;
	}

	removeLink(link: LinkModel) {
		delete this.links[link.getID()];
	}

	addLink(link: LinkModel) {
		this.links[link.getID()] = link;
	}

	getLinks(): { [id: string]: LinkModel } {
		return this.links;
	}

	public createLinkModel(): LinkModel | null {
		if (_isFinite(this.options.maximumLinks)) {
			var numberOfLinks: number = _size(this.links);
			if (this.options.maximumLinks === 1 && numberOfLinks >= 1) {
				return _values(this.links)[0];
			} else if (numberOfLinks >= this.options.maximumLinks) {
				return null;
			}
		}
		return null;
	}

	reportPosition() {
		_forEach(this.getLinks(), (link) => {
			link.getPointForPort(this).setPosition(this.getCenter());
		});
		this.fireEvent(
			{
				entity: this
			},
			'reportInitialPosition'
		);
	}

	getCenter(): Point {
		return new Point(this.getX() + this.width / 2, this.getY() + this.height / 2);
	}

	getBoundingBox(): Rectangle {
		return Rectangle.fromPointAndSize(this.position, this.width, this.height);
	}

	updateCoords(coords: Rectangle) {
		this.width = coords.getWidth();
		this.height = coords.getHeight();
		this.setPosition(coords.getTopLeft());
		this.reportedPosition = true;
		this.reportPosition();
	}

	canLinkToPort(port: PortModel): boolean {
		return true;
	}

	isLocked() {
		return super.isLocked() || this.getParent().isLocked();
	}
}
