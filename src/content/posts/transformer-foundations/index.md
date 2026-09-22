---
title: 从自注意力到 Transformer
published: 2024-09-12
updated: 2024-09-13
description: 从 Query、Key、Value 的计算出发，理解多头注意力、位置编码、残差连接、层归一化以及编码器和解码器。
image: ''
tags: [Transformer, Attention, LLM]
category: AI Agent
draft: false
lang: zh_CN
---

Transformer 最早在论文 [Attention Is All You Need](https://arxiv.org/abs/1706.03762) 中提出。它不依赖循环结构逐步处理序列，而是通过注意力机制直接建模序列中不同位置的关系。

## 自注意力在计算什么

输入序列中的每个 Token 首先被表示为向量。通过三个可学习矩阵，可以得到 Query、Key 和 Value：

$$
Q = XW_Q,\quad K = XW_K,\quad V = XW_V
$$

可以把它们理解为：

- Query：当前位置想寻找什么信息；
- Key：每个位置能够用什么特征被匹配；
- Value：匹配成功后实际汇总的内容。

缩放点积注意力的公式是：

$$
\operatorname{Attention}(Q,K,V)
= \operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

计算过程可以分成四步：

1. Query 与所有 Key 做点积，得到相关性分数；
2. 用 $\sqrt{d_k}$ 缩放，避免维度较大时点积过大；
3. 经过 Softmax 得到权重；
4. 用权重对 Value 加权求和。

因此，一个位置的输出不再只包含自身信息，而是序列中相关位置的加权组合。

## 为什么要使用多头注意力

单组 Query、Key、Value 只能在一个表示空间中计算关系。多头注意力让模型并行学习多组投影：

$$
\text{head}_i = \operatorname{Attention}(QW_i^Q, KW_i^K, VW_i^V)
$$

$$
\operatorname{MultiHead}(Q,K,V)
= \operatorname{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O
$$

不同注意力头不一定对应人类可命名的固定语法规则，但它们提供了多个子空间，使模型能够同时表达不同类型的关系。

## 位置编码解决顺序问题

如果只看注意力计算，交换输入 Token 的顺序会以相同方式交换输出，模型本身不知道哪个词在前、哪个词在后。因此需要加入位置信息。

原始 Transformer 使用正弦和余弦位置编码：

$$
PE_{(pos,2i)} = \sin\left(pos / 10000^{2i/d}\right)
$$

$$
PE_{(pos,2i+1)} = \cos\left(pos / 10000^{2i/d}\right)
$$

位置编码与 Token Embedding 相加，使表示同时包含内容和位置。后续模型也发展出可学习位置向量和旋转位置编码等方案，但目标相同：把顺序信息引入注意力计算。

## 前馈网络负责逐位置变换

注意力混合了不同位置的信息，随后每个位置还会经过相同的前馈网络：

$$
\operatorname{FFN}(x)=\sigma(xW_1+b_1)W_2+b_2
$$

它通常先把维度扩展，再经过非线性激活，最后投影回模型维度。注意力回答“从其他位置取什么”，前馈网络则进一步变换每个位置的表示。

## 残差连接与层归一化

Transformer 层会在注意力和前馈子层周围使用残差连接与归一化。残差连接让子层学习对输入的修正，而不是从头重建全部表示：

$$
y = x + \operatorname{Sublayer}(x)
$$

层归一化在单个样本的特征维度上进行归一化，适合变长序列。它与常见的 Batch Normalization 在归一化维度和对批量统计的依赖上不同。

不同 Transformer 架构可能采用 Pre-Norm 或 Post-Norm，不能把某一种排列当成所有模型的唯一实现。

## Encoder 与 Decoder 的区别

原始架构由编码器和解码器组成：

- Encoder 使用双向自注意力，编码整个输入序列；
- Decoder 使用带因果掩码的自注意力，避免生成当前位置时看到未来 Token；
- Decoder 还通过交叉注意力读取 Encoder 输出。

现代模型会根据任务选择结构：

- Encoder-only：适合理解和表示任务；
- Decoder-only：适合自回归生成，许多大语言模型采用这种形式；
- Encoder-decoder：适合翻译、摘要等输入到输出任务。

## Mask 为什么重要

Padding Mask 用于忽略补齐位置；Causal Mask 用于阻止模型访问未来 Token。后者保证训练阶段的并行计算不会破坏自回归目标。

如果掩码方向或广播维度写错，模型可能在训练时看到答案，导致离线指标很好而生成阶段失效。

## Transformer 与上下文表示

早期静态词向量为同一个词分配固定向量，难以表达一词多义。Transformer 会让每一层表示都结合当前上下文。同一个词处在不同句子中，会因为注意到的邻近内容不同而形成不同的隐藏状态。

多层堆叠后，模型逐步把局部关系、句法信息和更高层语义融入表示。大语言模型的能力并不只来自 Transformer 结构，还来自数据、训练目标、规模和后训练，但注意力是其中关键的计算基础。

## 总结

理解 Transformer 可以抓住一条主线：注意力在位置之间交换信息，多头提供多个表示子空间，位置编码补充顺序，前馈网络逐位置变换，残差与归一化帮助深层训练。沿着这条主线，再看不同模型的结构变化会清晰很多。
