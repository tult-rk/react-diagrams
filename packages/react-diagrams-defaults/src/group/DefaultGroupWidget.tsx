import * as React from 'react';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultGroupModel } from './DefaultGroupModel';

interface DefaultGroupProps {
	group: DefaultGroupModel;
	engine: DiagramEngine;
}

const DefaultGroupWidget: React.FC<DefaultGroupProps> = ({ group, engine }) => {
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

	const handleResize = (direction: string) => (event: React.MouseEvent) => {
		console.log(`Resizing ${direction}`);
	};

	const padding = 10;
	const headerHeight = 25;
	const outerWidth = width + padding * 2;
	const outerHeight = height + padding * 2 + headerHeight;

	const rectX = padding;
	const rectY = padding + headerHeight;
	const rectWidth = width;
	const rectHeight = height;

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
				x={rectX}
				y={rectY}
				width={rectWidth}
				height={rectHeight}
				fill={group.getColor()}
				fillOpacity={0.05}
				stroke={group.getColor()}
				strokeWidth={2}
				data-groupid={group.getID()}
				rx={5}
				ry={5}
			/>
			{group.isSelected() && (
				<>
					<rect
						x={rectX - 2}
						y={rectY - 2}
						width={rectWidth + 4}
						height={rectHeight + 4}
						fill="none"
						stroke="#FFA500"
						strokeWidth={2}
					/>
					<circle
						cx={rectX}
						cy={rectY}
						r={5}
						fill={'#FFA500'}
						onMouseDown={handleResize('nw')}
						style={{ cursor: 'nwse-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={rectX + rectWidth}
						cy={rectY}
						r={5}
						fill={'#FFA500'}
						onMouseDown={handleResize('ne')}
						style={{ cursor: 'nesw-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={rectX}
						cy={rectY + rectHeight}
						r={5}
						fill={'#FFA500'}
						onMouseDown={handleResize('sw')}
						style={{ cursor: 'nesw-resize', pointerEvents: 'all' }}
					/>
					<circle
						cx={rectX + rectWidth}
						cy={rectY + rectHeight}
						r={5}
						fill={'#FFA500'}
						onMouseDown={handleResize('se')}
						style={{ cursor: 'nwse-resize', pointerEvents: 'all' }}
					/>
				</>
			)}
		</svg>
	);
};

export { DefaultGroupWidget };
