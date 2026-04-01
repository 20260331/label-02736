# -*- coding: utf-8 -*-
"""
认证服务层
"""
import jwt
from datetime import datetime, timedelta
from app.config import Config
from app.mappers.user_mapper import user_mapper
from app.mappers.operation_log_mapper import operation_log_mapper
from app.entity.operation_log import OperationLog
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthService:
    """认证服务"""
    
    def __init__(self):
        self.user_mapper = user_mapper
        self.log_mapper = operation_log_mapper
    
    def validate_credentials(self, username, password):
        """验证用户凭据"""
        user = self.user_mapper.find_by_username(username)
        if user is None:
            logger.warning(f'Login failed: user not found - {username}')
            return None
        
        if not user.check_password(password):
            logger.warning(f'Login failed: invalid password - {username}')
            return None
        
        logger.info(f'Login successful: {username}')
        return user
    
    def create_token(self, user):
        """创建 JWT Token"""
        payload = {
            'user_id': user.id,
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        return token
    
    def verify_token(self, token):
        """验证 JWT Token"""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning('Token expired')
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f'Invalid token: {e}')
            return None
    
    def login(self, username, password):
        """用户登录"""
        user = self.validate_credentials(username, password)
        if user is None:
            return None, '用户名或密码错误'
        
        token = self.create_token(user)
        
        # 记录登录日志
        log = OperationLog(
            user_id=user.id,
            username=user.username,
            action=OperationLog.ACTION_LOGIN,
            target_type=OperationLog.TARGET_USER,
            target_id=user.id,
            details={'ip': 'unknown'}
        )
        self.log_mapper.insert(log)
        
        return {
            'token': token,
            'user': user.to_dict()
        }, None
    
    def logout(self, user_id, username):
        """用户退出"""
        # 记录退出日志
        log = OperationLog(
            user_id=user_id,
            username=username,
            action=OperationLog.ACTION_LOGOUT,
            target_type=OperationLog.TARGET_USER,
            target_id=user_id
        )
        self.log_mapper.insert(log)
        logger.info(f'User logged out: {username}')
        return True
    
    def get_user_by_id(self, user_id):
        """根据 ID 获取用户"""
        return self.user_mapper.find_by_id(user_id)


# 单例实例
auth_service = AuthService()
