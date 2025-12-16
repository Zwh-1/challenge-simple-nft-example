## 改造目标
- 统一视觉风格为清爽的 DaisyUI 卡片风 + 微交互动效
- 强化信息层次：清晰的主标题、副文与分区标题
- 优化滚动与栅格体验，提升响应式与可访问性
- 保留现有数据与交互逻辑，仅做样式与交互增强

## 具体改造点
- 顶部 Hero
  - 在 `packages/nextjs/app/page.tsx:480` 的容器内、轮播之前加入主标题与副文：品牌标识、简短说明、两个行动按钮（“前往市场”“我的NFT”），与主题色一致。
- 轮播（横滑卡片）
  - `packages/nextjs/app/page.tsx:507` 轨道容器增加 `snap-x snap-mandatory` 与更明显的间距；卡片项 `packages/nextjs/app/page.tsx:510-516` 增加 `snap-start`、`hover:scale-[1.02]`、`hover:shadow-xl`、可聚焦 `focus-visible:ring`。
  - 左右箭头保留，增加键盘支持：在容器上监听左右方向键触发 `scrollCarousel`。
- 分类横条
  - `packages/nextjs/app/page.tsx:531-558` 将条带容器设为 `sticky top-0 bg-base-200/80 backdrop-blur`，为选中项增加底部指示条（`after:absolute after:bottom-0 after:h-[2px] after:bg-primary`）。
  - 横向滚动容器同样使用 `scroll-snap-type: x mandatory`，分类按钮 `snap-start`，并增加 `aria-current`。
- NFT 快捷入口卡片
  - `packages/nextjs/app/page.tsx:572-665` 统一卡片视觉：使用 DaisyUI `card` 语义结构（标题/描述区），图标容器统一尺寸与圆角；加入 `group-hover:translate-y-[1px]` 微动效；强调主次色对比。
- 推荐作品网格
  - `packages/nextjs/app/page.tsx:706-724` 卡片增加 `hover:scale-[1.01]`、`hover:shadow-xl`、边框由 `border-base-300` 改为透明并在 hover 状态显示 `ring-1 ring-primary/30`。
  - 保持 `AdaptiveImage`，为图片添加 `placeholder="blur"`（若已有 `blurDataURL` 可复用）。
- 关注页卡片
  - `packages/nextjs/app/page.tsx:737-835` 战队卡片加入轻微悬浮阴影与更紧凑的标签样式；为图标失败回退的缩写圆形添加高对比文本色。
- 积分表
  - `packages/nextjs/app/page.tsx:866-903` 表格容器加 `max-h-[60vh] overflow-auto` 与粘性表头（`thead` 使用 `sticky top-0 bg-base-100`）。
  - 空态与加载态使用骨架屏代替纯 Spinner，复用现有 `components/scaffold-eth/SkeletonLoader.tsx`。
- 查看弹窗（viewer）
  - `packages/nextjs/app/page.tsx:913-1057` 外层容器添加 `role="dialog" aria-modal="true"`，进入时将焦点置于关闭按钮；监听 `Esc` 关闭；在移动端增加下滑关闭手势阈值（保守触发）。
  - 微调动效时序，保证无卡顿；在超暗背景时使用浅色文字增强对比。
- 全局样式
  - `packages/nextjs/styles/globals.css` 增加 `.no-scrollbar` 通用样式：`::-webkit-scrollbar { display:none } scrollbar-width:none;`。
  - 统一阴影与圆角变量，确保卡片与弹窗一致性；若需要，新增少量关键帧用于滚动指示与按钮涟漪。

## 交互与无障碍
- 为所有可点击卡片与按钮补充 `aria-label` 与键盘焦点态；在分页/标签上使用 `role="tablist"` 与 `aria-selected`。
- 轮播与分类支持键盘左右键；弹窗支持 `Esc`；焦点陷阱确保读屏友好。

## 性能优化
- `next/image` 合理设置 `sizes` 与 `priority`；控制质量在 85–95；列表项禁用 `priority`。
- 减少不必要的重排：过渡仅在 `transform/opacity` 上；使用 `will-change` 控制（已存在）。

## 验证方案
- 本地在浅色/深色主题与移动/桌面断点下走查：轮播滚动、分类选中、快捷入口、推荐网格、关注列表、积分表、弹窗交互。
- 通过键盘操作与读屏测试基本可访问性；检查滚动条隐藏是否生效。

如果你确认，我将按上述计划更新 `page.tsx` 与少量 `globals.css`，保留现有逻辑并逐段提交修改。