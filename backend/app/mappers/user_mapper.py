# -*- coding: utf-8 -*-
"""
用户数据映射层
"""
from app.config import Config
from app.mappers.excel_storage import ExcelStorage
from app.entity.user import User
from werkzeug.security import generate_password_hash


class UserMapper:
    """用户数据映射器"""
    
    COLUMNS = ['id', 'username', 'password_hash', 'created_at']
    
    def __init__(self):
        self.storage = ExcelStorage(Config.USERS_FILE, self.COLUMNS)
        self._init_default_users()
    
    def _init_default_users(self):
        """初始化默认测试账号"""
        # 检查是否已有用户
        if self.storage.count() == 0:
            # 创建默认管理员账号
            admin = User(username='admin')
            admin.set_password('admin123')
            self.storage.insert(admin.to_dict(include_password=True))
    
    def find_all(self):
        """获取所有用户"""
        data = self.storage.read_all()
        return [User.from_dict(item) for item in data]
    
    def find_by_id(self, id):
        """根据 ID 查找用户"""
        data = self.storage.find_by_id(id)
        return User.from_dict(data) if data else None
    
    def find_by_username(self, username):
        """根据用户名查找用户"""
        results = self.storage.find_by_field('username', username)
        return User.from_dict(results[0]) if results else None
    
    def insert(self, user):
        """插入用户记录"""
        if isinstance(user, User):
            data = user.to_dict(include_password=True)
        else:
            data = user
        self.storage.insert(data)
        return data
    
    def update(self, id, data):
        """更新用户记录"""
        if isinstance(data, User):
            data = data.to_dict(include_password=True)
        return self.storage.update(id, data)
    
    def delete(self, id):
        """删除用户记录"""
        return self.storage.delete(id)


# 单例实例
user_mapper = UserMapper()
