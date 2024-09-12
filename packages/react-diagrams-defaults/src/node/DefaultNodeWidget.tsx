import * as React from 'react';
import _map from 'lodash/map';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel } from './DefaultNodeModel';
import { DefaultPortLabel } from '../port/DefaultPortLabelWidget';
import styled from '@emotion/styled';

namespace S {
	export const Node = styled.div<{ background: string; selected: boolean }>`
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
	`;

	export const Title = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;

	export const TitleName = styled.div`
		flex-grow: 1;
		padding: 5px 5px;
		input {
			background-color: transparent;
			border: none;
			outline: none;
			padding: 0 5px;
			font-size: 14px;
			color: white;
		}
	`;

	export const Ports = styled.div`
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;

	export const PortsContainer = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;
}

export interface DefaultNodeProps {
	node: DefaultNodeModel;
	engine: DiagramEngine;
}

interface DefaultNodeState {
	nodeName: string;
	inputWidth: string;
}

export class DefaultNodeWidget extends React.Component<DefaultNodeProps, DefaultNodeState> {
	constructor(props: DefaultNodeProps) {
		super(props);
		this.state = {
			nodeName: props.node.getOptions().name,
			inputWidth: this.calculateInputWidth(props.node.getOptions().name)
		};
	}

	calculateInputWidth = (value: string): string => {
		// Estimate the width of the input based on the length of the text
		// Adjust the multiplier (e.g., 8) based on your font size and padding
		return (value.length + 1) * 8 + 'px';
	};

	handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const newName = event.target.value;
		this.setState({
			nodeName: newName,
			inputWidth: this.calculateInputWidth(newName)
		});
		this.props.node.setName(newName);
	};

	generatePort = (port: any): JSX.Element => {
		return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	};

	render() {
		return (
			<S.Node
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}
			>
				<S.Title>
					<S.TitleName>
						<input
							type="text"
							value={this.props.node.getOptions().name}
							onChange={this.handleNameChange}
							style={{ width: this.state.inputWidth }}
						/>
					</S.TitleName>
				</S.Title>
				<S.Ports>
					<S.PortsContainer>{_map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					<S.PortsContainer>{_map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
				</S.Ports>
			</S.Node>
		);
	}
}
