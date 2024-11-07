import * as SRD from '@fjdr/react-diagrams';
import { DiamondNodeFactory } from '../demo-custom-node1/DiamondNodeFactory';
import * as beautify from 'json-beautify';
/**
 * @author Dylan Vorster
 */

export const customTypes = ['diamond', 'circle', 'ellipse'];

const data = {
	id: '139',
	offsetX: 321.8230769230769,
	offsetY: 144.82307692307694,
	zoom: 60,
	gridSize: 0,
	layers: [
		{
			id: '144',
			type: 'diagram-groups',
			isSvg: true,
			transformed: true,
			models: {
				'180': {
					id: '180',
					type: 'default',
					selected: false,
					x: 1036.7499999999854,
					y: 374.5000000000291,
					position: { x: 1036.7499999999854, y: 374.5000000000291 },
					size: { width: 696.4999999999127, height: 371 },
					nodes: [
						{
							id: '146',
							type: 'default',
							selected: false,
							x: 723.5000000000291,
							y: 289.5000000000291,
							ports: [
								{
									id: '147',
									type: 'default',
									x: 916.5,
									y: 359,
									name: 'Out',
									alignment: 'right',
									parentNode: '146',
									links: ['150'],
									in: false,
									label: 'Out',
									icon: 'round',
									icon_color: '#000000',
									note: ''
								},
								{
									id: '897',
									type: 'default',
									x: 916.5,
									y: 392,
									name: '123',
									alignment: 'right',
									parentNode: '146',
									links: ['902'],
									in: false,
									label: '123',
									icon: 'round',
									icon_color: '#000000',
									note: ''
								}
							],
							group: '180',
							name: 'Node 1',
							color: '#B692F6',
							shape: false,
							sub: 'sub title',
							portsInOrder: [],
							portsOutOrder: ['147', '897']
						},
						{
							id: '148',
							type: 'default',
							selected: false,
							x: 1136.9999999999418,
							y: 424.5,
							ports: [
								{
									id: '149',
									type: 'default',
									x: 1147,
									y: 494,
									name: 'In',
									alignment: 'left',
									parentNode: '148',
									links: ['150', '902'],
									in: true,
									label: 'In',
									icon: 'round',
									icon_color: '#000000',
									note: ''
								}
							],
							group: '180',
							name: 'Node 2',
							color: '#25AAD0',
							shape: false,
							sub: 'sub title',
							portsInOrder: ['149'],
							portsOutOrder: []
						}
					],
					name: 'Group',
					color: 'rgb(0,192,255)',
					width: 696.4999999999127,
					height: 371,
					nodeIds: ['146', '148']
				}
			}
		},
		{
			id: '140',
			type: 'diagram-links',
			isSvg: true,
			transformed: true,
			models: {
				'150': {
					id: '150',
					type: 'default',
					source: '146',
					sourcePort: '147',
					target: '148',
					targetPort: '149',
					points: [
						{ id: '151', type: 'point', x: 926.5, y: 366.5 },
						{ id: '924', type: 'point', selected: false, x: 1322, y: 334 },
						{ id: '152', type: 'point', x: 1157, y: 501.5 }
					],
					labels: [{ id: '153', type: 'default', offsetX: 0, offsetY: -23, label: 'Hello World!' }],
					width: 3,
					color: 'black',
					curvyness: 50,
					selectedColor: 'rgb(0,192,255)'
				},
				'902': {
					id: '902',
					type: 'default',
					selected: false,
					source: '146',
					sourcePort: '897',
					target: '148',
					targetPort: '149',
					points: [
						{ id: '903', type: 'point', x: 926.5, y: 399.5 },
						{ id: '918', type: 'point', selected: false, x: 1024, y: 512 },
						{ id: '904', type: 'point', x: 1157, y: 501.5 }
					],
					labels: [],
					width: 3,
					color: 'black',
					curvyness: 50,
					selectedColor: 'rgb(0,192,255)'
				}
			}
		},
		{
			id: '142',
			type: 'diagram-nodes',
			isSvg: false,
			transformed: true,
			models: {
				'146': {
					id: '146',
					type: 'default',
					selected: false,
					x: 723.5000000000291,
					y: 289.5000000000291,
					ports: [
						{
							id: '147',
							type: 'default',
							x: 916.5,
							y: 359,
							name: 'Out',
							alignment: 'right',
							parentNode: '146',
							links: ['150'],
							in: false,
							label: 'Out',
							icon: 'round',
							icon_color: '#000000',
							note: ''
						},
						{
							id: '897',
							type: 'default',
							x: 916.5,
							y: 392,
							name: '123',
							alignment: 'right',
							parentNode: '146',
							links: ['902'],
							in: false,
							label: '123',
							icon: 'round',
							icon_color: '#000000',
							note: ''
						}
					],
					group: '180',
					name: 'Node 1',
					color: '#B692F6',
					shape: false,
					sub: 'sub title',
					portsInOrder: [],
					portsOutOrder: ['147', '897']
				},
				'148': {
					id: '148',
					type: 'default',
					selected: false,
					x: 1136.9999999999418,
					y: 424.5,
					ports: [
						{
							id: '149',
							type: 'default',
							x: 1147,
							y: 494,
							name: 'In',
							alignment: 'left',
							parentNode: '148',
							links: ['150', '902'],
							in: true,
							label: 'In',
							icon: 'round',
							icon_color: '#000000',
							note: ''
						}
					],
					group: '180',
					name: 'Node 2',
					color: '#25AAD0',
					shape: false,
					sub: 'sub title',
					portsInOrder: ['149'],
					portsOutOrder: []
				}
			}
		}
	]
};
export class Application {
	protected activeModel: SRD.DiagramModel;
	protected diagramEngine: SRD.DiagramEngine;

	constructor() {
		this.diagramEngine = SRD.default();
		this.newModel();
		const state = this.diagramEngine.getStateMachine().getCurrentState();
		if (state instanceof SRD.DefaultDiagramState) {
			state.dragNewLink.config.allowLooseLinks = false;
		}
	}

	public newModel() {
		this.activeModel = new SRD.DiagramModel();
		this.diagramEngine.setModel(this.activeModel);
		customTypes.map((type) => {
			this.diagramEngine.getNodeFactories().registerFactory(new DiamondNodeFactory(type));
		});

		//3-A) create a default node
		var node1 = new SRD.DefaultNodeModel('Node 1', '#B692F6');
		let port = node1.addOutPort('Out');
		node1.setPosition(100, 100);

		//3-B) create another default node
		var node2 = new SRD.DefaultNodeModel('Node 2', '#25AAD0');
		let port2 = node2.addInPort('In');
		node2.setPosition(400, 100);

		// link the ports
		let link1 = port.link<SRD.DefaultLinkModel>(port2);

		link1.addLabel('Hello World!');
		// create a group layer
		this.activeModel.addAll(link1, node1, node2);

		var model2 = new SRD.DiagramModel();
		model2.deserializeModel(data as any, this.diagramEngine);
		this.diagramEngine.setModel(model2);
	}

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}
