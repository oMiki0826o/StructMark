# StructMark v1.6.0 驗證狀態（2026-10-11）

**尚未達到正式發布驗收標準。** 本專案為持續開發的原始碼快照，並非已完成所有項目的成品。

## 已確認

- Core、CLI、文件網站原始碼保留。
- LSP 新增工作區內 Definition 與 References 的來源解析邏輯，以及 symlink／工作區路徑邊界檢查。
- 兩個 ZIP 的 CRC 完整性檢查成功；SHA-256 另外產生。

## 尚未驗證或完成

- npm registry 在執行環境回傳 `EAI_AGAIN`，無法安裝 `vscode-languageserver` 與 `vscode-languageclient`。
- 因而未能通過真實 LSP TypeScript 建置、JSON-RPC 整合測試、VS Code Extension 啟動與 VSIX 打包。
- `packages/language-server/tsconfig.json` 的 `rootDir` 仍需配合跨套件 Core imports 調整，並完成可攜式產物佈署。
- 尚缺完整 LSP 協定回歸測試、Workspace 效能測試、Next.js 正式建置與跨平台 CI 驗證。
- 治理規範尚未逐條執行全部 Gate，不能宣稱全面符合。
- 目前環境沒有獨立子代理派遣能力，沒有完成要求的 Subagent-driven 逐項獨立審查。

壓縮檔可供接手開發，**不應當作已通過驗證的正式 v1.6.0 發布版**。
