import * as React from 'react';
import { DiamondNodeModel } from './DiamondNodeModel';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@fjdr/react-diagrams';
import styled from '@emotion/styled';

export interface DiamondNodeWidgetProps {
	node: DiamondNodeModel;
	engine: DiagramEngine;
	size?: number;
	width?: number;
	height?: number;
}

namespace S {
	export const Port = styled.div`
		width: 16px;
		height: 16px;
		z-index: 10;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 1);
		}
	`;
}

/**
 * @author Dylan Vorster
 */
export class DiamondNodeWidget extends React.Component<DiamondNodeWidgetProps> {
	renderComponentByType(type) {
		switch (type) {
			case 'diamond':
				return (
					<svg
						width={this.props.size}
						height={this.props.size}
						dangerouslySetInnerHTML={{
							__html:
								` <g id="Layer_1">
          </g>
          <g id="Layer_2">
						<polygon fill="mediumpurple" stroke="${
							this.props.node.isSelected() ? 'white' : '#000000'
						}" stroke-width="3" stroke-miterlimit="10" points="10,` +
								this.props.size / 2 +
								` ` +
								this.props.size / 2 +
								`,10 ` +
								(this.props.size - 10) +
								`,` +
								this.props.size / 2 +
								` ` +
								this.props.size / 2 +
								`,` +
								(this.props.size - 10) +
								` "/>
          </g>`
						}}
					/>
				);

			case 'circle':
				return (
					<svg
						width={this.props.size}
						height={this.props.size}
						dangerouslySetInnerHTML={{
							__html: `<g id="Layer_1">
							</g>
							<g id="Layer_2">
							<circle r=${this.props.size / 2 - 5} cx=${this.props.size / 2} cy=${this.props.size / 2} stroke="${
								this.props.node.isSelected() ? 'white' : '#000000'
							}" stroke-width="5" fill="whitesmoke" stroke-miterlimit="10"/>
							</g>`
						}}
					/>
				);

			case 'ellipse':
				return (
					<svg
						width={this.props.width}
						height={this.props.height}
						dangerouslySetInnerHTML={{
							__html: `<g id="Layer_1">
							</g>
							<g id="Layer_2">
							<ellipse cx=${this.props.width / 2}  cy=${this.props.height / 2}  rx=${this.props.width / 2 - 5} ry=${
								this.props.height / 2 - 5
							} stroke="${
								this.props.node.isSelected() ? 'white' : '#000000'
							}" stroke-width="5" fill="lightcyan" stroke-miterlimit="10"/>
							</g>`
						}}
					/>
				);
			default:
				return '';
		}
	}

	renderDefaultPorts(type) {
		if (type === 'diamond' || type === 'circle') {
			return (
				<>
					<PortWidget
						style={{
							top: this.props.size / 2 - 8,
							left: -4,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.LEFT)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
					<PortWidget
						style={{
							left: this.props.size / 2 - 8,
							top: -4,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.TOP)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
					<PortWidget
						style={{
							left: this.props.size - 14,
							top: this.props.size / 2 - 8,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.RIGHT)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
					<PortWidget
						style={{
							left: this.props.size / 2 - 8,
							top: this.props.size - 14,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.BOTTOM)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
				</>
			);
		} else if (type === 'ellipse') {
			return (
				<>
					{/* <PortWidget
						style={{
							top: this.props.height / 2 - 8,
							left: -4,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.LEFT)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget> */}
					<PortWidget
						style={{
							left: this.props.width / 2 - 8,
							top: -2,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.TOP)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
					{/* <PortWidget
						style={{
							left: this.props.width - 10,
							top: this.props.height / 2 - 8,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.RIGHT)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget> */}
					<PortWidget
						style={{
							left: this.props.width / 2 - 8,
							top: this.props.height - 12,
							position: 'absolute'
						}}
						port={this.props.node.getPort(PortModelAlignment.BOTTOM)}
						engine={this.props.engine}
					>
						<S.Port />
					</PortWidget>
				</>
			);
		}
	}

	render() {
		const type = this.props.node.getType();

		return (
			<div
				className={'diamond-node'}
				style={{
					position: 'relative',
					width: this.props.size,
					height: this.props.size
				}}
			>
				{this.renderComponentByType(type)}
				{this.renderDefaultPorts(type)}
			</div>
		);
	}
}
