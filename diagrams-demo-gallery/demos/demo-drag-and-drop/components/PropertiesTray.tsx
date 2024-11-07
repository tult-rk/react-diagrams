import * as SRD from '@fjdr/react-diagrams';
import { DefaultGroupModel, DefaultNodeModel, DefaultPortModel } from '@fjdr/react-diagrams-defaults';
import { randomUUID } from 'crypto';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
	engine: SRD.DiagramEngine;
	element: any;
	onClose: () => void;
}

const colors = [
	{ name: 'Red', value: 'red' },
	{ name: 'Green', value: 'green' },
	{ name: 'Blue', value: 'blue' },
	{ name: 'Yellow', value: 'yellow' },
	{ name: 'Black', value: 'black' }
];

export const PropertiesTray = ({ engine, element, onClose }: Props) => {
	const model = engine.getModel();
	const [node, setNode] = useState<DefaultNodeModel>(null);
	const [isAddPortIn, setIsAddPortIn] = useState(false);
	const [isAddPortOut, setIsAddPortOut] = useState(false);
	const [portName, setPortName] = useState(null);
	const [portsIn, setPortsIn] = useState<DefaultPortModel[]>(null);
	const [portsOut, setPortsOut] = useState<DefaultPortModel[]>(null);
	const [isShape, setIsShape] = useState<boolean>(true);

	const [selectedEntities, setSelectedEntities] = useState<any>([]);
	// TODO: Dùng redux để quản lý selected node

	const previousSelectedRef = useRef<any>([]);

	useEffect(() => {
		// Lắng nghe sự kiện từ engine model
		if (!engine) {
			return;
		}
		let a;
		const listener = engine.getModel().registerListener({
			selectionChanged: () => {
				// Khi có selection change, lấy selected entities
				const a = engine.getModel().getSelectedEntities();
			}
		});

		return () => {
			listener.deregister();
		};
	}, [engine]);

	const areEntitiesEqual = (prev: any[], current: any[]) => {
		if (prev.length !== current.length) return false;
		return prev.every((entity, index) => entity.getID() === current[index].getID());
	};

	const updateSelectedEntities = useCallback(() => {
		const currentSelected = engine.getModel().getSelectedEntities() as SRD.BaseModel<any>[];
		if (!areEntitiesEqual(previousSelectedRef.current, currentSelected)) {
			setSelectedEntities(currentSelected);
			previousSelectedRef.current = currentSelected;
			console.log('Selected entities updated:', currentSelected);
		}
	}, [engine]);

	useEffect(() => {
		const interval = setInterval(updateSelectedEntities, 100);
		return () => clearInterval(interval);
	}, [updateSelectedEntities]);

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
			setIsShape(node.getShape());
		}
	}, [node, node?.getInPorts(), node?.getOutPorts()]);

	const handleChangeName = (value) => {
		node.setName(value);
	};

	const handleChangePortName = (element, value) => {
		const port = element as DefaultPortModel;
		port.changeOption('icon_color', 'red');
		port.changeOption('label', value);
		port.changeOption('icon', 'triangle');
		port.changeOption('note', '12312312');
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

	const handleColorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		node.changeOptions('color', event.target.value);
		engine.repaintCanvas();
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

	const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsShape(event.target.value === 'true');
		node.changeShape(event.target.value === 'true');
		engine.repaintCanvas();
	};

	const handleAddGroup = () => {
		const group = new DefaultGroupModel();
		const listNodes = selectedEntities.filter((entity) => entity instanceof DefaultNodeModel);
		group.addNodes(listNodes);
		model.addGroup(group);
		engine.repaintCanvas();
	};

	const handleUngroup = (group) => {
		group.unGroup();
		engine.repaintCanvas();
	};

	const handleRemoveGroup = (group) => {
		group.remove();
		engine.repaintCanvas();
	};

	if (selectedEntities.length > 1) {
		return <button onClick={handleAddGroup}>Add Group</button>;
	}

	if (selectedEntities[0] instanceof DefaultGroupModel) {
		const group = selectedEntities[0];
		return (
			<div style={{ color: 'white' }}>
				<div>Group</div>
				<div>Name: {group.getOptions().name}</div>
				<div>Color: {group.getOptions().color}</div>
				<div>Height: {group.height}</div>
				<div>Width: {group.width}</div>
				<div>X: {group.getPosition().x}</div>
				<div>Y: {group.getPosition().y}</div>
				<div>List Nodes: {Object.values(group.getNodesList()).map((node) => node.getOptions().name)}</div>
				<div>
					<button onClick={() => handleUngroup(group)}>Ungroup</button>
					<button onClick={() => handleRemoveGroup(group)}>Delete Group</button>
				</div>
			</div>
		);
	}

	return (
		<div style={{ color: 'white' }}>
			<button onClick={onClose}>Close</button>
			<div>Name: </div>

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
				<input
					type="color"
					defaultValue={node?.getOptions().color}
					onChange={(e) => handleColorChange(e)}
					style={{ width: 25, height: 25, padding: '0', border: 'none' }}
				/>
			</div>
			<div style={{ color: 'white' }}>Height: {element?.entity?.height}</div>
			<div style={{ color: 'white' }}>Width: {element?.entity?.width}</div>
			<div style={{ color: 'white' }}>X: {element?.entity?.position?.x}</div>
			<div style={{ color: 'white' }}>Y: {element?.entity?.position?.y}</div>
			<div style={{ borderBottom: '1px solid white', margin: '10px 0 ' }} />

			<div style={{ color: 'white', marginBottom: 10 }}>
				<h3>Select Shape Option:</h3>
				<label>
					<input
						type="radio"
						name="shapeOption"
						value="true"
						checked={isShape === true}
						onChange={handleOptionChange}
					/>
					Shape (True)
				</label>
				<br />
				<label>
					<input
						type="radio"
						name="shapeOption"
						value="false"
						checked={isShape === false}
						onChange={handleOptionChange}
					/>
					Un-shape (False)
				</label>
			</div>

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
		</div>
	);
};
