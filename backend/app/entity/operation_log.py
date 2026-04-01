# -*- coding: utf-8 -*-
"""
操作日志实体类
"""
import uuid
import json
from datetime import datetime


class OperationLog:
    """操作日志实体"""
    
    # 操作类型常量
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'
    
    # 目标类型常量
    TARGET_STUDENT = 'student'
    TARGET_USER = 'user'
    
    def __init__(self, id=None, user_id=None, username=None, action=None,
                 target_type=None, target_id=None, details=None, created_at=None):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.username = username
        self.action = action
        self.target_type = target_type
        self.target_id = target_id
        self.details = details if isinstance(details, str) else json.dumps(details or {}, ensure_ascii=False)
        self.created_at = created_at or datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'details': self.details,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建实例"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            username=data.get('username'),
            action=data.get('action'),
            target_type=data.get('target_type'),
            target_id=data.get('target_id'),
            details=data.get('details'),
            created_at=data.get('created_at')
        )
    
    def get_details_dict(self):
        """获取详情字典"""
        if isinstance(self.details, str):
            try:
                return json.loads(self.details)
            except json.JSONDecodeError:
                return {}
        return self.details or {}
    
    def get_action_text(self):
        """获取操作类型文本"""
        action_texts = {
            self.ACTION_CREATE: '创建',
            self.ACTION_UPDATE: '更新',
            self.ACTION_DELETE: '删除',
            self.ACTION_LOGIN: '登录',
            self.ACTION_LOGOUT: '退出'
        }
        return action_texts.get(self.action, self.action)
    
    def get_target_text(self):
        """获取目标类型文本"""
        target_texts = {
            self.TARGET_STUDENT: '学生',
            self.TARGET_USER: '用户'
        }
        return target_texts.get(self.target_type, self.target_type)
