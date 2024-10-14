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

	updateSize(width: number, height: number) {
		this.props.group.updateDimensions({ width, height });

		//now mark the links as dirty
		// TODO: update later
		// try {
		// 	_forEach(this.props.Group.getNodes(), (node) => {
		// 		node.updateCoords(this.props.diagramEngine.getPortCoords(port));
		// 	});
		// } catch (ex) {}
	}

	componentDidMount(): void {
		// @ts-ignore
		this.ob = new ResizeObserver((entities) => {
			const bounds = entities[0].contentRect;
			this.updateSize(bounds.width, bounds.height);
		});

		const b = this.ref.current.getBoundingClientRect();
		this.updateSize(b.width, b.height);
		this.ob.observe(this.ref.current);
		this.installSelectionListener();
	}

	render() {
		return (
			<PeformanceWidget model={this.props.group} serialized={this.props.group.serialize()}>
				{() => {
					return (
						<S.Group
							className="Group"
							ref={this.ref}
							data-groupid={this.props.group.getID()}
							style={{
								top: this.props.group.getY(),
								left: this.props.group.getX()
							}}
						>
							{this.props.diagramEngine.generateWidgetForGroup(this.props.group)}
						</S.Group>
					);
				}}
			</PeformanceWidget>
		);
	}
}
