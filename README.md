# 学生成绩管理系统

## How to Run

### Docker 方式（推荐）

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

启动后访问：http://localhost:8081

### 本地开发方式

**后端：**
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖（使用阿里云镜像）
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 启动服务
python run.py
```

**前端：**
```bash
cd frontend-admin

# 使用任意静态服务器，如 Python
python -m http.server 8081
```

## Services

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend-admin | 8081 | 前端管理界面 |
| backend | 5000 | 后端 API 服务（内部） |

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## 题目内容

学生成绩管理系统（Python + Excel）
要求： 每人独立完成，采用图形用户界面，实现学生成绩管理系统登录界面，添加学生信息，查询学生成绩、修改学生成绩、删除学生成绩、统计成绩（平均分、最高分、最低分）等学生管理系统的最基本功能，并可根据实际情况，拓展功能内容。注：学习通提交期末考核答题卡。你能在这个文件夹里完成这个系统吗

## 项目介绍

基于 Python Flask + HTML/CSS/JavaScript 的全栈学生成绩管理系统，使用 Excel 作为数据存储。

### 技术栈

- **后端**: Python 3.11 + Flask 2.3
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **数据存储**: Excel (openpyxl)
- **容器化**: Docker + Docker Compose

### Excel 数据存储说明

本项目使用 Excel 文件作为数据库，存储在 `backend/data/` 目录下：

| 文件 | 用途 |
|------|------|
| `users.xlsx` | 存储用户账号信息（用户名、密码哈希、角色等） |
| `students.xlsx` | 存储学生信息和成绩（学号、姓名、各科成绩等） |
| `operation_logs.xlsx` | 存储操作日志（增删改记录） |

系统首次启动时会自动：
1. 创建 Excel 数据文件
2. 初始化测试账号（admin/admin123）
3. 添加 10 条示例学生数据

查看 Docker 容器中的数据文件：
```bash
docker exec student-grade-backend ls -la /app/data
```

### 功能特性

- ✅ 用户登录/退出
- ✅ 添加学生信息
- ✅ 查询学生成绩（支持搜索、分页）
- ✅ 修改学生成绩
- ✅ 删除学生信息
- ✅ 成绩统计（平均分、最高分、最低分）
- ✅ 成绩排名
- ✅ 响应式界面

### 项目结构

```
├── backend/                 # 后端项目
│   ├── app/
│   │   ├── controllers/    # 控制器层
│   │   ├── services/       # 服务层
│   │   ├── mappers/        # 数据映射层
│   │   ├── entity/         # 实体层
│   │   ├── utils/          # 工具类
│   │   └── exceptions/     # 异常处理
│   ├── data/               # Excel 数据文件
│   ├── logs/               # 日志目录
│   ├── Dockerfile
│   └── requirements.txt
├── frontend-admin/          # 前端项目
│   ├── css/                # 样式文件
│   ├── js/
│   │   ├── api/           # API 调用层
│   │   ├── store/         # 状态管理
│   │   ├── views/         # 视图层
│   │   ├── components/    # 组件层
│   │   └── utils/         # 工具函数
│   ├── Dockerfile
│   └── nginx.conf
├── docs/                    # 设计文档
│   └── project_design.md
├── docker-compose.yml
├── .gitignore
└── README.md
```
