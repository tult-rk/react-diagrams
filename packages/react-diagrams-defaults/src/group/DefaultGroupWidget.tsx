import * as React from 'react';
import { DiagramEngine } from '@fjdr/react-diagrams-core';
import { DefaultGroupModel } from './DefaultGroupModel';
import { Point, Rectangle } from '@fjdr/geometry';

interface DefaultGroupProps {
	group: DefaultGroupModel;
	engine: DiagramEngine;
}

const DefaultGroupWidget: React.FC<DefaultGroupProps> = ({ group, engine }) => {
	const [isEditing, setIsEditing] = React.useState(false);
	const [groupName, setGroupName] = React.useState(group.getName());

	React.useEffect(() => {
		setGroupName(group.getName());
	}, [group.getName()]);

	const handleDoubleClick = () => {
		setIsEditing(true);
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newName = event.target.value;
		setGroupName(newName);
		group.setName(newName);
	};

	const handleBlur = () => {
		setIsEditing(false);
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			setIsEditing(false);
		}
		if (event.key === 'Escape') {
			setGroupName(group.getName());
			setIsEditing(false);
		}
	};

	const textStyle: React.CSSProperties = {
		fontSize: group.getFontSize(),
		fontFamily: group.getFontFamily(),
		fontWeight: group.getFontWeight(),
		color: group.getColor(),
		pointerEvents: 'auto',
		cursor: 'pointer'
	};

	const inputStyle: React.CSSProperties = {
		...textStyle,
		background: 'transparent',
		border: 'none',
		outline: 'none',
		width: '100%',
		pointerEvents: 'auto'
	};

	const renderGroupName = () => {
		if (isEditing) {
			return (
				<input
					value={groupName}
					onChange={handleChange}
					onBlur={handleBlur}
					onKeyDown={handleKeyPress}
					style={inputStyle}
					autoFocus
				/>
			);
		}

		return (
			<div className="group-name" data-groupid={group.getID()} onDoubleClick={handleDoubleClick} style={textStyle}>
				{groupName}
			</div>
		);
	};

	const { width, height } = group.getSize();
	const { x, y } = group.getPosition();

	const PADDING = 10;

	const calculateMinGroupSize = (nodes: any[]) => {
		if (!nodes.length) return { minWidth: 100, minHeight: 100 };

		// Tìm node có boundary lớn nhất (tính cả padding không đều)
		const maxNodeSize = nodes.reduce(
			(max, node) => {
				const bounds = node.getBoundingBox();
				return {
					width: Math.max(max.width, bounds.getRight() - bounds.getLeft() + NODE_PADDING.left + NODE_PADDING.right),
					height: Math.max(max.height, bounds.getBottom() - bounds.getTop() + NODE_PADDING.top + NODE_PADDING.bottom)
				};
			},
			{ width: 0, height: 0 }
		);

		const minWidth = maxNodeSize.width * 1.5 + GROUP_PADDING * 2;
		const minHeight = maxNodeSize.height * 1.5 + GROUP_PADDING * 2;

		return { minWidth, minHeight };
	};

	const NODE_PADDING = {
		top: 40,
		right: 20,
		bottom: 20,
		left: 20
	}; // padding cho node
	const GROUP_PADDING = 5; // padding tối thiểu với group

	const getNodeBoundsWithPadding = (node) => {
		const bounds = node.getBoundingBox();
		return {
			left: bounds.getLeft() - NODE_PADDING.left,
			right: bounds.getRight() + NODE_PADDING.right,
			top: bounds.getTop() - NODE_PADDING.top,
			bottom: bounds.getBottom() + NODE_PADDING.bottom
		};
	};

	const adjustNodesPosition = (nodes: any[], groupBounds: any) => {
		const safeGroupBounds = {
			left: groupBounds.left + GROUP_PADDING,
			right: groupBounds.right - GROUP_PADDING,
			top: groupBounds.top + GROUP_PADDING,
			bottom: groupBounds.bottom - GROUP_PADDING
		};

		nodes.forEach((node) => {
			const nodeBoundsWithPadding = getNodeBoundsWithPadding(node);
			let newX = node.getPosition().x;
			let newY = node.getPosition().y;

			// Điều chỉnh vị trí dựa trên bounds đã có padding
			if (nodeBoundsWithPadding.left < safeGroupBounds.left) {
				newX += safeGroupBounds.left - nodeBoundsWithPadding.left;
			}
			if (nodeBoundsWithPadding.right > safeGroupBounds.right) {
				newX -= nodeBoundsWithPadding.right - safeGroupBounds.right;
			}
			if (nodeBoundsWithPadding.top < safeGroupBounds.top) {
				newY += safeGroupBounds.top - nodeBoundsWithPadding.top;
			}
			if (nodeBoundsWithPadding.bottom > safeGroupBounds.bottom) {
				newY -= nodeBoundsWithPadding.bottom - safeGroupBounds.bottom;
			}

			// Kiểm tra lại sau khi tính toán vị trí mới
			const newBounds = Rectangle.fromPointAndSize(new Point(newX, newY), node.width, node.height);

			// Đảm bảo node mới hoàn toàn nằm trong group
			if (
				newBounds.getLeft() >= safeGroupBounds.left &&
				newBounds.getRight() <= safeGroupBounds.right &&
				newBounds.getTop() >= safeGroupBounds.top &&
				newBounds.getBottom() <= safeGroupBounds.bottom
			) {
				node.setPosition(newX, newY);
			} else {
				// Nếu vẫn không thỏa mãn, ép node vào vị trí an toàn nhất có thể
				const centerX = (safeGroupBounds.left + safeGroupBounds.right) / 2;
				const centerY = (safeGroupBounds.top + safeGroupBounds.bottom) / 2;
				node.setPosition(centerX, centerY);
			}
		});
	};

	const handleResize = (direction: string) => (event: React.MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();

		let isResizing = true;

		const startX = event.clientX;
		const startY = event.clientY;
		const startWidth = group.getSize().width;
		const startHeight = group.getSize().height;
		const startPos = group.getPosition();
		const nodes = Object.values(group.getNodes());
		const { minWidth, minHeight } = calculateMinGroupSize(nodes);

		const handleMouseMove = (moveEvent: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			let newWidth = startWidth;
			let newHeight = startHeight;
			let newX = startPos.x;
			let newY = startPos.y;

			// Xử lý resize theo hướng
			switch (direction) {
				// Xử lý cho các góc
				case 'se':
					newWidth = Math.max(minWidth, startWidth + deltaX);
					newHeight = Math.max(minHeight, startHeight + deltaY);
					break;
				case 'sw':
					newWidth = Math.max(minWidth, startWidth - deltaX);
					newHeight = Math.max(minHeight, startHeight + deltaY);
					newX = startPos.x + deltaX / 2;
					break;
				case 'ne':
					newWidth = Math.max(minWidth, startWidth + deltaX);
					newHeight = Math.max(minHeight, startHeight - deltaY);
					newY = startPos.y + deltaY / 2;
					break;
				case 'nw':
					newWidth = Math.max(minWidth, startWidth - deltaX);
					newHeight = Math.max(minHeight, startHeight - deltaY);
					newX = startPos.x + deltaX / 2;
					newY = startPos.y + deltaY / 2;
					break;

				// Xử lý cho các điểm giữa cạnh
				case 'n':
					newHeight = Math.max(minHeight, startHeight - deltaY * 2);
					newY = startPos.y - (newHeight - startHeight) / 2;
					break;
				case 's':
					newHeight = Math.max(minHeight, startHeight + deltaY * 2);
					newY = startPos.y + (newHeight - startHeight) / 2;
					break;
				case 'e':
					newWidth = Math.max(minWidth, startWidth + deltaX * 2);
					newX = startPos.x + (newWidth - startWidth) / 2;
					break;
				case 'w':
					newWidth = Math.max(minWidth, startWidth - deltaX * 2);
					newX = startPos.x - (newWidth - startWidth) / 2;
					break;
			}

			// Kiểm tra và áp dụng thay đổi
			const proposedGroupBounds = {
				left: newX - newWidth / 2,
				right: newX + newWidth / 2,
				top: newY - newHeight / 2,
				bottom: newY + newHeight / 2
			};

			let canResize = true;
			nodes.forEach((node) => {
				const nodeBounds = node.getBoundingBox();
				const nodeWidth = nodeBounds.getRight() - nodeBounds.getLeft();
				const nodeHeight = nodeBounds.getBottom() - nodeBounds.getTop();

				if (nodeWidth + PADDING * 2 > newWidth || nodeHeight + PADDING * 2 > newHeight) {
					canResize = false;
				}
			});

			if (canResize) {
				group.setSize({ width: newWidth, height: newHeight });
				group.setPosition(newX, newY);
				adjustNodesPosition(nodes, proposedGroupBounds);
			}
		};

		const handleMouseUp = () => {
			isResizing = false;

			const finalGroupBounds = {
				left: group.getPosition().x - group.getSize().width / 2,
				right: group.getPosition().x + group.getSize().width / 2,
				top: group.getPosition().y - group.getSize().height / 2,
				bottom: group.getPosition().y + group.getSize().height / 2
			};
			adjustNodesPosition(nodes, finalGroupBounds);

			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const padding = 10;
	const headerHeight = 25;
	const outerWidth = width + padding * 2;
	const outerHeight = height + padding * 2 + headerHeight;

	const rectX = padding;
	const rectY = padding + headerHeight;
	const rectWidth = width;
	const rectHeight = height;

	// Constants và styles
	const RESIZE_HANDLE_SIZE = 10;
	const RESIZE_HANDLE_HITBOX = 20;

	const resizeHandleStyle: React.CSSProperties = {
		cursor: 'pointer',
		pointerEvents: 'all' as const,
		strokeWidth: 2,
		stroke: '#FFA500',
		fill: '#FFA500'
	};

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
				{renderGroupName()}
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
				// data-groupid={group.getID()}
				rx={5}
				ry={5}
				style={{ pointerEvents: 'all' }}
			/>
			{group.isSelected() && (
				<>
					<rect
						x={rectX - 2}
						y={rectY - 2}
						data-groupid={group.getID()}
						width={rectWidth + 4}
						height={rectHeight + 4}
						fill="none"
						stroke="#FFA500"
						strokeWidth={2}
						style={{ pointerEvents: 'all' }}
					/>
					<circle
						cx={rectX}
						cy={rectY}
						r={RESIZE_HANDLE_SIZE / 2}
						onMouseDown={handleResize('nw')}
						style={{ ...resizeHandleStyle, cursor: 'nwse-resize' as const }}
					/>
					<circle
						cx={rectX + rectWidth}
						cy={rectY}
						r={RESIZE_HANDLE_SIZE / 2}
						onMouseDown={handleResize('ne')}
						style={{ ...resizeHandleStyle, cursor: 'nesw-resize' as const }}
					/>
					<circle
						cx={rectX}
						cy={rectY + rectHeight}
						r={RESIZE_HANDLE_SIZE / 2}
						onMouseDown={handleResize('sw')}
						style={{ ...resizeHandleStyle, cursor: 'nesw-resize' as const }}
					/>
					<circle
						cx={rectX + rectWidth}
						cy={rectY + rectHeight}
						r={RESIZE_HANDLE_SIZE / 2}
						onMouseDown={handleResize('se')}
						style={{ ...resizeHandleStyle, cursor: 'nwse-resize' as const }}
					/>
					<rect
						x={rectX + rectWidth / 2 - RESIZE_HANDLE_SIZE / 2}
						y={rectY - RESIZE_HANDLE_SIZE / 2}
						width={RESIZE_HANDLE_SIZE}
						height={RESIZE_HANDLE_SIZE}
						onMouseDown={handleResize('n')}
						style={{ ...resizeHandleStyle, cursor: 'ns-resize' as const }}
					/>
					<rect
						x={rectX + rectWidth - RESIZE_HANDLE_SIZE / 2}
						y={rectY + rectHeight / 2 - RESIZE_HANDLE_SIZE / 2}
						width={RESIZE_HANDLE_SIZE}
						height={RESIZE_HANDLE_SIZE}
						onMouseDown={handleResize('e')}
						style={{ ...resizeHandleStyle, cursor: 'ew-resize' as const }}
					/>
					<rect
						x={rectX + rectWidth / 2 - RESIZE_HANDLE_SIZE / 2}
						y={rectY + rectHeight - RESIZE_HANDLE_SIZE / 2}
						width={RESIZE_HANDLE_SIZE}
						height={RESIZE_HANDLE_SIZE}
						onMouseDown={handleResize('s')}
						style={{ ...resizeHandleStyle, cursor: 'ns-resize' as const }}
					/>
					<rect
						x={rectX - RESIZE_HANDLE_SIZE / 2}
						y={rectY + rectHeight / 2 - RESIZE_HANDLE_SIZE / 2}
						width={RESIZE_HANDLE_SIZE}
						height={RESIZE_HANDLE_SIZE}
						onMouseDown={handleResize('w')}
						style={{ ...resizeHandleStyle, cursor: 'ew-resize' as const }}
					/>
					<rect
						x={rectX + rectWidth / 2 - RESIZE_HANDLE_HITBOX / 2}
						y={rectY - RESIZE_HANDLE_HITBOX / 2}
						width={RESIZE_HANDLE_HITBOX}
						height={RESIZE_HANDLE_HITBOX}
						fill="transparent"
						onMouseDown={handleResize('n')}
						style={{ cursor: 'ns-resize', pointerEvents: 'all' as const }}
					/>
					<rect
						x={rectX + rectWidth - RESIZE_HANDLE_HITBOX / 2}
						y={rectY + rectHeight / 2 - RESIZE_HANDLE_HITBOX / 2}
						width={RESIZE_HANDLE_HITBOX}
						height={RESIZE_HANDLE_HITBOX}
						fill="transparent"
						onMouseDown={handleResize('e')}
						style={{ cursor: 'ew-resize', pointerEvents: 'all' as const }}
					/>
					<rect
						x={rectX + rectWidth / 2 - RESIZE_HANDLE_HITBOX / 2}
						y={rectY + rectHeight - RESIZE_HANDLE_HITBOX / 2}
						width={RESIZE_HANDLE_HITBOX}
						height={RESIZE_HANDLE_HITBOX}
						fill="transparent"
						onMouseDown={handleResize('s')}
						style={{ cursor: 'ns-resize', pointerEvents: 'all' as const }}
					/>
					<rect
						x={rectX - RESIZE_HANDLE_HITBOX / 2}
						y={rectY + rectHeight / 2 - RESIZE_HANDLE_HITBOX / 2}
						width={RESIZE_HANDLE_HITBOX}
						height={RESIZE_HANDLE_HITBOX}
						fill="transparent"
						onMouseDown={handleResize('w')}
						style={{ cursor: 'ew-resize', pointerEvents: 'all' as const }}
					/>
				</>
			)}
		</svg>
	);
};

export { DefaultGroupWidget };
