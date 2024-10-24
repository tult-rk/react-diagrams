import * as React from 'react';
import _forEach from 'lodash/forEach';
import { DiagramEngine } from '../../DiagramEngine';
import { GroupModel } from './GroupModel';
import { BaseEntityEvent, BaseModel, ListenerHandle, PeformanceWidget } from '@fjdr/react-canvas-core';
import styled from '@emotion/styled';
import ResizeObserver from 'resize-observer-polyfill';

export interface GroupProps {
	group: GroupModel;
	children?: any;
	diagramEngine: DiagramEngine;
}
namespace S {
	export const Group = styled.div`
		position: absolute;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Chrome/Safari/Opera */
		user-select: none;
		cursor: move;
		pointer-events: all;
	`;
}

export class GroupWidget extends React.Component<GroupProps> {
	ob: any;
	ref: React.RefObject<HTMLDivElement>;
	listener: ListenerHandle;

	constructor(props: GroupProps) {
		super(props);
		this.ref = React.createRef();
	}

	componentWillUnmount(): void {
		this.listener?.deregister();
		this.listener = null;
	}

	componentDidUpdate(prevProps: Readonly<GroupProps>, prevState: Readonly<any>, snapshot?: any): void {
		if (this.listener && this.props.group !== prevProps.group) {
			this.listener.deregister();
			this.installSelectionListener();
		}
	}

	installSelectionListener() {
		this.listener = this.props.group.registerListener({
			selectionChanged: (event: BaseEntityEvent<BaseModel> & { isSelected: boolean }) => {
				this.forceUpdate();
			}
		});
	}
	render() {
		const { group } = this.props;

		// Tính toán vị trí góc trên bên trái
		const topLeftX = group.getPosition().x - group.getSize().width / 2;
		const topLeftY = group.getPosition().y - group.getSize().height / 2;

		return (
			<PeformanceWidget model={this.props.group} serialized={this.props.group.serialize()}>
				{() => {
					return (
						<g data-groupid={this.props.group.getID()} transform={`translate(${topLeftX}, ${topLeftY})`}>
							<rect
								width={this.props.group.getSize().width + 20}
								height={this.props.group.getSize().height}
								fill="transparent"
								fillOpacity={0.1}
								stroke="transparent"
							/>
							{this.props.diagramEngine.generateWidgetForGroup(this.props.group)}
						</g>
					);
				}}
			</PeformanceWidget>
		);
	}
}
