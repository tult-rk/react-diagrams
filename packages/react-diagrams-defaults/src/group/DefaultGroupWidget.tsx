import * as React from 'react';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultGroupModel } from './DefaultGroupModel';
import styled from '@emotion/styled';
import { DefaultNodeWidget } from '../node/DefaultNodeWidget';

interface DefaultGroupProps {
	group: DefaultGroupModel;
	engine: DiagramEngine;
}

interface DefaultGroupState {
	groupName: string;
}
namespace S {
	export const GroupContainer = styled.div<{ color: string; width: number; height: number; top: number; left: number }>`
		position: absolute;
		background-color: ${(props: { color: string }) => props.color};
		border-radius: 5px;
		font-family: sans-serif;
		pointer-events: all;
		width: ${(props: { width: number }) => props.width}px;
		height: ${(props: { height: number }) => props.height}px;
		top: ${(props: { top: number }) => props.top}px;
		left: ${(props: { left: number }) => props.left}px;
	`;

	export const TitleBar = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
		padding: 5px;
		border-radius: 5px 5px 0 0;
	`;

	export const Title = styled.input`
		background: none;
		flex-grow: 1;
		border: none;
		color: white;
		outline: none;
		font-size: 16px;
	`;

	export const GroupContent = styled.div`
		padding: 10px;
	`;
}

class DefaultGroupWidget extends React.Component<DefaultGroupProps, DefaultGroupState> {
	constructor(props: DefaultGroupProps) {
		super(props);
		this.state = {
			groupName: props.group.getOptions().name
		};
	}

	handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newName = event.target.value;
		this.setState({ groupName: newName });
		this.props.group.setName(newName);
	};

	renderNodes = () => {
		return this.props.group.getNodes().map((node) => {
			return <DefaultNodeWidget key={node.getID()} node={node} engine={this.props.engine} />;
		});
	};

	render() {
		const { group } = this.props;
		const { groupName } = this.state;

		return (
			<S.GroupContainer
				color={group.getColor()}
				width={group.getSize().width}
				height={group.getSize().height}
				top={group.getPosition().y}
				left={group.getPosition().x}
			>
				<S.TitleBar>
					<S.Title type="text" value={groupName} onChange={this.handleNameChange} placeholder="Nhập tên group" />
				</S.TitleBar>
				<S.GroupContent>{this.renderNodes()}</S.GroupContent>
			</S.GroupContainer>
		);
	}
}

export { DefaultGroupWidget };
