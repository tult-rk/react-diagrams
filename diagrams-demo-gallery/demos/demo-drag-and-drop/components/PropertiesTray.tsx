import * as SRD from '@projectstorm/react-diagrams';
import { DefaultNodeModel, DefaultPortModel } from '@projectstorm/react-diagrams-defaults';
import { randomUUID } from 'crypto';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
	engine: SRD.DiagramEngine;
	element: any;
	onClose: () => void;
}

export const PropertiesTray = ({ engine, element, onClose }: Props) => {
	const model = engine.getModel();
	const [node, setNode] = useState<DefaultNodeModel>(null);
	const [isAddPortIn, setIsAddPortIn] = useState(false);
	const [isAddPortOut, setIsAddPortOut] = useState(false);
	const [portName, setPortName] = useState(null);
	const [portsIn, setPortsIn] = useState<DefaultPortModel[]>(null);
	const [portsOut, setPortsOut] = useState<DefaultPortModel[]>(null);

	useEffect(() => {
		if (!engine) {
			return;
		}
		if (element.entity instanceof DefaultNodeModel) {
			setNode(element.entity);
		}
	}, [element, model.getEdited()]);

	useEffect(() => {
		if (!!node) {
			setPortsIn(node.getInPorts());
			setPortsOut(node.getOutPorts());
		}
	}, [node, node?.getInPorts(), node?.getOutPorts()]);

	const handleChangeName = (value) => {
		node.setName(value);
	};

	const handleChangePortName = (element, value) => {
		element.setLabel(value);
	};

	const handleAddPort = (value, isIn) => {
		if (value) {
			const port = new DefaultPortModel({
				name: value,
				in: isIn
			});
			node.addPort(port);
			setPortName(null);
			setIsAddPortIn(false);
			setIsAddPortOut(false);
		}
	};

	const onFocus = useCallback(() => {
		model.setEdited(true);
		engine.repaintCanvas();
	}, [model]);

	const onBlur = useCallback(() => {
		model.setEdited(false);
		engine.repaintCanvas();
	}, [model]);

	const handleDeletePort = useCallback(
		(port) => {
			console.log('======================', port);
			try {
				node?.removePort(port);
			} catch (error) {
				console.log('=====================', error);
			}
			engine.repaintCanvas();
			setPortsIn(node.getInPorts());
			setPortsOut(node.getOutPorts());
		},
		[model, node]
	);
	const renderPorts = useCallback(
		(ports: DefaultPortModel[]) => {
			if (!ports) {
				return;
			}

			return (
				<>
					{ports?.length ? (
						<>
							{ports.map((port) => {
								return (
									<div style={{ display: 'flex' }}>
										<div style={{ color: 'white' }}>Name: </div>
										<input
											defaultValue={port?.getOptions()?.label}
											onChange={(e) => {
												handleChangePortName(port, e.target.value);
											}}
											onBlur={onBlur}
											onFocus={onFocus}
										/>
										<button onClick={() => handleDeletePort(port)}>x</button>
									</div>
								);
							})}
						</>
					) : (
						<></>
					)}
				</>
			);
		},
		[element, node?.getPorts(), model.getEdited()]
	);

	return (
		<>
			<button onClick={onClose}>Close</button>
			<div style={{ color: 'white' }}>Name: </div>

			<input
				defaultValue={node?.getOptions().name}
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

			<div style={{ borderBottom: '1px solid white', margin: '10px 0 ' }} />

			<div style={{ color: 'white', marginBottom: 10 }}>Port In</div>
			<div style={{ paddingLeft: 10 }}>
				{renderPorts(portsIn)}
				{!isAddPortIn ? (
					<button
						type="button"
						onClick={() => {
							setIsAddPortIn(true);
						}}
					>
						Add Out Port
					</button>
				) : (
					<>
						<div style={{ color: 'white' }}>New Port:</div>
						<input
							autoFocus
							onChange={(e) => {
								setPortName(e.target.value);
							}}
							onBlur={() => {
								handleAddPort(portName, true);
								onBlur();
							}}
							onFocus={() => {
								onFocus();
							}}
						/>
					</>
				)}
			</div>
			<div style={{ borderBottom: '1px solid white', margin: '10px 0 ' }} />
			<>
				<div style={{ color: 'white', marginBottom: 10 }}>Port Out</div>
				{renderPorts(portsOut)}
				<div style={{ paddingLeft: 10 }}>
					{!isAddPortOut ? (
						<button
							type="button"
							onClick={() => {
								setIsAddPortOut(true);
							}}
						>
							Add In Port
						</button>
					) : (
						<>
							<div style={{ color: 'white' }}>New Port:</div>
							<input
								autoFocus
								onChange={(e) => {
									setPortName(e.target.value);
								}}
								onBlur={() => {
									handleAddPort(portName, false);
									onBlur();
								}}
								onFocus={() => {
									onFocus();
								}}
							/>
						</>
					)}
				</div>
			</>
		</>
	);
};
