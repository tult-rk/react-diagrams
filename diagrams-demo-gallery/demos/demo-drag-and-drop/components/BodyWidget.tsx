import * as React from 'react';
import _keys from 'lodash/keys';
import _forEach from 'lodash/forEach';
import { TrayWidget } from './TrayWidget';
import { action } from '@storybook/addon-actions';
import * as beautify from 'json-beautify';
import { Application, customTypes } from '../Application';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultNodeModel, DefaultPortModel, GroupModel } from '@fjdr/react-diagrams';
import { CanvasWidget } from '@fjdr/react-canvas-core';
import { DemoCanvasWidget } from '../../helpers/DemoCanvasWidget';
import styled from '@emotion/styled';
import { DiamondNodeModel } from '../../demo-custom-node1/DiamondNodeModel';
import { RiStoreLine } from 'react-icons/ri';
import { FaCaretRight } from 'react-icons/fa6';
import { PropertiesTray } from './PropertiesTray';
import { DemoButton } from '../../helpers/DemoWorkspaceWidget';
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
interface State {
	selected: any;
}
export class BodyWidget extends React.Component<BodyWidgetProps, State> {
	constructor(props) {
		super(props);
		this.state = {
			selected: null
		};
	}
	componentDidMount() {
		// Register listener for selection on the model
		this.props.app
			.getDiagramEngine()
			.getModel()
			.getNodes()
			.forEach((node) => {
				node.registerListener({
					eventDidFire: (event) => {
						this.setState({ selected: event });
					}
				});
			});
	}
	componentDidUpdate() {
		// Register listener for selection on the model
		this.props.app
			.getDiagramEngine()
			.getModel()
			.getNodes()
			.forEach((node) => {
				node.registerListener({
					eventDidFire: (event) => {
						this.setState({ selected: event });
					}
				});
			});
	}
	update() {
		this.forceUpdate();
	}

	render() {
		return (
			<S.Body>
				<S.Header>
					<div className="title">Storm React Diagrams - DnD demo</div>
					<DemoButton
						onClick={() => {
							action('Serialized Graph')(
								beautify(this.props.app.getDiagramEngine().getModel().serialize(), null, 2, 80)
							);

							navigator.clipboard.writeText(JSON.stringify(this.props.app.getDiagramEngine().getModel().serialize()));
						}}
					>
						Serialize Graph
					</DemoButton>
				</S.Header>
				<S.Content>
					<TrayWidget>
						<TrayItemWidget model={{ type: 'in' }} name="In Node" color="#B692F6" />
						<TrayItemWidget model={{ type: 'out' }} name="Out Node" color="#25AAD0" />
						<TrayItemWidget model={{ type: 'two_port' }} name="In/Out Node" color="#167646" />
					</TrayWidget>
					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node = null;
							if (data.type === 'in') {
								node = new DefaultNodeModel({
									name: 'Node ' + (nodesCount + 1),
									shape: true,
									color: '#B692F6'
								});
								node.addOutPort('Out 1');
								node.addOutPort('Out 2');
								node.addInPort('In');
							} else if (customTypes.includes(data.type)) {
								node = new DiamondNodeModel(data.type);
							} else if (data.type === 'two_port') {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), '#167646');
								const port1 = new DefaultPortModel({
									name: 'In',
									in: true,
									icon: 'rhombus',
									icon_color: '#167646'
								});
								node.addPort(port1);
								node.addOutPort('Out');
							} else {
								node = new DefaultNodeModel({ name: 'Node ' + (nodesCount + 1), shape: true, color: '#25AAD0' });
								node.addOutPort('Out');
								node.addOutPort('Out 1');
								node.addOutPort('Out 2');
							}
							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							const mouseElement = this.props.app.getDiagramEngine().getMouseElement(event);
							if (mouseElement instanceof GroupModel) {
								mouseElement.addNode(node);
								this.forceUpdate();
							}
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

					{this.state.selected && (
						<TrayWidget>
							<PropertiesTray
								element={this.state.selected}
								engine={this.props.app.getDiagramEngine()}
								onClose={() => {
									this.props.app.getDiagramEngine().getModel().clearSelection();
									this.setState({ selected: null });
								}}
							/>
						</TrayWidget>
					)}
				</S.Content>
			</S.Body>
		);
	}
}
