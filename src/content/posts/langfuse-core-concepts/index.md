---
title: "Langfuse 核心概念：评测流程与数据模型"
published: 2026-10-09
description: "梳理 Langfuse 的离线与在线评测，以及 Dataset、Experiment、Evaluator、Score 和 Trace 等核心概念。"
image: ''
tags: [Langfuse, Agent Evaluation, LLM]
category: Agent Evaluation
draft: false
lang: zh_CN
---

本文是学习 [Langfuse 官方核心概念文档](https://langfuse.com/docs/evaluation/core-concepts)时整理的笔记，主要记录评测流程、数据模型与评测方法。

## 评测流程（Evaluation Loop）

### 离线评测（Offline Evaluation）

离线评测包括 Experiment 和 Batch Evaluation，两者的输入与执行方式不同。

| 方式 | 数据来源 | 是否重新执行 Agent | 用途或特点 |
| --- | --- | --- | --- |
| Experiment | 固定 Dataset | 是，重新执行被测 Task 或 Agent | 比较版本、发现回归 |
| Batch Evaluation | 线上历史 Trace | 否 | 基于已有执行记录进行评测 |

### 在线评测（Online Evaluation）

在线评测针对生产环境中的真实 Trace，通过规则和抽样进行评测，用于监控质量、发现新问题。

## 数据模型

### Dataset 与 Dataset Item

- **Dataset（评测数据集）**：测试用例的集合。
- **Dataset Item（评测用例）**：数据集中的一条测试用例。

### Task

Task 是在 Experiment 中执行被测 LLM 应用或 Agent，并产生实际输出的执行函数，对应离线评测场景。

### Experiment 与 Experiment Run

Experiment 表示针对某个 Agent 版本的一组测试过程。

Experiment Run 表示某个被测应用版本在指定 Dataset 上的一次实验执行，产生每条样本的输出以及可选评分。

- Experiment Run 对应 Dataset Run。
- 单条执行结果对应 DatasetRunItem。

### Evaluator 与 Score

- **Evaluator**：负责评判的逻辑。
- **Score**：评判完成后产生的数据。

### Session、Trace 与 Observation

Session 包含多个 Trace，每个 Trace 包含多个 Observation。

| 概念 | 含义 |
| --- | --- |
| Session | 一段多轮交互中的多个 Trace |
| Trace | 一次完整的 Agent 请求或执行 |
| Observation | 一次模型调用、工具调用或检索操作 |

### Rule

Rule 是在线评测规则，通过过滤条件与采样率匹配新上报的 Observation，并触发关联的 Evaluator。

## 评测方法（Evaluation Methods）

- **LLM-as-a-judge**：由大模型进行评判。
- **Code Evaluator**：由代码进行评判。
- **Human Annotation**：由人工或专家进行标注和评判。

## 参考资料

- [Langfuse：Evaluation Core Concepts](https://langfuse.com/docs/evaluation/core-concepts)
