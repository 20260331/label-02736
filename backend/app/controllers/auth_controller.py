# -*- coding: utf-8 -*-
"""
认证控制器
"""
import re
from functools import wraps
from flask import Blueprint, request, g
from app.services.auth_service import auth_service
from app.utils.response import success_response, error_response
from app.exceptions.handlers import AuthError, ValidationError

auth_bp = Blueprint('auth', __name__)

# 输入验证正则
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_]{3,20}$')
PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 50


def sanitize_input(value):
    """清理输入，防止注入攻击"""
    if value is None:
        return ''
    if not isinstance(value, str):
        return str(value)
    # 移除控制字符和潜在危险字符
    value = re.sub(r'[\x00-\x1f\x7f]', '', value)
    return value.strip()


def validate_username(username):
    """验证用户名格式"""
    if not username:
        return False, '用户名不能为空'
    if not USERNAME_PATTERN.match(username):
        return False, '用户名只能包含字母、数字和下划线，长度3-20个字符'
    return True, None


def validate_password(password):
    """验证密码格式"""
    if not password:
        return False, '密码不能为空'
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f'密码长度不能少于{PASSWORD_MIN_LENGTH}个字符'
    if len(password) > PASSWORD_MAX_LENGTH:
        return False, f'密码长度不能超过{PASSWORD_MAX_LENGTH}个字符'
    return True, None


def login_required(f):
    """登录验证装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            raise AuthError('请先登录')
        
        payload = auth_service.verify_token(token)
        if payload is None:
            raise AuthError('登录已过期，请重新登录')
        
        # 将用户信息存入 g 对象
        g.user_id = payload.get('user_id')
        g.username = payload.get('username')
        
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data:
        raise ValidationError('请求数据不能为空')
    
    # 清理和验证输入
    username = sanitize_input(data.get('username', ''))
    password = data.get('password', '')  # 密码不做 sanitize，保持原样
    
    # 验证用户名
    valid, error = validate_username(username)
    if not valid:
        raise ValidationError(error)
    
    # 验证密码
    valid, error = validate_password(password)
    if not valid:
        raise ValidationError(error)
    
    result, error = auth_service.login(username, password)
    
    if error:
        return error_response(error, 'AUTH_FAILED', status_code=401)
    
    return success_response(result, '登录成功')


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """用户退出"""
    auth_service.logout(g.user_id, g.username)
    return success_response(message='退出成功')


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    """检查认证状态"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return success_response({'authenticated': False})
    
    payload = auth_service.verify_token(token)
    if payload is None:
        return success_response({'authenticated': False})
    
    user = auth_service.get_user_by_id(payload.get('user_id'))
    if user is None:
        return success_response({'authenticated': False})
    
    return success_response({
        'authenticated': True,
        'user': user.to_dict()
    })
