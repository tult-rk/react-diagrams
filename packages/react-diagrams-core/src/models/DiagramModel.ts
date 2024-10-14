import _filter from 'lodash/filter';
import _flatMap from 'lodash/flatMap';
import _forEach from 'lodash/forEach';
import _some from 'lodash/some';
import _values from 'lodash/values';
import { LinkModel } from '../entities/link/LinkModel';
import { NodeModel } from '../entities/node/NodeModel';
import {
	BaseEntityEvent,
	BaseEntityListener,
	BaseModel,
	CanvasModel,
	CanvasModelGenerics,
	LayerModel,
	DeserializeEvent
} from '@fjdr/react-canvas-core';
import { NodeLayerModel } from '../entities/node-layer/NodeLayerModel';
import { LinkLayerModel } from '../entities/link-layer/LinkLayerModel';
import { GroupModel } from '../entities/group/GroupModel';
import { GroupLayerModel } from '../entities/group-layer/GroupLayerModel';

export interface DiagramListener extends BaseEntityListener {
	nodesUpdated?(event: BaseEntityEvent & { node: NodeModel; isCreated: boolean }): void;
	groupsUpdated?(event: BaseEntityEvent & { group: GroupModel; isCreated: boolean }): void;
	linksUpdated?(event: BaseEntityEvent & { link: LinkModel; isCreated: boolean }): void;
}

export interface DiagramModelGenerics extends CanvasModelGenerics {
	LISTENER: DiagramListener;
}

export class DiagramModel<G extends DiagramModelGenerics = DiagramModelGenerics> extends CanvasModel<G> {
	protected activeNodeLayer: NodeLayerModel;
	protected activeLinkLayer: LinkLayerModel;
	protected activeGroupLayer: GroupLayerModel;

	constructor(options: G['OPTIONS'] = {}) {
		super(options);
		this.addLayer(new LinkLayerModel());
		this.addLayer(new NodeLayerModel());
		this.addLayer(new GroupLayerModel());
	}

	deserialize(event: DeserializeEvent<this>) {
		this.layers = [];
		super.deserialize(event);
	}

	addLayer(layer: LayerModel): void {
		super.addLayer(layer);
		if (layer instanceof NodeLayerModel) {
			this.activeNodeLayer = layer;
		}
		if (layer instanceof LinkLayerModel) {
			this.activeLinkLayer = layer;
		}
		if (layer instanceof GroupLayerModel) {
			this.activeGroupLayer = layer;
		}
	}

	getLinkLayers(): LinkLayerModel[] {
		return _filter(this.layers, (layer) => {
			return layer instanceof LinkLayerModel;
		}) as LinkLayerModel[];
	}

	getNodeLayers(): NodeLayerModel[] {
		return _filter(this.layers, (layer) => {
			return layer instanceof NodeLayerModel;
		}) as NodeLayerModel[];
	}

	getGroupLayers(): GroupLayerModel[] {
		return _filter(this.layers, (layer) => {
			return layer instanceof GroupLayerModel;
		}) as GroupLayerModel[];
	}

	getActiveNodeLayer(): NodeLayerModel {
		if (!this.activeNodeLayer) {
			const layers = this.getNodeLayers();
			if (layers.length === 0) {
				this.addLayer(new NodeLayerModel());
			} else {
				this.activeNodeLayer = layers[0];
			}
		}
		return this.activeNodeLayer;
	}

	getActiveGroupLayer(): GroupLayerModel {
		if (!this.activeGroupLayer) {
			const layers = this.getGroupLayers();
			if (layers.length === 0) {
				this.addLayer(new GroupLayerModel());
				this.activeGroupLayer = this.getGroupLayers()[0];
			} else {
				this.activeGroupLayer = layers[0];
			}
		}
		return this.activeGroupLayer;
	}

	getActiveLinkLayer(): LinkLayerModel {
		if (!this.activeLinkLayer) {
			const layers = this.getLinkLayers();
			if (layers.length === 0) {
				this.addLayer(new LinkLayerModel());
			} else {
				this.activeLinkLayer = layers[0];
			}
		}
		return this.activeLinkLayer;
	}

	getNode(node: string): NodeModel {
		for (const layer of this.getNodeLayers()) {
			const model = layer.getModel(node);
			if (model) {
				return model;
			}
		}
	}

	getGroup(group: string): GroupModel {
		for (const layer of this.getGroupLayers()) {
			const model = layer.getModel(group);
			if (model) {
				return model;
			}
		}
	}

	getLink(link: string): LinkModel {
		for (const layer of this.getLinkLayers()) {
			const model = layer.getModel(link);
			if (model) {
				return model;
			}
		}
	}

	addAll(...models: BaseModel[]): BaseModel[] {
		_forEach(models, (model) => {
			if (model instanceof LinkModel) {
				this.addLink(model);
			} else if (model instanceof NodeModel) {
				this.addNode(model);
			} else if (model instanceof GroupModel) {
				this.addGroup(model);
			}
		});
		return models;
	}

	addLink(link: LinkModel): LinkModel {
		this.getActiveLinkLayer().addModel(link);
		this.fireEvent(
			{
				link,
				isCreated: true
			},
			'linksUpdated'
		);
		return link;
	}

	addGroup(group: GroupModel): GroupModel {
		this.getActiveGroupLayer().addModel(group);
		this.fireEvent({ group, isCreated: true }, 'groupsUpdated');
		return group;
	}

	addNode(node: NodeModel): NodeModel {
		this.getActiveNodeLayer().addModel(node);
		this.fireEvent({ node, isCreated: true }, 'nodesUpdated');
		return node;
	}

	removeLink(link: LinkModel) {
		const removed = _some(this.getLinkLayers(), (layer) => {
			return layer.removeModel(link);
		});
		if (removed) {
			this.fireEvent({ link, isCreated: false }, 'linksUpdated');
		}
	}

	removeNode(node: NodeModel) {
		const removed = _some(this.getNodeLayers(), (layer) => {
			return layer.removeModel(node);
		});
		if (removed) {
			this.fireEvent({ node, isCreated: false }, 'nodesUpdated');
		}
	}

	removeGroup(group: GroupModel) {
		const removed = _some(this.getGroupLayers(), (layer) => {
			return layer.removeModel(group);
		});
		if (removed) {
			this.fireEvent({ group, isCreated: false }, 'groupsUpdated');
		}
	}

	getLinks(): LinkModel[] {
		return _flatMap(this.getLinkLayers(), (layer) => {
			return _values(layer.getModels());
		});
	}

	getNodes(): NodeModel[] {
		return _flatMap(this.getNodeLayers(), (layer) => {
			return _values(layer.getModels());
		});
	}

	getGroups(): GroupModel[] {
		return _flatMap(this.getGroupLayers(), (layer) => {
			return _values(layer.getModels());
		});
	}
}
