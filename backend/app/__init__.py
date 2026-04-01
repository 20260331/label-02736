# -*- coding: utf-8 -*-
"""
Flask 应用初始化模块
"""
from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.utils.logger import setup_logger
from app.exceptions.handlers import register_error_handlers


def create_app(config_class=Config):
    """创建并配置 Flask 应用"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # 启用 CORS - 限制允许的来源和方法
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False,
         max_age=3600)
    
    # 设置日志
    setup_logger(app)
    
    # 初始化数据文件
    from app.utils.init_data import init_all
    with app.app_context():
        init_all()
    
    # 注册错误处理器
    register_error_handlers(app)
    
    # 注册蓝图
    from app.controllers.auth_controller import auth_bp
    from app.controllers.student_controller import student_bp
    from app.controllers.statistics_controller import statistics_bp
    from app.controllers.class_controller import class_bp
    from app.controllers.grade_controller import grade_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    app.register_blueprint(class_bp, url_prefix='/api/classes')
    app.register_blueprint(grade_bp, url_prefix='/api/grades')
    
    return app
