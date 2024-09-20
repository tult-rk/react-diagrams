import * as SRD from '@projectstorm/react-diagrams';
import { DefaultNodeModel } from '@projectstorm/react-diagrams-defaults';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
	engine: SRD.DiagramEngine;
	element: any;
	onClose: () => void;
}

export const PropertiesTray = ({ engine, element, onClose }: Props) => {
	const model = engine.getModel();
	const [node, setNode] = useState(null);

	useEffect(() => {
		if (!engine) {
			return;
		}
		const item = engine.getModel().getNode(element?.entity?.options?.id);
		setNode(item);
	}, [element?.entity?.options?.id]);

	const handleChangeName = (value) => {
		node.setName(value);
		engine.repaintCanvas();
	};

	const onFocus = useCallback(() => {
		model.setEdited(true);
	}, [model]);

	const onBlur = useCallback(() => {
		model.setEdited(false);
	}, [model]);

	return (
		<>
			<button onClick={onClose}>Close</button>
			<div style={{ color: 'white' }}>Name: </div>

			<input
				defaultValue={node?.options?.name}
				onChange={(e) => {
					handleChangeName(e.target.value);
				}}
				onBlur={onBlur}
				onFocus={onFocus}
			/>
			<div style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
				Color:
				<div
					style={{
						width: 10,
						height: 10,
						margin: '0 5px',
						backgroundColor: element?.entity?.options?.color
					}}
				></div>
			</div>
			<div style={{ color: 'white' }}>Height: {element?.entity?.height}</div>
			<div style={{ color: 'white' }}>Width: {element?.entity?.width}</div>

			{element?.entity?.portsIn?.length ? (
				<>
					<div style={{ color: 'white' }}>Port In</div>
					{element?.entity?.portsIn.map((port) => (
						<div>
							<div style={{ color: 'white' }}>Name: {port.options.label}</div>
						</div>
					))}
				</>
			) : (
				<></>
			)}

			{element?.entity?.portsOut?.length ? (
				<>
					<div style={{ color: 'white' }}>Port Out</div>

					{element?.entity?.portsOut.map((port) => (
						<div>
							<div style={{ color: 'white' }}>Name: {port.options.label}</div>
						</div>
					))}
				</>
			) : (
				<></>
			)}
		</>
	);
};
