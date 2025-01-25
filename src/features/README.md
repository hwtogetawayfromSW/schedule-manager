# Features Directory

This directory contains all the feature modules of the application. Each feature is organized in its own directory with the following structure:

```
features/
├── schedule/           # 班表管理功能
│   ├── components/    # React components
│   ├── services/     # Business logic and API calls
│   ├── store/        # State management
│   └── utils/        # Helper functions
├── staff/             # 人員管理功能
│   ├── components/
│   ├── services/
│   ├── store/
│   └── utils/
└── settings/          # 系統設定功能
    ├── components/
    ├── services/
    ├── store/
    └── utils/
```

Each feature module should:
1. Be self-contained
2. Have clear boundaries
3. Follow the principle of high cohesion and low coupling
4. Have its own state management
5. Export only what is necessary through a public API
