# -*- coding: utf-8 -*-
"""
日志配置模块
"""
import os
import logging
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger


def setup_logger(app):
    """配置应用日志"""
    log_dir = app.config.get('LOG_DIR', 'logs')
    log_file = app.config.get('LOG_FILE', os.path.join(log_dir, 'app.log'))
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    
    # 确保日志目录存在
    os.makedirs(log_dir, exist_ok=True)
    
    # 创建日志格式
    log_format = '%(asctime)s %(levelname)s %(name)s %(message)s'
    json_format = jsonlogger.JsonFormatter(log_format)
    
    # 文件处理器（JSON 格式，支持日志轮转）
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(json_format)
    file_handler.setLevel(getattr(logging, log_level))
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format))
    console_handler.setLevel(getattr(logging, log_level))
    
    # 配置应用日志
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(getattr(logging, log_level))
    
    # 配置 werkzeug 日志
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.addHandler(file_handler)
    werkzeug_logger.setLevel(logging.WARNING)


def get_logger(name):
    """获取指定名称的日志记录器"""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s %(name)s %(message)s'
        ))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
