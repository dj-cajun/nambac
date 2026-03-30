# [MASTER] Nambac Project Specification

## 1. Project Overview

**Nambac** là nền tảng quiz phân tích 8 loại tính cách (Archetype) dựa trên văn hóa và xu hướng địa phương tại TP.HCM.
Hệ thống sử dụng bộ 3 AI Agents (Director, Visual Architect, Report Analyst) để tự động hóa việc sáng tạo nội dung.

## 2. Tech Stack

* **Core Logic**: OpenRouter (AI Agent Workflow)
* **Backend API**: FastAPI (Python)
* **Frontend**: React (Vite)
* **Styling**: Comic-Glass Aesthetics (Tailwind + Custom CSS)

## 3. Core Logic: 3-Bit Binary Scoring & 8 Types

Nguyên tắc cốt lõi: **"Stateless Results"** - Kết quả được tính toán ngay tại trình duyệt.

### 3.1 Scoring Mechanism

3 câu hỏi then chốt (Q1, Q2, Q3) tương ứng với trọng số ($2^0, 2^1, 2^2$). Tổng điểm (0~7) xác định Type ID.

| Câu hỏi | Vai trò (Axis) | score_a | score_b | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **Q1** | **Axis 1** | **0** | **1** | Bit 1 ($2^0$) |
| **Q2** | **Axis 2** | **0** | **2** | Bit 2 ($2^1$) |
| **Q3** | **Axis 3** | **0** | **4** | Bit 3 ($2^2$) |
| Q4~ | Bonus | 0 | 0 | Không tính điểm |

### 3.2 8 Personality Types (Archetypes)

Danh sách 8 loại tính cách dựa trên tổng điểm:

* **Type 1 (0 pts)**: b000 (Pure A)
* **Type 2 (1 pts)**: b001
* **Type 3 (2 pts)**: b010
* **Type 4 (3 pts)**: b011
* **Type 5 (4 pts)**: b100
* **Type 6 (5 pts)**: b101
* **Type 7 (6 pts)**: b110
* **Type 8 (7 pts)**: b111 (Pure B)

## 4. Development Principles

1. **Local-First**: Quản lý dữ liệu qua file JSON cục bộ.
2. **Stateless Result**: Không lưu trữ kết quả người dùng trên Server.
3. **Ho Chi Minh Focus**: Nội dung thuần Việt, phong cách Gen Z Sài Gòn.

## 5. Logs

- 2026-02-01: Hoàn thiện workflow AI Agent.
* 2026-02-06: Chuyển đổi toàn bộ hệ thống sang ngôn ngữ Tiếng Việt (Vietnamese Localization).
