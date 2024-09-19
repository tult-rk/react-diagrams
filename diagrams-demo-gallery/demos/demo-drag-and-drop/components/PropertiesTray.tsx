import { DefaultNodeModel } from '@projectstorm/react-diagrams-defaults';
import React, { useEffect, useState } from 'react';

export const PropertiesTray = ({ engine, element, onClose }) => {
	const [node, setNode] = useState<DefaultNodeModel>(null);

	console.log(node);
	const reset = () => {};

	return (
		<>
			<button onClick={onClose}>Close</button>
			<div style={{ color: 'white' }}>Name: {element?.entity?.options?.name}</div>

			<input
				defaultValue={element?.entity?.options?.name}
				onChange={(e) => {
					node.setName(e.target.value);
				}}
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
