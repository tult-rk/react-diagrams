import * as React from 'react';
import { DiagramEngine, PortWidget } from '@fjdr/react-diagrams-core';
import { DefaultPortModel } from './DefaultPortModel';
import styled from '@emotion/styled';

export interface DefaultPortLabelProps {
	port: DefaultPortModel;
	engine: DiagramEngine;
}

namespace S {
	export const PortLabel = styled.div`
		display: flex;
		margin-top: 1px;
		align-items: center;
	`;

	export const Label = styled.div<{ isIn: boolean }>`
		padding: 0 5px;
		flex-grow: 1;
		display: flex;
		align-items: center;

		input {
			background-color: 'white';
			border: none;
			outline: none;
			padding: 8px;
			font-size: 14px;
			color: black;
			width: 100%;
		}
	`;

	export const Port = styled.div`
		width: 15px;
		height: 15px;
		&:hover {
			background: rgb(192, 255, 0);
		}
	`;
}

interface DefaultPortState {
	portName: string;
	inputWidth: string;
}
export class DefaultPortLabel extends React.Component<DefaultPortLabelProps, DefaultPortState> {
	constructor(props: DefaultPortLabelProps) {
		super(props);
		this.state = {
			portName: props.port.getOptions().name,
			inputWidth: this.calculateInputWidth(props.port.getOptions().name)
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
			portName: newName,
			inputWidth: this.calculateInputWidth(newName)
		});
		this.props.port.setLabel(newName);
	};

	render() {
		const port = (
			<PortWidget engine={this.props.engine} port={this.props.port}>
				<S.Port>{this.props.port.getOptions().icon ?? null}</S.Port>
			</PortWidget>
		);
		const label = (
			<S.Label isIn={this.props.port.getOptions().in}>
				<input
					type="text"
					value={this.props.port.getOptions().label}
					onChange={this.handleNameChange}
					onFocus={() => this.props.engine.getModel().setEdited(true)}
					onBlur={() => this.props.engine.getModel().setEdited(false)}
				/>
			</S.Label>
		);

		return (
			<S.PortLabel>
				{this.props.port.getOptions().in ? port : label}
				{this.props.port.getOptions().in ? label : port}
			</S.PortLabel>
		);
	}
}
