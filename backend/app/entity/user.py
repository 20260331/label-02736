# -*- coding: utf-8 -*-
"""
用户实体类
"""
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User:
    """用户实体"""
    
    def __init__(self, id=None, username=None, password_hash=None, created_at=None):
        self.id = id or str(uuid.uuid4())
        self.username = username
        self.password_hash = password_hash
        self.created_at = created_at or datetime.now().isoformat()
    
    def set_password(self, password):
        """设置密码（加密存储）"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_password=False):
        """转换为字典"""
        data = {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at
        }
        if include_password:
            data['password_hash'] = self.password_hash
        return data
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建实例"""
        return cls(
            id=data.get('id'),
            username=data.get('username'),
            password_hash=data.get('password_hash'),
            created_at=data.get('created_at')
        )
    
    @staticmethod
    def validate(data):
        """验证用户数据"""
        errors = []
        
        if not data.get('username'):
            errors.append('用户名不能为空')
        elif len(data['username']) < 3:
            errors.append('用户名至少3个字符')
        
        if not data.get('password') and not data.get('password_hash'):
            errors.append('密码不能为空')
        elif data.get('password') and len(data['password']) < 6:
            errors.append('密码至少6个字符')
        
        return len(errors) == 0, errors
