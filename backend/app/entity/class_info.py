# -*- coding: utf-8 -*-
"""
班级实体类
"""
import uuid
from datetime import datetime


class ClassInfo:
    """班级实体"""
    
    def __init__(self, id=None, name=None, description=None,
                 created_at=None, updated_at=None):
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description or ''
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        """从字典创建实例"""
        return cls(
            id=data.get('id'),
            name=data.get('name'),
            description=data.get('description'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    @staticmethod
    def validate(data, is_update=False):
        """验证班级数据"""
        errors = []
        
        # 班级名称验证（更新时如果没有提供 name 则跳过验证）
        if is_update and 'name' not in data:
            pass
        elif not data.get('name'):
            errors.append('班级名称不能为空')
        elif len(data['name']) > 50:
            errors.append('班级名称不能超过50个字符')
        
        return len(errors) == 0, errors
