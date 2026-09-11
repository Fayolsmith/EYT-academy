# Supabase Expo 移动模板

你好，我叫 Adam (Razikus) - 我正在学习中文，但这个 README 已被翻译。如果你发现错误 - 请报告！

一个生产就绪的移动 SaaS 模板，使用 React Native、Expo 和 Supabase 构建。此模板提供了一个完整的移动应用程序，具有身份验证、文件管理、任务管理和国际化支持。


## Video
[![观看视频](https://img.youtube.com/vi/qcASa0Ywsy4/maxresdefault.jpg)](https://youtube.com/shorts/qcASa0Ywsy4?feature=share)



## 平台支持

- **iOS** - 完整原生支持
- **Android** - 完整原生支持
- **共享后端** - 由 Supabase 驱动

## 功能特性

### 身份验证
- 邮箱/密码身份验证
- 多因素身份验证（MFA/2FA）与 TOTP
- 用于身份验证器应用的二维码注册
- 通过邮件重置密码
- 邮箱验证
- 密码重置的深度链接处理
- 持久会话

### 用户管理
- 用户配置文件显示
- 密码更改功能
- MFA 设备管理
- 多 MFA 设备支持
- 用户设置和偏好

### 文件管理（2FA 保护）
- 使用文档选择器安全上传文件
- 拖放支持
- 具有时间限制 URL 的文件共享
- 文件下载
- 带确认的文件删除
- 进度指示器
- 最大文件大小：50MB

### 任务管理（2FA 保护）
- 创建、读取、更新、删除任务
- 任务过滤（全部/活动/已完成）
- 标记任务为紧急
- 标记任务为完成
- 任务描述
- 实时更新
- 行级安全性

### 国际化（i18n）
- **支持的语言：**
 - 英语（en）
 - 波兰语（pl）
 - 简体中文（zh）
- 自动设备语言检测
- 应用内语言切换
- 持久语言偏好
- 登录/注册屏幕上的语言选择器
- 所有屏幕完全翻译

### UI/UX
- 带图标的选项卡式导航
- 所有设备的安全区域支持
- 加载状态和旋转器
- 带警报的错误处理
- 成功通知
- 原生模态对话框
- 主题色彩方案
- 响应式布局

## 技术栈

### 核心
- **React Native** 0.81.4
- **Expo SDK** 54
- **React** 19.1.0

### 导航和路由
- **Expo Router** 6.0.8（基于文件的路由）
- **React Navigation**（底部选项卡）

### 后端
- **Supabase**（身份验证、数据库、存储）
- **@supabase/supabase-js** 2.58.0

### UI 组件
- **Lucide React Native**（图标）
- **React Native QRCode SVG**（MFA 二维码）
- **React Native Safe Area Context**

### 国际化
- **i18next** 25.5.2
- **react-i18next** 16.0.0
- **expo-localization** 17.0.7

### 文件和存储
- **Expo Document Picker** 14.0.7
- **Expo Clipboard** 8.0.7
- **Expo Sharing** 14.0.7
- **Expo Web Browser** 15.0.7

### 状态管理
- React hooks（useState、useEffect、useContext）
- 用于持久存储的 AsyncStorage

## 开始使用

### 前提条件

- Node.js 18+
- Yarn 或 npm
- Expo CLI
- iOS 模拟器（Mac）或 Android 模拟器
- Supabase 项目

### 1. 后端设置

首先，按照主仓库 README 设置你的 Supabase 后端。你需要：
- Supabase 项目 URL
- Supabase Anon 密钥
- 已应用迁移
- 已配置存储桶
- 已启用 RLS 策略

### 2. 安装依赖

```bash
cd supabase-expo-template
yarn install
```

### 3. 配置环境

在根目录创建一个 `.env` 文件：

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 配置应用设置

编辑 `app.json`：

```json
{
 "expo": {
 "name": "你的应用名称",
 "slug": "your-app-slug",
 "scheme": "yourappscheme",
 "ios": {
 "bundleIdentifier": "com.yourcompany.yourapp"
 },
 "android": {
 "package": "com.yourcompany.yourapp"
 }
 }
}
```

**重要：** `scheme` 值用于深度链接（密码重置）。将其更新为与你的应用匹配。

### 5. 配置 Supabase 重定向 URL

在你的 Supabase 仪表板中，添加这些重定向 URL：
- `yourappscheme://reset-password`（替换为你的实际 scheme）

或更新 `supabase/config.toml`：

```toml
[auth]
additional_redirect_urls = ["yourappscheme://reset-password"]
```

### 6. 运行应用

```bash
# 启动开发服务器
npx expo start

# 在 iOS 模拟器上运行
npx expo run:ios

# 在 Android 模拟器上运行
npx expo run:android

# 或使用 Expo Go 应用扫描二维码
```

## 项目结构

```
supabase-expo-template/
├── app/ # 应用屏幕（Expo Router）
│ ├── (app)/ # 已认证的应用屏幕
│ │ ├── _layout.tsx # 选项卡导航
│ │ ├── index.tsx # 主屏幕
│ │ ├── settings.tsx # 设置屏幕
│ │ ├── storage.tsx # 文件管理
│ │ └── tasks.tsx # 任务管理
│ ├── (auth)/ # 身份验证屏幕
│ │ ├── _layout.tsx # 认证堆栈布局
│ │ ├── login.tsx # 登录屏幕
│ │ ├── register.tsx # 注册屏幕
│ │ ├── forgot-password.tsx # 密码重置请求
│ │ ├── reset-password.tsx # 密码重置表单
│ │ ├── two-factor.tsx # 2FA 验证
│ │ └── verify-email.tsx # 邮箱验证
│ ├── _layout.tsx # 根布局
│ └── index.tsx # 初始路由
├── components/ # 可重用组件
│ ├── MFASetup.tsx # MFA 注册组件
│ └── ui/ # UI 组件
│ ├── alert.tsx
│ ├── button.tsx
│ ├── card.tsx
│ └── input.tsx
├── constants/
│ └── theme.ts # 主题颜色
├── hooks/ # 自定义 hooks
│ └── use-color-scheme.ts
├── lib/ # 工具类
│ ├── i18n.ts # i18n 配置
│ ├── storage.ts # AsyncStorage 包装器
│ ├── supabase.ts # Supabase 客户端
│ └── types.ts # TypeScript 类型
├── locales/ # 翻译文件
│ ├── en.json # 英语
│ ├── pl.json # 波兰语
│ └── zh.json # 中文
├── app.json # Expo 配置
├── package.json
└── tsconfig.json
```

## 身份验证流程

### 登录流程
1. 用户输入邮箱和密码
2. 应用检查 MFA 要求
3. 如果启用了 MFA -> 重定向到 2FA 屏幕
4. 如果没有 MFA -> 重定向到应用

### 注册流程
1. 用户输入邮箱和密码
2. 用户接受服务条款和隐私政策（必需）
3. 创建账户
4. 发送邮箱验证
5. 用户重定向到验证邮箱屏幕

### 密码重置流程
1. 用户请求密码重置
2. 发送包含重置链接的邮件，其中包含令牌
3. 用户点击链接：`yourappscheme://reset-password#access_token=...&refresh_token=...`
4. 应用在 `app/_layout.tsx` 中拦截深度链接
5. 从哈希片段提取令牌
6. 通过 `supabase.auth.setSession()` 建立会话
7. 用户重定向到重置密码屏幕
8. 设置新密码
9. 重定向到应用

### MFA 注册流程
1. 用户导航到设置 -> MFA
2. 用户提供设备名称
3. 显示二维码
4. 用户使用身份验证器应用扫描（Google Authenticator、Authy 等）
5. 用户输入 6 位数字代码
6. 验证并注册因子
7. 可以注册多个设备

## 国际化

### 添加新语言

1. **创建翻译文件：**
```bash
# 在 locales/ 中创建新文件
touch locales/es.json
```

2. **添加翻译：**
```json
{
 "auth": {
 "login": "Iniciar sesión",
 "register": "Registrarse",
 ...
 },
 ...
}
```

3. **在 `lib/i18n.ts` 中导入：**
```typescript
import es from '../locales/es.json'

i18n.use(initReactI18next).init({
 resources: {
 en: { translation: en },
 pl: { translation: pl },
 zh: { translation: zh },
 es: { translation: es }, // 在这里添加
 },
 ...
})
```

4. **在语言选择器 UI 中添加** 在 `app/(auth)/login.tsx` 和 `app/(auth)/register.tsx` 中

### 翻译键结构

```typescript
{
 "auth": { /* 身份验证屏幕 */ },
 "home": { /* 主屏幕 */ },
 "app": { /* 应用导航 */ },
 "storage": { /* 文件管理 */ },
 "tasks": { /* 任务管理 */ },
 "mfa": { /* MFA 屏幕 */ },
 "settings": { /* 设置屏幕 */ }
}
```

## 构建生产版本

### iOS

```bash
# 配置 EAS
eas build:configure

# 为 iOS 构建
eas build --platform ios --profile production

# 提交到 App Store
eas submit --platform ios
```

### Android

```bash
# 为 Android 构建
eas build --platform android --profile production

# 提交到 Google Play
eas submit --platform android
```

### 构建配置文件

编辑 `eas.json` 以配置构建配置文件：

```json
{
 "build": {
 "development": {
 "developmentClient": true,
 "distribution": "internal"
 },
 "preview": {
 "distribution": "internal"
 },
 "production": {}
 }
}
```

详情请参阅 [Expo EAS Build 文档](https://docs.expo.dev/build/introduction/)。

## 自定义

### 颜色和主题

编辑 `constants/theme.ts`：

```typescript
export const Colors = {
 light: {
 text: '#11181C',
 background: '#fff',
 tint: '#0a7ea4', // 主色
 icon: '#687076',
 },
 dark: {
 text: '#ECEDEE',
 background: '#151718',
 tint: '#fff',
 icon: '#9BA1A6',
 },
};
```

### 应用名称和品牌

1. 更新 `app.json`：
```json
{
 "expo": {
 "name": "你的应用名称",
 "icon": "./assets/images/icon.png",
 "splash": {
 "image": "./assets/images/splash-icon.png"
 }
 }
}
```

2. 替换 `assets/images/` 中的图标文件

### 导航

编辑 `app/(app)/_layout.tsx` 以自定义选项卡：

```typescript
<Tabs.Screen
 name="your-screen"
 options={{
 title: t('app.yourScreen'),
 tabBarIcon: ({ color, size }) => <YourIcon size={size} color={color} />,
 }}
/>
```

## 贡献

欢迎贡献！请：
- 遵循现有代码风格
- 为新功能添加测试
- 更新文档
- 在 iOS 和 Android 上测试

## 许可证

本项目根据 Apache 许可证授权 - 详见 LICENSE 文件。

## 支持

如果你觉得这个模板有帮助：
- 给它一个星标
- [给我买杯咖啡](https://buymeacoffee.com/razikus)