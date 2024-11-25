import * as React from 'react';
import _map from 'lodash/map';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultNodeModel } from './DefaultNodeModel';
import { DefaultPortLabel } from '../port/DefaultPortLabelWidget';
import styled from '@emotion/styled';

namespace S {
	export const Node = styled.div<{ background: string; selected: boolean; shape: string }>`
		background-color: ${(p) => p.background};
		border-radius: ${(p) => (p.shape === 'true' ? '16px' : 'unset')};
		font-family: 'Noto Sans', sans-serif;
		color: white;
		overflow: visible;
		font-size: 14px;
		line-height: 20px;
		padding: 10px;
		width: 203px;
	`;

	export const Title = styled.div`
		display: flex;
		white-space: nowrap;
		justify-items: center;
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
			padding-left: 5px;
			color: white;
			cursor: text;
			text-overflow: ellipsis;
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

	export const InputWrapper = styled.div`
		position: relative;

		&:before {
			content: attr(data-tooltip);
			position: absolute;
			bottom: 100%;
			left: 0;
			padding: 5px 10px;
			background: rgba(0, 0, 0, 0.8);
			color: white;
			border-radius: 4px;
			font-size: 12px;
			max-width: 178px;
			opacity: 0;
			visibility: hidden;
			transition: opacity 0.2s;
			pointer-events: none;
			z-index: 1000;
			margin-bottom: 5px;
			max-width: 300px;
			overflow: hidden;
			text-overflow: ellipsis;

			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			line-height: 1.4;
			max-height: calc(1.4em * 3);
			word-break: break-word;
		}

		&:hover:before {
			opacity: 1;
			visibility: visible;
			transition-delay: 2s;
		}
	`;

	export const SelectionBox = styled.div`
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;

		// Border trên
		.border-top {
			position: absolute;
			top: -4px;
			left: -2px;
			right: -2px;
			height: 1px;
			background: #ff5722;
		}

		// Border phải
		.border-right {
			position: absolute;
			top: -2px;
			right: -4px;
			bottom: -2px;
			width: 1px;
			background: #ff5722;
		}

		// Border dưới
		.border-bottom {
			position: absolute;
			bottom: -4px;
			left: -2px;
			right: -2px;
			height: 1px;
			background: #ff5722;
		}

		// Border trái
		.border-left {
			position: absolute;
			top: -2px;
			left: -4px;
			bottom: -2px;
			width: 1px;
			background: #ff5722;
		}

		// Style cho 4 điểm góc
		.corner {
			position: absolute;
			width: 4px;
			height: 4px;
			background: transparent;
			border: 1px solid #ff5722;
			border-radius: 50%;

			&.top-left {
				top: -4px;
				left: -4px;
				transform: translate(-50%, -50%);
			}

			&.top-right {
				top: -4px;
				right: -4px;
				transform: translate(50%, -50%);
			}

			&.bottom-left {
				bottom: -4px;
				left: -4px;
				transform: translate(-50%, 50%);
			}

			&.bottom-right {
				bottom: -4px;
				right: -4px;
				transform: translate(50%, 50%);
			}
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
}

export class DefaultNodeWidget extends React.Component<DefaultNodeProps, DefaultNodeState> {
	constructor(props: DefaultNodeProps) {
		super(props);
		this.state = {
			nodeName: props.node.getOptions().name,
			subTitle: props.node.getOptions().sub
		};
	}

	handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const newName = event.target.value;
		this.setState({
			nodeName: newName
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
		// TODO: fix to port available
		return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	};

	render() {
		const shape = this.props.node.getShape();

		return (
			<S.Node
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}
				shape={shape.toString()}
			>
				<div className="border-bottom" />
				<div className="border-left" />
				<div className="corner top-left" />
				<div className="corner top-right" />
				<div className="corner bottom-left" />
				<div className="corner bottom-right" />
				<S.Title>
					{this.props.node.getOptions().icon && <S.Icon>{this.props.node.getOptions().icon}</S.Icon>}
					<S.TitleWrapper background={this.props.node.getOptions().color}>
						<S.TitleName>
							<S.InputWrapper data-tooltip={this.props.node.getOptions().name}>
								<input
									type="text"
									value={this.props.node.getOptions().name}
									onChange={this.handleNameChange}
									readOnly
								/>
							</S.InputWrapper>
						</S.TitleName>
						<div>
							<S.InputWrapper data-tooltip={this.props.node.getOptions().sub}>
								<input type="text" value={this.props.node.getOptions().sub} onChange={this.handleChangeSub} readOnly />
							</S.InputWrapper>
						</div>
					</S.TitleWrapper>
				</S.Title>
				<S.Ports>
					<S.PortsContainer isIn={true}>{_map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
					<S.PortsContainer isIn={false}>{_map(this.props.node.getOutPorts(), this.generatePort)}</S.PortsContainer>
				</S.Ports>
				{this.props.node.isSelected() && (
					<S.SelectionBox>
						<div className="border-top" />
						<div className="border-right" />
						<div className="border-bottom" />
						<div className="border-left" />
						<div className="corner top-left" />
						<div className="corner top-right" />
						<div className="corner bottom-left" />
						<div className="corner bottom-right" />
					</S.SelectionBox>
				)}
			</S.Node>
		);
	}
}
