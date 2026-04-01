# -*- coding: utf-8 -*-
"""
应用配置模块
"""
import os


class Config:
    """应用配置类"""
    
    # 密钥配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'student-grade-management-secret-key-2024'
    
    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_EXPIRATION_HOURS = 24
    
    # 数据文件路径
    DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    STUDENTS_FILE = os.path.join(DATA_DIR, 'students.xlsx')
    USERS_FILE = os.path.join(DATA_DIR, 'users.xlsx')
    LOGS_FILE = os.path.join(DATA_DIR, 'operation_logs.xlsx')
    CLASSES_FILE = os.path.join(DATA_DIR, 'classes.xlsx')
    
    # 日志配置
    LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    LOG_FILE = os.path.join(LOG_DIR, 'app.log')
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    
    # 分页配置
    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100
