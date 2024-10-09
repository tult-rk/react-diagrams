import { Action, ActionEvent, InputType, MoveItemsState } from '@fjdr/react-canvas-core';
import _forEach from 'lodash/forEach';
import { PointModel } from '../entities/link/PointModel';
import { DiagramEngine } from '../DiagramEngine';
import { PortModel } from '../entities/port/PortModel';
import { MouseEvent } from 'react';
import { LinkModel } from '../entities/link/LinkModel';

export class DragDiagramItemsState<E extends DiagramEngine = DiagramEngine> extends MoveItemsState<E> {
	constructor() {
		super();
		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (event: ActionEvent<MouseEvent>) => {
					const item = this.engine.getMouseElement(event.event);
					if (item instanceof PortModel) {
						_forEach(this.initialPositions, (position) => {
							if (position.item instanceof PointModel) {
								const link = position.item.getParent() as LinkModel;

								// only care about the last links
								if (link.getLastPoint() !== position.item) {
									return;
								}
								if (link.getSourcePort().canLinkToPort(item)) {
									link.setTargetPort(item);
									item.reportPosition();
									this.engine.repaintCanvas();
								}
							}
						});
					}
				}
			})
		);
	}
}
