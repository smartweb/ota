# 乐享出行 · 老年人 OTA 移动 H5

面向 **60 岁以上老年人** 的机票 / 酒店预订 H5 应用，基于 **龙虾出行开放平台** 接口，部署到 **Vercel**，支付直接跳转龙虾**托管收银台**（已内置微信 / 支付宝 H5 支付）。

## 功能

- ✈️ **机票**：城市联想 → 航班列表 → 填乘机人 → 下单 → 收银台支付
- 🏨 **酒店**：目的地搜索 → 酒店列表 → 选房型 → 填入住人 → 下单 → 收银台支付
- 📋 **我的订单**：输入手机号查询机票 + 酒店订单，查看详情与出票 / 确认状态
- 💳 **支付**：统一跳转龙虾托管收银台 `checkout_url`，无需自行对接微信 / 支付宝 SDK

## 老年人友好设计

- 基础字号 18px，金额 / 时间超大显示（28–40px）
- 主操作按钮全宽、最小高度 56px，底部固定
- 高对比度配色（暖橙红主色 `#d9432b`）
- 每页只做一件事，默认值合理（明天出发、1 位成人、1 间房）减少输入
- 城市联想搜索，不要求老人手输三字码
- 全程口语化中文，技术术语转译（如"出票"→"出机票"）

## 技术栈

- **Next.js 14**（Pages Router）+ JavaScript —— 前后端一体
- **BFF**：Next.js API Routes（`/api/*`）转发龙虾接口，**Token 只在服务端**
- **Tailwind CSS** + 全局老年人定制样式
- 无数据库、无用户系统（按联系人手机号聚合订单）

## 本地开发

```bash
npm install
npm run dev    # http://localhost:3000
```

环境变量见 `.env.local`：

```
LONGXIA_TOKEN=rdak_live_xxx          # 龙虾开放平台 Token（服务端用，勿泄露）
LONGXIA_HOST=https://api.longxiachuxing.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # 改成线上域名，用于支付返回页
```

## 部署到 Vercel

```bash
npm i -g vercel
vercel            # 首次部署（preview）
vercel --prod     # 生产部署
```

在 Vercel 项目 **Settings → Environment Variables** 中配置：

| 变量 | 值 |
|---|---|
| `LONGXIA_TOKEN` | `rdak_live_...` |
| `LONGXIA_HOST` | `https://api.longxiachuxing.com` |
| `NEXT_PUBLIC_BASE_URL` | `https://<你的域名>.vercel.app` |

## ⚠️ 重要：IP 白名单

龙虾出行开放平台要求**来源 IP 必须命中应用白名单**，未登记的 IP 会被拒绝（返回 403）。

- 本地开发：用你本机出口 IP，已在白名单内时可正常调用。
- Vercel 部署：Vercel Serverless 的出口 IP 不固定，**必须在龙虾后台登记或申请放开**，否则线上接口会 403。
- 若需固定出口 IP：可在中间加一层固定 IP 的代理（代码里 `LONGXIA_HOST` 已做成环境变量，便于切换）。

## 业务流程

### 机票
```
搜索 → (必要时验价换 offer_id) → 创建订单(user_pay) → 跳转 checkout_url → 支付返回页 → 查订单
```
- 搜索返回舱位带 `search_offer_id`，若 `pricing_required=false` 则可直接用 `offer_id` 下单；否则先验价。

### 酒店
```
搜索 → 房型详情(换产品级 offer_id) → 创建订单(user_pay) → 跳转 checkout_url → 支付返回页 → 查订单
```
- 两步式下单：`search_offer_id` 只能查房型，必须用 `/hotel/rooms` 拿到的产品级 `offer_id` 下单。

### 支付
- 创建订单时固定 `pay_mode=user_pay`，返回 `checkout_url`（托管收银台）。
- 前端直接 `window.location.href = checkout_url`，由收银台完成微信 / 支付宝 H5 支付。
- 支付完成跳回 `NEXT_PUBLIC_BASE_URL/pay/return`。

## 项目结构

```
pages/
  index.js                 首页（三入口）
  flight/                  机票：index 搜索 / list 列表 / book 下单
  hotel/                   酒店：index 搜索 / list 列表 / rooms 房型 / book 下单
  orders/                  订单：index 列表 / [type]/[no] 详情
  pay/return.js            支付返回页
  api/                     BFF 路由，转发龙虾接口
components/                UI 组件（NavBar / AirportPicker / Loading / Empty / Toast）
lib/
  longxia.js               龙虾请求封装（Token 在此使用）
  handler.js               API Route 统一错误处理
  ui.js                    前端工具（金额 / 日期 / 状态映射 / fetch）
styles/globals.css         老年人定制全局样式
```

## 接口对照（BFF → 龙虾）

| BFF | 龙虾接口 |
|---|---|
| `POST /api/airport/search` | `GET /open/v1/flight/airport/search` |
| `POST /api/flight/search` | `POST /open/v1/flight/search` |
| `POST /api/flight/pricing` | `POST /open/v1/flight/pricing` |
| `POST /api/flight/order/create` | `POST /open/v1/flight/order/create` |
| `POST /api/flight/order/list` | `POST /open/v1/flight/order/list` |
| `POST /api/flight/order/detail` | `POST /open/v1/flight/order/detail` |
| `POST /api/hotel/search` | `POST /open/v1/hotel/search` |
| `POST /api/hotel/rooms` | `POST /open/v1/hotel/rooms` |
| `POST /api/hotel/order/create` | `POST /open/v1/hotel/order/create` |
| `POST /api/hotel/order/list` | `POST /open/v1/hotel/order/list` |
| `POST /api/hotel/order/detail` | `POST /open/v1/hotel/order/detail` |

## 注意事项

- `rdak_live_` 为生产 Token，**下单会产生真实订单**。联调搜索 / 列表安全，下单 / 支付请确认后再实测。
- 第一版**不含退改签操作**，订单详情仅展示退改规则文案。
- Token 等同于密码，仅在服务端使用，绝不进入前端 bundle。

---

本服务出行能力由 **龙虾出行开放平台** 提供。
