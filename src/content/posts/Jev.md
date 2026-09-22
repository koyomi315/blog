---
title: Jev
published: 2026-09-21
description: 了解面向路由、评分和门禁等场景的类型化概率决策模型 Jev。
image: ''
tags: [AI Agent, Model Routing, Decision Model]
category: AI Agent
draft: false
lang: zh_CN
---

# Jev简单学习

## 是什么？

现在 GPT、Claude 已经能做 structured output，也能走 tool calling，为什么还要单独搞一个 Jev？
Agent 里很多模型调用不是为了生成答案，而是为了替代码做一次判断。

Jev 是 TypeSafe AI 发布的 System One Model。
它和我们熟悉的聊天模型不太一样：聊天模型擅长生成文本，Jev 则刻意放弃文本生成，只返回类型化的概率决策。

**三种原语**（列举了Jev的适用场景 输入输出）

| 原语 | 中文理解 | 输出形态 | 适合场景 |
| --- | --- | --- | --- |
| Choice | 单选题 | 选项、概率与 confidence | 工具路由等 |
| Score | 打分题 | 连续分数、概率分布与 confidence | 风险或质量评分 |
| Noul | 判断题 | 0 到 1 的概率 | 是否保留、是否危险等判断 |

**四层架构**

| 层次 | 职责 | 典型组件 |
| --- | --- | --- |
| 慢思考层 | 规划、解释、生成、复杂推理 | GPT / Claude / Gemini |
| 快判断层 | 路由、筛选、评分、门禁 | Jev / Jev-like 模型 |
| 确定性层 | 权限、状态、副作用、回滚 | 普通代码 |
| 兜底层 | 高风险或低置信度处理 | 人工 / 更强模型 |

System 1：快、直觉、低成本、自动判断
System 2：慢、需要推理、成本高、适合复杂问题

## 理解

- 能力
  - 不能进行文本生成，只能进行有限状态的决策
  - 做决策的话，需要你提前定好决策空间，于此同时对于复杂推导的决策问题做不太好
  - 对于决策输出不同选择的置信度
  - 其成本低于一般的大模型，其速度也要快于一般的大模型
- 应用
  - 基于以上的Jev的特点导致其比较适合特定的任务场景 或者 原来Agent编排或任务编排的某些节点
  - 适合替代 Agent / Workflow 中那些原本需要调用通用 LLM 完成简单判断的节点

**Jev 更像一个 intelligence primitive / decision primitive，而不是完整 Agent。** 它可以嵌进 Harness / Workflow 的很多控制节点里，而真正负责复杂 reasoning、planning、generation 的仍然是通用模型。

## 总结

Jev 是 TypeSafe 提出的 System One 决策模型，不生成自由文本，而是输出 Choice、Score、概率等结构化决策。
它牺牲开放式生成和复杂推理能力，换来低延迟、低成本、类型安全以及可利用的置信度。
因此它特别适合 Agent 中的 Routing、Tool Selection、Judge、Guardrail、Rerank、分类和实时决策等高频任务。
它不是为了替代 GPT/Claude，而更适合与通用 LLM 组成 System 1 + System 2 的分层架构。

## 参考资料

[一万字Jev 工程实践长文：把 Agent 的“判断题”从大模型里拆出来](https://mp.weixin.qq.com/s/D1La4jMoVZ5Ip_RrVY1kPw)
