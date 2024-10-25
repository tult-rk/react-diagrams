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

const DefaultGroupWidget: React.FC<DefaultGroupProps> = ({ group, engine }) => {
	const [isEditing, setIsEditing] = React.useState(false);
	const [groupName, setGroupName] = React.useState(group.getName());

	// React.useEffect(() => {
	// 	const listener = {
	// 		selectionChanged: () => {
	// 			// Force re-render when selection changes
	// 			forceUpdate();
	// 		}
	// 	};
	// 	group.registerListener(listener);
	// 	return () => {
	// 		group.deregisterListener(listener);
	// 	};
	// }, [group]);

	// const forceUpdate = React.useCallback(() => {
	// 	setGroupName(group.getName()); // This will trigger a re-render
	// }, [group]);

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

	const handleResize = (direction: string) => (event: React.MouseEvent) => {
		// Implement resize logic here
		console.log(`Resizing ${direction}`);
	};

	const padding = 10; // Tăng padding lên để có thêm không gian
	const headerHeight = 25; // Chiều cao của phần tiêu đề
	const outerWidth = width + padding * 2;
	const outerHeight = height + padding * 2 + headerHeight;

	return (
		<svg
			width={outerWidth}
			height={outerHeight}
			className="group"
			data-groupid={group.getID()}
			style={{
				position: 'absolute',
				top: x - padding,
				left: y - padding,
				pointerEvents: 'none'
			}}
		>
			<foreignObject x={padding} y={padding} width={width} height={headerHeight} style={{ pointerEvents: 'all' }}>
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
						className="group-name"
						data-groupid={group.getID()}
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
				x={padding}
				y={padding + headerHeight}
				width={width}
				height={height}
				fill={group.getColor()}
				fillOpacity={0.1}
				stroke={group.getColor()}
				strokeWidth={2}
				data-groupid={group.getID()}
				rx={5}
				ry={5}
			/>
			{group.isSelected() && (
				<>
					<rect
						x={0}
						y={0}
						width={outerWidth}
						height={outerHeight}
						fill="none"
						stroke={group.getColor()}
						strokeWidth={1}
						strokeDasharray="5,5"
					/>
					<circle
						cx={0}
						cy={0}
						r={5}
						fill={group.getColor()}
						onMouseDown={handleResize('nw')}
						style={{ cursor: 'nwse-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={outerWidth}
						cy={0}
						r={5}
						fill={group.getColor()}
						onMouseDown={handleResize('ne')}
						style={{ cursor: 'nesw-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={0}
						cy={outerHeight}
						r={5}
						fill={group.getColor()}
						onMouseDown={handleResize('sw')}
						style={{ cursor: 'nesw-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={outerWidth}
						cy={outerHeight}
						r={5}
						fill={group.getColor()}
						onMouseDown={handleResize('se')}
						style={{ cursor: 'nwse-resize', pointerEvents: 'all' }}
					/>
				</>
			)}
		</svg>
	);
};

export { DefaultGroupWidget };
