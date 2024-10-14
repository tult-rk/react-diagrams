import * as React from 'react';
import _map from 'lodash/map';
import { GroupModel } from '../group/GroupModel';
import { GroupLayerModel } from './GroupLayerModel';
import { DiagramEngine } from '../../DiagramEngine';
import { GroupWidget } from '../group/GroupWidget';

export interface GroupLayerWidgetProps {
	layer: GroupLayerModel;
	engine: DiagramEngine;
}

export class GroupLayerWidget extends React.Component<GroupLayerWidgetProps> {
	render() {
		return (
			<>
				{_map(this.props.layer.getGroups(), (group: GroupModel) => {
					return <GroupWidget key={group.getID()} diagramEngine={this.props.engine} group={group} />;
				})}
			</>
		);
	}
}
