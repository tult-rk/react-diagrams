import * as React from 'react';
import _keys from 'lodash/keys';
import { TrayWidget } from './TrayWidget';
import { Application, customTypes } from '../Application';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from '../../helpers/DemoCanvasWidget';
import styled from '@emotion/styled';
import { DiamondNodeModel } from '../../demo-custom-node1/DiamondNodeModel';
import { AiFillCaretRight } from 'react-icons/ai';
export interface BodyWidgetProps {
	app: Application;
}

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

	export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;
}

export class BodyWidget extends React.Component<BodyWidgetProps> {
	render() {
		return (
			<S.Body>
				<S.Header>
					<div className="title">Storm React Diagrams - DnD demo</div>
				</S.Header>
				<S.Content>
					<TrayWidget>
						<TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'two_port' }} name="In/Out Node" color="steelblue" />
						<TrayItemWidget model={{ type: 'circle' }} name="Circle Node" color="whitesmoke" />
						<TrayItemWidget model={{ type: 'diamond' }} name="Diamond Node" color="mediumpurple" />
						<TrayItemWidget model={{ type: 'ellipse' }} name="Ellipse Node" color="lightcyan" />
					</TrayWidget>
					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node = null;
							if (data.type === 'in') {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
								node.addInPort('In');
							} else if (customTypes.includes(data.type)) {
								node = new DiamondNodeModel(data.type);
							} else if (data.type === 'two_port') {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'steelblue');
								node.addInPort('In');
								node.addOutPort('Out');
							} else {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
								node.addOutPort('Out');
							}
							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							this.props.app.getDiagramEngine().getModel().addNode(node);
							this.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DemoCanvasWidget>
							<CanvasWidget engine={this.props.app.getDiagramEngine()} />
						</DemoCanvasWidget>
					</S.Layer>
				</S.Content>
			</S.Body>
		);
	}
}
