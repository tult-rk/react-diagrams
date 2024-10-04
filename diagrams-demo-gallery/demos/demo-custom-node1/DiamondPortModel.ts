import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@fjdr/react-diagrams';

export class DiamondPortModel extends PortModel {
	constructor(alignment: PortModelAlignment, type: string = 'diamond') {
		super({
			type: type,
			name: alignment,
			alignment: alignment
		});
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}
