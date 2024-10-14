import * as React from 'react';
import _map from 'lodash/map';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultNodeModel } from './DefaultNodeModel';
import { DefaultPortLabel } from '../port/DefaultPortLabelWidget';
import styled from '@emotion/styled';

namespace S {
	export const Node = styled.div<{ background: string; selected: boolean; shape: boolean }>`
		background-color: ${(p) => p.background};
		border-radius: ${(p) => (p.shape ? '16px' : 'unset')};
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 14px;
		line-height: 20px;
		padding: 10px;
		width: 203px;
		border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
	`;

	export const Title = styled.div`
		display: flex;
		white-space: nowrap;
		justify-items: center;
		align-items: center;
	`;
	export const Icon = styled.div`
		padding: 8px;
	`;

	export const TitleWrapper = styled.div<{ background: string }>`
		flex-grow: 1;
		padding: 5px 5px;
		display: flex;
		flex-direction: column;
		input {
			background-color: ${(p) => p.background};
			border: none;
			outline: none;
			padding: 0 5px;
			color: white;
		}
	`;

	export const TitleName = styled.div`
		input {
			font-size: 14px;
			font-weight: bold;
		}
	`;

	export const Ports = styled.div`
		display: flex;
		background-color: white;
		border-radius: 8px;
	`;

	export const PortsContainer = styled.div<{ isIn: boolean }>`
		max-width: 50%;
		flex-basis: 50%;
		display: flex;
		flex-direction: column;
		align-items: ${(p) => (p.isIn ? 'flex-start' : 'flex-end')};
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
	subTitle?: string;
	inputWidth: string;
}

export class DefaultNodeWidget extends React.Component<DefaultNodeProps, DefaultNodeState> {
	constructor(props: DefaultNodeProps) {
		super(props);
		this.state = {
			nodeName: props.node.getOptions().name,
			subTitle: props.node.getOptions().sub,
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

	handleChangeSub = (event: React.ChangeEvent<HTMLInputElement>) => {
		const subTitle = event.target.value;
		this.setState({
			subTitle: subTitle
		});
		this.props.node.changeOptions('sub', subTitle);
	};

	generatePort = (port: any): JSX.Element => {
		return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	};

	render() {
		const shape = this.props.node.getShape();

		return (
			<S.Node
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}
				{...(shape !== undefined && { shape })}
			>
				<S.Title>
					{this.props.node.getOptions().icon && <S.Icon>{this.props.node.getOptions().icon}</S.Icon>}
					<S.TitleWrapper background={this.props.node.getOptions().color}>
						<S.TitleName>
							<input
								type="text"
								value={this.props.node.getOptions().name}
								onChange={this.handleNameChange}
								onFocus={() => this.props.engine.getModel().setEdited(true)}
								onBlur={() => this.props.engine.getModel().setEdited(false)}
							/>
						</S.TitleName>
						<div>
							<input
								type="text"
								value={this.props.node.getOptions().sub}
								onChange={this.handleChangeSub}
								onFocus={() => this.props.engine.getModel().setEdited(true)}
								onBlur={() => this.props.engine.getModel().setEdited(false)}
							/>
						</div>
					</S.TitleWrapper>
				</S.Title>
				<S.Ports>
					<S.PortsContainer isIn={true}>{_map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					<S.PortsContainer isIn={false}>{_map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
				</S.Ports>
			</S.Node>
		);
	}
}
