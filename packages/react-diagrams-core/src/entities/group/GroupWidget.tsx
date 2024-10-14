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

const GROUP_PADDING = 20;
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
		this.ob.disconnect();
		this.ob = null;

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
		return (
			<PeformanceWidget model={this.props.group} serialized={this.props.group.serialize()}>
				{() => {
					return (
						<g
							className="Group"
							data-groupid={this.props.group.getID()}
							transform={`translate(${this.props.group.getPosition().x - GROUP_PADDING / 2}, ${
								this.props.group.getPosition().y - GROUP_PADDING / 2
							})`}
						>
							<rect
								width={this.props.group.getSize().width + GROUP_PADDING}
								height={this.props.group.getSize().height + GROUP_PADDING}
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
