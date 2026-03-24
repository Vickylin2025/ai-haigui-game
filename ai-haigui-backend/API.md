# AI 海龟汤后端 API 文档

## 概述

AI 海龟汤后端服务提供以下接口，用于支持前端游戏应用。

## 接口列表

### 1. GET /

*   **描述**: 获取服务基本信息和可用接口列表。
*   **URL**: `http://localhost:3001/`
*   **方法**: `GET`
*   **请求参数**: 无
*   **响应示例 (200 OK)**:
    ```json
    {
        "service": "AI Haigui Game Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "test": "/api/test (GET)",
            "chat": "/api/chat (POST)"
        },
        "message": "Welcome to the AI Haigui Game Backend!"
    }
    ```

### 2. GET /api/test

*   **描述**: 测试后端服务是否正常运行。
*   **URL**: `http://localhost:3001/api/test`
*   **方法**: `GET`
*   **请求参数**: 无
*   **响应示例 (200 OK)**:
    ```json
    {
        "message": "Backend is working!",
        "timestamp": "2023-10-27T08:00:00.000Z"
    }
    ```

### 3. POST /api/chat

*   **描述**: 与 AI 进行对话，获取海龟汤问题的回答。
*   **URL**: `http://localhost:3001/api/chat`
*   **方法**: `POST`
*   **请求头**:
    *   `Content-Type: application/json`
*   **请求体**: `application/json`
    ```json
    {
        "question": "这是一个关于XX的问题吗？",
        "story": {
            "id": "story-id",
            "title": "故事标题",
            "difficulty": "easy",
            "surface": "故事的汤面描述",
            "bottom": "故事的汤底真相"
        }
    }
    ```
    *   `question` (string, 必需): 玩家提出的问题。
    *   `story` (object, 必需): 包含故事标题、汤面和汤底的对象。
        *   `title` (string, 必需): 故事的标题。
        *   `bottom` (string, 必需): 故事的真相（汤底）。

*   **响应示例 (200 OK)**:
    ```json
    {
        "answer": "是",
        "rawAnswer": "是的，这是关于XX的问题。"
    }
    ```
    *   `answer` (string): AI 标准化后的回答，可能为 `"是"`, `"否"`, `"无关"`。
    *   `rawAnswer` (string): AI 的原始回答。

*   **错误响应示例 (400 Bad Request)**:
    ```json
    {
        "error": "Missing question or story details."
    }
    ```

*   **错误响应示例 (500 Internal Server Error)**:
    ```json
    {
        "error": "AI service responded with an error.",
        "details": "DeepSeek API error message or details"
    }
    ```
    或
    ```json
    {
        "error": "An unexpected server error occurred."
    }
    ```
