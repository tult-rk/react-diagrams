---
'@fjdr/react-diagrams-defaults': major
'@fjdr/react-diagrams-core': major
'@fjdr/react-diagrams': major
'@fjdr/react-canvas-core': minor
'@fjdr/react-diagrams-gallery': minor
'@fjdr/geometry': minor
---

### Major Changes

- **@fjdr/react-diagrams-defaults**

  - Thêm tính năng Group cho diagram:
    - Thêm `DefaultGroupModel`, `DefaultGroupWidget`, `DefaultGroupFactory` để hỗ trợ nhóm các node
    - Cập nhật `DefaultNodeModel` với các thuộc tính và phương thức mới để hỗ trợ group
    - Thay đổi giao diện `DefaultNodeWidget` và `DefaultPortLabelWidget`
  - Breaking: Thay đổi cấu trúc CSS và layout của node widget

- **@fjdr/react-diagrams-core**

  - Thêm các entity mới cho Group:
    - `GroupModel`, `GroupWidget`
    - `GroupLayerModel`, `GroupLayerWidget`, `GroupLayerFactory`
  - Breaking: Cập nhật `DiagramEngine`, `DiagramModel` để hỗ trợ group
  - Breaking: Thay đổi cấu trúc layer rendering

- **@fjdr/react-diagrams**
  - Breaking: Cập nhật engine initialization để hỗ trợ group layer và group factory

### Minor Changes

- **@fjdr/react-canvas-core**

  - Cập nhật `CanvasWidget` để hỗ trợ layer ordering
  - Cải thiện `MoveItemsState` và `SelectingState` để làm việc với group

- **@fjdr/react-diagrams-gallery**

  - Thêm demo cho tính năng group trong demo drag-and-drop
  - Cập nhật UI của PropertiesTray để hiển thị thông tin group

- **@fjdr/geometry**
  - Thêm các helper method cho Rectangle: `getLeft()`, `getRight()`, `getTop()`, `getBottom()`

### Migration Guide

1. Cập nhật engine initialization:

import { GroupLayerFactory } from '@fjdr/react-diagrams-core'
import { DefaultGroupFactory } from '@fjdr/react-diagrams-defaults'
engine.getLayerFactories().registerFactory(new GroupLayerFactory())
engine.getGroupFactories().registerFactory(new DefaultGroupFactory())

2. Cập nhật CSS cho node widget

3. Kiểm tra lại code nếu bạn đã extend `DiagramModel` hoặc `DiagramEngine
