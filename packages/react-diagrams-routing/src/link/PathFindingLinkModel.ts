import { PathFindingLinkFactory } from './PathFindingLinkFactory';
import { DefaultLinkModel, DefaultLinkModelOptions } from '@fjdr/react-diagrams-defaults';

export class PathFindingLinkModel extends DefaultLinkModel {
	constructor(options: DefaultLinkModelOptions = {}) {
		super({
			type: PathFindingLinkFactory.NAME,
			...options
		});
	}

	performanceTune() {
		return false;
	}
}
