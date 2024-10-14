import * as React from 'react';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultGroupModel } from './DefaultGroupModel';
import styled from '@emotion/styled';
import { DefaultNodeWidget } from '../node/DefaultNodeWidget';

interface DefaultGroupProps {
	group: DefaultGroupModel;
	engine: DiagramEngine;
}

interface DefaultGroupState {
	groupName: string;
	width: number;
	height: number;
	top: number;
	left: number;
}

namespace S {
	export const GroupContainer = styled.div<{ color: string; width: number; height: number; top: number; left: number }>`
		position: absolute;
		background-color: ${(props: { color: string }) => props.color || '#ccceff'};
		border-radius: 5px;
		font-family: sans-serif;
		pointer-events: all;
		border: 1px solid #ccc;
		width: ${(props: { width: number }) => props.width}px;
		height: ${(props: { height: number }) => props.height}px;
		top: ${(props: { top: number }) => props.top}px;
		left: ${(props: { left: number }) => props.left}px;
	`;

	export const TitleBar = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
		padding: 5px;
		border-radius: 5px 5px 0 0;
	`;

	export const Title = styled.input`
		background: none;
		flex-grow: 1;
		border: none;
		color: white;
		outline: none;
		font-size: 16px;
	`;

	export const GroupContent = styled.div`
		padding: 10px;
	`;
}

const DefaultGroupWidget = ({ group, engine }) => {
	const [isEditing, setIsEditing] = React.useState(false);
	const [groupName, setGroupName] = React.useState(group.getName());

	const handleDoubleClick = () => {
		setIsEditing(true);
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setGroupName(event.target.value);
	};

	const handleBlur = () => {
		setIsEditing(false);
		group.setName(groupName);
	};

	const { width, height } = group.getSize();
	const { x, y } = group.getPosition();

	return (
		<svg
			width={width}
			height={height + 25}
			style={{
				position: 'absolute',
				top: y - 25,
				left: x,
				pointerEvents: 'none'
			}}
		>
			<foreignObject x={5} y={0} width={width - 10} height={25}>
				{isEditing ? (
					<input
						value={groupName}
						onChange={handleChange}
						onBlur={handleBlur}
						style={{
							fontSize: '14px',
							fontFamily: 'sans-serif',
							fontWeight: 'bold',
							color: group.getColor(),
							background: 'transparent',
							border: 'none',
							outline: 'none',
							width: '100%',
							pointerEvents: 'auto'
						}}
						autoFocus
					/>
				) : (
					<div
						onDoubleClick={handleDoubleClick}
						style={{
							fontSize: '14px',
							fontFamily: 'sans-serif',
							fontWeight: 'bold',
							color: group.getColor(),
							pointerEvents: 'auto',
							cursor: 'pointer'
						}}
					>
						{groupName}
					</div>
				)}
			</foreignObject>
			<rect
				x={0}
				y={25}
				width={width}
				height={height}
				fill={group.getColor()}
				fillOpacity={0.1}
				stroke={group.getColor()}
				strokeWidth={2}
				rx={5}
				ry={5}
			/>
		</svg>
	);
};

export { DefaultGroupWidget };
