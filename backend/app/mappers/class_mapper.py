# -*- coding: utf-8 -*-
"""
班级数据映射层
"""
from app.config import Config
from app.mappers.excel_storage import ExcelStorage
from app.entity.class_info import ClassInfo


class ClassMapper:
    """班级数据映射器"""
    
    COLUMNS = ['id', 'name', 'description', 'created_at', 'updated_at']
    
    def __init__(self):
        self.storage = ExcelStorage(Config.CLASSES_FILE, self.COLUMNS)
    
    def find_all(self):
        """获取所有班级"""
        data = self.storage.read_all()
        return [ClassInfo.from_dict(item) for item in data]
    
    def find_by_id(self, id):
        """根据 ID 查找班级"""
        data = self.storage.find_by_id(id)
        return ClassInfo.from_dict(data) if data else None
    
    def find_by_name(self, name):
        """根据名称查找班级"""
        results = self.storage.find_by_field('name', name)
        return ClassInfo.from_dict(results[0]) if results else None
    
    def insert(self, class_info):
        """插入班级记录"""
        if isinstance(class_info, ClassInfo):
            data = class_info.to_dict()
        else:
            data = class_info
        self.storage.insert(data)
        return data
    
    def update(self, id, data):
        """更新班级记录"""
        if isinstance(data, ClassInfo):
            data = data.to_dict()
        return self.storage.update(id, data)
    
    def delete(self, id):
        """删除班级记录"""
        return self.storage.delete(id)
    
    def exists_by_name(self, name, exclude_id=None):
        """检查班级名称是否已存在"""
        class_info = self.find_by_name(name)
        if class_info is None:
            return False
        if exclude_id and class_info.id == exclude_id:
            return False
        return True
    
    def count(self):
        """获取班级总数"""
        return self.storage.count()


# 单例实例
class_mapper = ClassMapper()
